import { Globe, ArrowRight, BadgeCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BusinessIcon } from './BusinessIcon';

export interface DirectoryBusiness {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  city?: string | null;
  postcode_out?: string | null;
  website?: string | null;
  logo_url?: string | null;
  images?: string[] | null;
  is_verified?: boolean | null;
  featured?: boolean | null;
  tier?: string | null;
  biz_type?: string | null;
  business_categories?: { name?: string | null; icon?: string | null } | null;
}

export const locationLine = (b: DirectoryBusiness) =>
  [b.city, b.postcode_out].filter((p) => p && String(p).trim()).join(', ');

export const cleanWebsite = (url?: string | null) =>
  (url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

const truncate = (text: string, max = 160) =>
  text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;

function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      className="h-20 w-full object-cover rounded-lg border border-border/50"
    />
  );
}

export function FeaturedResultCard({ business }: { business: DirectoryBusiness }) {
  const navigate = useNavigate();
  const href = `/business/${business.slug || business.id}`;
  const place = locationLine(business);
  const about = business.description?.trim();
  const gallery = (business.images || []).filter(Boolean).slice(0, 3);

  return (
    <article
      onClick={() => navigate(href)}
      className="cursor-pointer group rounded-2xl border-2 border-orange-200 bg-card shadow-sm hover:shadow-xl transition-shadow flex flex-col overflow-hidden"
    >
      <div className="p-6 flex gap-4 items-start bg-[hsl(40,40%,97%)]">
        <BusinessIcon business={business} size={72} />
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-orange-700 bg-orange-100 border border-orange-200 rounded-full px-2 py-0.5 mb-2">
            <Star className="h-3 w-3" /> Featured
          </span>
          <h3 className="font-heading text-xl leading-tight line-clamp-2">{business.name}</h3>
          {place && <p className="text-sm text-muted-foreground mt-1">{place}</p>}
        </div>
      </div>

      <div className="p-6 pt-4 flex-1 space-y-4">
        {about && <p className="text-sm text-muted-foreground">{truncate(about)}</p>}
        {gallery.length > 0 && (
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gallery.length}, minmax(0, 1fr))` }}>
            {gallery.map((src, i) => (
              <Thumb key={src + i} src={src} alt={`${business.name} photo ${i + 1}`} />
            ))}
          </div>
        )}
        {business.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate text-orange-600">{cleanWebsite(business.website)}</span>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t flex items-center justify-end">
        <span className="inline-flex items-center gap-1 text-sm text-orange-600 font-semibold group-hover:gap-2 transition-all">
          View listing <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}

export function VerifiedResultCard({ business }: { business: DirectoryBusiness }) {
  const navigate = useNavigate();
  const href = `/business/${business.slug || business.id}`;
  const place = locationLine(business);

  return (
    <article
      onClick={() => navigate(href)}
      className="cursor-pointer group rounded-2xl border border-border bg-card hover:shadow-md transition-shadow flex flex-col overflow-hidden"
    >
      <div className="p-5 flex gap-4 items-start">
        <BusinessIcon business={business} size={56} />
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg leading-tight line-clamp-2">{business.name}</h3>
          {place && <p className="text-sm text-muted-foreground mt-1">{place}</p>}
        </div>
      </div>
      <div className="px-5 pb-5 flex-1">
        {business.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate text-orange-600">{cleanWebsite(business.website)}</span>
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-community-green/10 text-community-green border border-community-green/30">
          <BadgeCheck className="h-3.5 w-3.5" /> Verified listing
        </span>
        <span className="inline-flex items-center gap-1 text-sm text-orange-600 font-medium group-hover:gap-2 transition-all">
          View <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}

export function RecentResultCard({ business }: { business: DirectoryBusiness }) {
  const navigate = useNavigate();
  const href = `/business/${business.slug || business.id}`;
  const place = locationLine(business);

  return (
    <article
      onClick={() => navigate(href)}
      className="cursor-pointer group rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow flex flex-col gap-2"
    >
      <h3 className="font-heading text-lg leading-tight line-clamp-2">{business.name}</h3>
      {place && <p className="text-sm text-muted-foreground">{place}</p>}
      {business.website && (
        <div className="flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate text-orange-600">{cleanWebsite(business.website)}</span>
        </div>
      )}
      <span className="mt-auto pt-3 inline-flex items-center gap-1 text-sm text-orange-600 font-medium group-hover:gap-2 transition-all">
        View <ArrowRight className="h-4 w-4" />
      </span>
    </article>
  );
}