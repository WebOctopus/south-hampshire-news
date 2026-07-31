import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import BusinessAuthPromptDialog from '@/components/BusinessAuthPromptDialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DirectoryHero } from '@/components/directory/DirectoryHero';
import { TieredResultsList } from '@/components/directory/TieredResultsList';
import type { DirectoryBusiness } from '@/components/directory/DirectoryResultCards';
import { useNoindex } from '@/hooks/useNoindex';

const ITEMS_PER_PAGE = 60;

interface Query { keyword: string; postcode: string }

const BusinessDirectory = () => {
  useNoindex();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [keyword, setKeyword] = useState('');
  const [postcode, setPostcode] = useState('');
  const [query, setQuery] = useState<Query | null>(null);

  const [businesses, setBusinesses] = useState<DirectoryBusiness[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const requestIdRef = useRef(0);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const runSearch = useCallback(async (q: Query, page: number) => {
    const thisRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(false);
    try {
      const [countResult, listResult] = await Promise.all([
        supabase.rpc('get_public_businesses_count_v2', {
          keyword: q.keyword,
          postcode: q.postcode,
        }),
        supabase.rpc('get_public_businesses_v2', {
          keyword: q.keyword,
          postcode: q.postcode,
          limit_count: ITEMS_PER_PAGE,
          offset_count: (page - 1) * ITEMS_PER_PAGE,
        }),
      ]);

      if (thisRequestId !== requestIdRef.current) return;

      if (countResult.error || listResult.error) {
        console.error('Directory search failed', countResult.error || listResult.error);
        setError(true);
        setBusinesses([]);
        setTotalCount(0);
        return;
      }

      setTotalCount((countResult.data as number) || 0);
      setBusinesses((listResult.data as DirectoryBusiness[]) || []);
    } catch (err) {
      console.error('Directory search failed', err);
      if (thisRequestId === requestIdRef.current) {
        setError(true);
        setBusinesses([]);
        setTotalCount(0);
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!query) return;
    runSearch(query, currentPage);
  }, [query, currentPage, runSearch]);

  const handleSearch = () => {
    if (!keyword.trim() || !postcode) return;
    setCurrentPage(1);
    setQuery({ keyword: keyword.trim(), postcode });
  };

  useEffect(() => {
    if (location.hash === '#add') {
      handleAddBusinessClick();
      window.history.replaceState(null, '', location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const handleAddBusinessClick = () => {
    if (user) navigate('/dashboard');
    else setShowAuthDialog(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, '...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push('...', totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen no-select">
      <Navigation />
      <main>
        <DirectoryHero
          keyword={keyword}
          onKeywordChange={setKeyword}
          postcode={postcode}
          onPostcodeChange={setPostcode}
          onSearch={handleSearch}
        />

        <section id="all-results" className="py-8 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {query && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold">
                  Results for “{query.keyword}” near {query.postcode}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground text-sm md:text-base">
                  <Filter size={16} />
                  <span>{totalCount} businesses found</span>
                </div>
              </div>
            )}

            {!query ? (
              <div className="text-center py-16 bg-muted/40 rounded-lg border-2 border-dashed border-border">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start your search</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter what you're looking for and choose your postcode above. Both are needed so
                  we can show businesses that serve your area.
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-community-green"></div>
                <p className="mt-4 text-muted-foreground">Searching local businesses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  Something went wrong loading results. Please try again.
                </p>
                <Button onClick={() => runSearch(query, currentPage)} className="bg-community-green hover:bg-green-600">
                  Retry
                </Button>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No listings match “{query.keyword}” near {query.postcode}.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Try a broader keyword or a neighbouring postcode.
                </p>
              </div>
            ) : (
              <>
                <TieredResultsList businesses={businesses} />

                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} businesses
                    </p>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="gap-1">
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Button>
                      <div className="hidden sm:flex items-center gap-1 mx-2">
                        {getPageNumbers().map((page, index) =>
                          typeof page === 'number' ? (
                            <Button
                              key={index}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="min-w-[36px]"
                            >
                              {page}
                            </Button>
                          ) : (
                            <span key={index} className="px-2 text-muted-foreground">{page}</span>
                          )
                        )}
                      </div>
                      <span className="sm:hidden text-sm text-muted-foreground mx-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="gap-1">
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="py-12 md:py-16 bg-community-green text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 md:mb-6">
              List Your Business
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Join our directory and connect with local customers in your area.
              Boost your visibility and grow your business.
            </p>
            <Button
              size="lg"
              className="bg-white text-community-green hover:bg-gray-100 px-6 md:px-8 py-3 text-base md:text-lg font-medium"
              onClick={handleAddBusinessClick}
            >
              Add Your Business
            </Button>
          </div>
        </section>
      </main>
      <Footer />

      <BusinessAuthPromptDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default BusinessDirectory;
