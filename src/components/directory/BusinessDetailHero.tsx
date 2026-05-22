import { Phone, Globe, Mail, MapPin, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { BusinessIcon } from './BusinessIcon';
import { formatAddress } from '@/lib/businessIcon';
import { BusinessClaimButton } from '@/components/BusinessClaimButton';

interface Props {
  business: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    logo_url?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    postcode?: string | null;
    is_verified?: boolean | null;
    advertises_in_discover?: boolean | null;
    description?: string | null;
    owner_id?: string | null;
    business_categories?: { icon?: string | null; name?: string | null } | null;
  };
}

export function BusinessDetailHero({ business }: Props) {
  const address = formatAddress(business);
  const directionsUrl = address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
    : null;
  const websiteHref = business.website
    ? (business.website.startsWith('http') ? business.website : `https://${business.website}`)
    : null;

  return (
    <section className="relative overflow-hidden bg-community-teal text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 100% at 100% 50%, hsl(330 75% 40% / 0.18) 0%, transparent 60%)',
        }}
      />
      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 flex flex-col md:flex-row gap-5 md:gap-6 items-start md:items-center">
        <BusinessIcon
          business={business}
          size={80}
          className="bg-white/15 border-white/25 rounded-2xl"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {business.is_verified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-white/20 text-white border border-white/35">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-white/10 text-white/70 border border-white/20">
                Unverified
              </span>
            )}
            {business.advertises_in_discover && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-community-purple/15 text-white border border-white/25">
                <Sparkles className="h-3 w-3" /> Advertises in Discover
              </span>
            )}
          </div>
          <h1 className="font-heading text-3xl md:text-4xl leading-tight tracking-tight text-white">
            {business.name}
          </h1>
          {address && (
            <p className="mt-1 text-sm md:text-base text-white/70 font-light">{address}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="inline-flex items-center gap-1.5 bg-community-purple hover:bg-community-purple/90 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            )}
            {websiteHref && (
              <a
                href={websiteHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Globe className="h-3.5 w-3.5" /> Website
              </a>
            )}
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            )}
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" /> Directions
              </a>
            )}
            {!business.is_verified && (
              <BusinessClaimButton
                businessId={business.id}
                businessName={business.name}
                ownerId={business.owner_id ?? null}
                hideWhenPending
                triggerLabel="Apply to verify"
                triggerIcon={<ShieldCheck className="h-3.5 w-3.5" />}
                triggerClassName="inline-flex items-center gap-1.5 bg-white text-community-teal hover:bg-white/90 text-xs font-medium px-4 py-2 rounded-lg transition-colors border border-white"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}