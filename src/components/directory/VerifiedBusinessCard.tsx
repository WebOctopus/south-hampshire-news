import { Phone, Smartphone, Globe, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { BusinessIcon } from './BusinessIcon';
import { formatAddress } from '@/lib/businessIcon';

export interface VerifiedBusiness {
  id: string;
  name: string;
  slug?: string | null;
  website?: string | null;
  logo_url?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  postcode?: string | null;
  biz_type?: string | null;
  advertises_in_discover?: boolean | null;
  business_categories?: { name?: string | null; icon?: string | null } | null;
}

export function VerifiedBusinessCard({ business }: { business: VerifiedBusiness }) {
  const navigate = useNavigate();
  const href = `/business/${business.slug || business.id}`;
  return (
    <article
      onClick={() => navigate(href)}
      className="cursor-pointer group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
    >
      {/* Top: icon + name + address */}
      <div className="p-5 flex gap-4 items-start bg-[hsl(40,30%,97%)]">
        <BusinessIcon business={business} size={64} />
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg leading-tight mb-2 line-clamp-2">{business.name}</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
            {formatAddress(business)}
          </p>
        </div>
      </div>

      {/* Contact rows */}
      <div className="p-5 space-y-2 text-sm border-t flex-1">
        {business.phone && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{business.phone}</span>
          </div>
        )}
        {business.website && (
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="truncate text-orange-600">{business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
          </div>
        )}
        {business.email && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="truncate text-orange-600">{business.email}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {business.advertises_in_discover && (
            <img
              src="/favicon.svg"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.png'; }}
              title="Advertises in Discover"
              alt="Advertises in Discover"
              className="w-5 h-5 rounded-full object-contain flex-shrink-0"
            />
          )}
          {business.business_categories?.name && (
            <Badge variant="outline" className="rounded-full">
              {business.business_categories.name}
            </Badge>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-sm text-orange-600 font-medium group-hover:gap-2 transition-all">
          View <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}