import { Phone, Smartphone, Globe, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { BusinessIcon } from './BusinessIcon';
import { formatAddress } from '@/lib/businessIcon';

interface Props {
  business: {
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
    <section className="bg-community-navy text-white rounded-2xl overflow-hidden">
      <div className="p-6 md:p-10 flex flex-col md:flex-row gap-6 items-start">
        <BusinessIcon business={business} size={96} className="bg-white/5 border-white/10" />
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            {business.is_verified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-community-green/20 text-community-green border border-community-green/40">
                <CheckCircle2 className="h-3 w-3" /> VERIFIED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/60 border border-white/20">
                UNVERIFIED
              </span>
            )}
          </div>
          <h1 className="font-heading text-3xl md:text-5xl leading-tight mb-2">{business.name}</h1>
          {address && <p className="text-white/60 text-sm md:text-base">{address}</p>}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-white/80">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="inline-flex items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4" /> Call
              </a>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`} className="inline-flex items-center gap-2 hover:text-white">
                <Smartphone className="h-4 w-4" /> Mobile
              </a>
            )}
            {websiteHref && (
              <a href={websiteHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="inline-flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4" /> Email
              </a>
            )}
            {directionsUrl && (
              <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <MapPin className="h-4 w-4" /> Directions
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}