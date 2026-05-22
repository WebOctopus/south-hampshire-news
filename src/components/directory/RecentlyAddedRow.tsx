import { useEffect, useState } from 'react';
import { Info, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RecentBusinessCard, type RecentBusiness } from './RecentBusinessCard';

interface RecentlyAddedRowProps {
  searchTerm?: string;
  selectedCategory?: string;
  selectedLocation?: string;
  selectedTag?: string;
}

export function RecentlyAddedRow({
  searchTerm = '',
  selectedCategory = 'all',
  selectedLocation = 'all',
  selectedTag = 'all',
}: RecentlyAddedRowProps = {}) {
  const [items, setItems] = useState<RecentBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase.rpc('get_recently_added_businesses', {
        limit_count: 6,
        search_term: searchTerm.trim() || undefined,
        category_filter: selectedCategory !== 'all' ? selectedCategory : undefined,
        edition_area_filter: selectedLocation !== 'all' ? selectedLocation : undefined,
        tag_filter: selectedTag !== 'all' ? selectedTag : undefined,
      });
      if (cancelled) return;
      if (!error && data) setItems(data as any);
      else if (!error) setItems([]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [searchTerm, selectedCategory, selectedLocation, selectedTag]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-2xl md:text-3xl">Recently added</h2>
          <a href="#all-results" className="text-sm text-orange-600 hover:underline inline-flex items-center gap-1">
            See more <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <p className="text-sm text-muted-foreground italic flex items-center gap-2 mb-6">
          <Info className="h-4 w-4" />
          These listings haven't yet been verified — contact details visible on their full profile.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map((b) => <RecentBusinessCard key={b.id} business={b} />)}
        </div>
      </div>
    </section>
  );
}