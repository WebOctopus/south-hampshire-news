import { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VerifiedBusinessCard, type VerifiedBusiness } from './VerifiedBusinessCard';

export function VerifiedBusinessesRow() {
  const [items, setItems] = useState<VerifiedBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc('get_verified_businesses', { limit_count: 6 });
      if (cancelled) return;
      if (!error && data) setItems(data as any);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-[hsl(40,30%,98%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-community-green" />
            <h2 className="font-heading text-2xl md:text-3xl">Verified businesses</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-community-green/10 text-community-green border border-community-green/30">
              ✓ VERIFIED
            </span>
          </div>
          <Link to="?verified=true" className="text-sm text-orange-600 hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.slice(0, 3).map((b) => <VerifiedBusinessCard key={b.id} business={b} />)}
        </div>
      </div>
    </section>
  );
}