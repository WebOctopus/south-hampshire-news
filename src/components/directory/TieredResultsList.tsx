import { Fragment } from 'react';
import {
  DirectoryBusiness,
  FeaturedResultCard,
  VerifiedResultCard,
  RecentResultCard,
} from './DirectoryResultCards';

const TIER_ORDER = ['featured', 'verified', 'recent'] as const;
type Tier = (typeof TIER_ORDER)[number];

const TIER_META: Record<Tier, { label: string; note?: string; cols: string }> = {
  featured: {
    label: 'Featured',
    note: 'Businesses advertising with Discover Magazines',
    cols: 'grid-cols-1 md:grid-cols-2',
  },
  verified: {
    label: 'Verified',
    note: 'Owners have claimed and confirmed these listings',
    cols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  recent: {
    label: 'More local listings',
    note: 'Not yet claimed by their owners',
    cols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
};

const tierOf = (b: DirectoryBusiness): Tier => {
  const t = (b.tier || '').toLowerCase();
  if (t === 'featured' || t === 'verified' || t === 'recent') return t;
  if (b.featured) return 'featured';
  if (b.is_verified) return 'verified';
  return 'recent';
};

export function TieredResultsList({ businesses }: { businesses: DirectoryBusiness[] }) {
  return (
    <div className="space-y-10">
      {TIER_ORDER.map((tier) => {
        const rows = businesses.filter((b) => tierOf(b) === tier);
        if (rows.length === 0) return null;
        const meta = TIER_META[tier];
        return (
          <Fragment key={tier}>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-3 mb-5 border-b border-border">
                <h3 className="font-heading text-xl">{meta.label}</h3>
                {meta.note && <p className="text-sm text-muted-foreground">{meta.note}</p>}
                <span className="ml-auto text-sm text-muted-foreground">{rows.length}</span>
              </div>
              <div className={`grid gap-4 md:gap-6 ${meta.cols}`}>
                {rows.map((b) =>
                  tier === 'featured' ? (
                    <FeaturedResultCard key={b.id} business={b} />
                  ) : tier === 'verified' ? (
                    <VerifiedResultCard key={b.id} business={b} />
                  ) : (
                    <RecentResultCard key={b.id} business={b} />
                  )
                )}
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}