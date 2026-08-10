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
  featured_image_url?: string | null;
  images?: string[] | null;
  is_verified?: boolean | null;
  featured?: boolean | null;
  advertises_in_discover?: boolean | null;
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

export function FeaturedResultCard({ business }: { business: DirectoryBusiness }) {
  const navigate = useNavigate();
  const href = `/business/${business.slug || business.id}`;
  const place = locationLine(business);
  const about = business.description?.trim();
  const photo = (business.images || []).filter(Boolean)[0] || business.featured_image_url || null;
  const initial = (business.name || '?').trim().charAt(0).toUpperCase();

  return (
    <article
      onClick={() => navigate(href)}
      className="cursor-pointer group rounded-2xl border-2 border-orange-200 bg-card shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Media banner */}
      <div className={`relative overflow-hidden bg-[hsl(40,40%,95%)] ${photo ? 'aspect-[16/9]' : 'aspect-[24/7]'}`}>
        {photo ? (
          <img
            src={photo}
            alt={`${business.name} photo`}
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : business.logo_url ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[hsl(40,45%,96%)] to-[hsl(24,60%,92%)]">
            <img
              src={business.logo_url}
              alt={`${business.name} logo`}
              loading="lazy"
              className="max-h-[60%] max-w-[70%] object-contain"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[hsl(40,45%,96%)] to-[hsl(24,60%,92%)]">
            <span className="font-heading text-6xl text-orange-300 select-none">{initial}</span>
          </div>
        )}

        {photo && <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />}

        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold rounded-full px-2.5 py-1 ${
            photo
              ? 'text-white bg-black/55 backdrop-blur-sm'
              : 'text-orange-700 bg-orange-100 border border-orange-200'
          }`}
        >
          <Star className="h-3 w-3 fill-current" /> Featured
        </span>
      </div>

      {/* Body with overlapping logo tile */}
      <div className="relative px-6 pb-5 flex-1">
        {photo && (
          <div className="absolute -top-8 left-6 rounded-xl bg-card shadow-md ring-1 ring-border p-1.5">
            <BusinessIcon business={business} size={56} />
          </div>
        )}
        <div className={photo ? 'pt-11' : 'pt-5'}>
          <h3 className="font-heading text-xl leading-tight line-clamp-2">{business.name}</h3>
          {place && <p className="text-sm text-muted-foreground mt-1">{place}</p>}
          {about && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{truncate(about, 180)}</p>}
          {business.website && (
            <div className="flex items-center gap-2 text-sm mt-3">
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate text-orange-600">{cleanWebsite(business.website)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t flex items-center justify-between gap-3">
        {business.advertises_in_discover ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-orange-700/80 truncate">
            Advertises in Discover
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-sm text-orange-600 font-semibold group-hover:gap-2 transition-all flex-shrink-0">
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