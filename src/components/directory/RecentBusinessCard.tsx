import { Phone, Smartphone, Globe, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatAddress } from '@/lib/businessIcon';

export interface RecentBusiness {
  id: string;
  name: string;
  slug?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  postcode?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  business_categories?: { name?: string | null; icon?: string | null } | null;
}

export function RecentBusinessCard({ business }: { business: RecentBusiness }) {
  const navigate = useNavigate();
  const href = `/business/${business.slug || business.id}`;
  return (
    <article
      onClick={() => navigate(href)}
      className="cursor-pointer group rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-lg leading-tight">{business.name}</h3>
        {business.business_categories?.name && (
          <Badge variant="outline" className="rounded-full shrink-0">
            {business.business_categories.name}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{formatAddress(business)}</p>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3 text-muted-foreground">
          {business.phone && <Phone className="h-4 w-4" />}
          {business.phone && <Smartphone className="h-4 w-4" />}
          {business.website && <Globe className="h-4 w-4" />}
          {business.email && <Mail className="h-4 w-4" />}
        </div>
        <span className="inline-flex items-center gap-1 text-sm text-orange-600 font-medium group-hover:gap-2 transition-all">
          View <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}