import { useCallback, useEffect, useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import BusinessCard from '../components/BusinessCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { supabase } from '@/integrations/supabase/client';

// Helper to clean area names (remove "Area X - " prefix)
const cleanAreaName = (areaName: string): string => {
  return areaName.replace(/^Area \d+\s*-\s*/, '').trim();
};

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}


interface Business {
  id: string;
  name: string;
  description: string;
  category_id: string;
  email?: string;
  phone?: string;
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postcode: string;
  logo_url: string;
  featured_image_url: string;
  images: string[];
  is_verified: boolean;
  featured: boolean;
  owner_id?: string;
  biz_type?: string;
  business_categories?: BusinessCategory;
}

const ITEMS_PER_PAGE = 100;

const BusinessDirectory = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from('business_categories').select('*').order('name');
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    setCategories(data || []);
  }, []);

  const fetchLocations = useCallback(async () => {
    // Use RPC function to get distinct edition areas efficiently
    const { data, error } = await supabase.rpc('get_distinct_edition_areas');
    
    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }
    
    const uniqueLocations = (data?.map((row: { edition_area: string }) => row.edition_area) || []) as string[];
    uniqueLocations.sort((a, b) => cleanAreaName(a).localeCompare(cleanAreaName(b)));
    setLocations(uniqueLocations);
  }, []);

  const fetchTotalCount = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_public_businesses_count', {
      category_filter: selectedCategory !== 'all' ? selectedCategory : null,
      search_term: searchTerm || null,
      edition_area_filter: selectedLocation !== 'all' ? selectedLocation : null,
    });

    if (error) {
      console.error('Error fetching count:', error);
      return 0;
    }

    return data || 0;
  }, [searchTerm, selectedCategory, selectedLocation]);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      console.log('[BusinessDirectory] fetching businesses...');

      // Fetch count and businesses in parallel
      const [count, businessResult] = await Promise.all([
        fetchTotalCount(),
        supabase.rpc('get_public_businesses', {
          category_filter: selectedCategory !== 'all' ? selectedCategory : null,
          search_term: searchTerm || null,
          limit_count: ITEMS_PER_PAGE,
          offset_count: (currentPage - 1) * ITEMS_PER_PAGE,
          edition_area_filter: selectedLocation !== 'all' ? selectedLocation : null,
        })
      ]);

      setTotalCount(count);

      console.log('[BusinessDirectory] result', { count: businessResult.data?.length, error: businessResult.error, totalCount: count });

      if (businessResult.error) {
        console.error('Error fetching businesses:', businessResult.error);
        setError(true);
        setBusinesses([]);
        return;
      }

      const transformedData = businessResult.data?.map((business: any) => ({
        ...business,
        business_categories: business.business_categories || { name: '', icon: '' },
      })) || [];

      setBusinesses(transformedData);
    } catch (err) {
      console.error('Error in fetchBusinesses:', err);
      setError(true);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedLocation, currentPage, fetchTotalCount]);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, [fetchCategories, fetchLocations]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLocation]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of listings
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredBusinesses = businesses;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-community-navy to-community-green text-white py-8 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 md:mb-6">
              Business Directory
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-3xl mx-auto px-4">
              Discover local businesses across SO & PO postcodes. 
              Support your community and find the services you need.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto space-y-4 md:space-y-0 md:flex md:gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search businesses, services..."
                  className="pl-10 h-12 text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-12 text-black">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full md:w-56 h-12 text-black">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    <SelectValue placeholder="All Locations" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {cleanAreaName(location)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
        {/* Business Listings Section */}
        <section className="py-8 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-heading font-bold">
                {selectedCategory === 'all' ? 'Featured Businesses' : 
                 categories.find(c => c.id === selectedCategory)?.name || 'Businesses'}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                <Filter size={16} />
                <span>{totalCount} businesses found</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-community-green"></div>
                <p className="mt-4 text-gray-600">Loading businesses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">Failed to load businesses. Please try again.</p>
                <Button 
                  onClick={fetchBusinesses}
                  className="bg-community-green hover:bg-green-600"
                >
                  Retry
                </Button>
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No businesses found matching your criteria.</p>
                <Button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedLocation('all'); }}
                  className="mt-4 bg-community-green hover:bg-green-600"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredBusinesses.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} businesses
                    </p>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="hidden sm:flex items-center gap-1 mx-2">
                        {getPageNumbers().map((page, index) => (
                          typeof page === 'number' ? (
                            <Button
                              key={index}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="min-w-[36px]"
                            >
                              {page}
                            </Button>
                          ) : (
                            <span key={index} className="px-2 text-muted-foreground">
                              {page}
                            </span>
                          )
                        ))}
                      </div>

                      <span className="sm:hidden text-sm text-muted-foreground mx-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
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
            >
              Add Your Business
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessDirectory;
