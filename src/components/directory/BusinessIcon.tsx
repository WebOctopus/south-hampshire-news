import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { iconMap } from '@/lib/iconMap';
import { getBusinessIconUrl } from '@/lib/businessIcon';
import { cn } from '@/lib/utils';

interface Props {
  business: {
    logo_url?: string | null;
    website?: string | null;
    name?: string | null;
    business_categories?: { icon?: string | null; name?: string | null } | null;
  };
  size?: number; // pixel size
  className?: string;
}

export function BusinessIcon({ business, size = 64, className }: Props) {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : getBusinessIconUrl(business, Math.max(size * 2, 256));
  const SectorIcon = iconMap[business?.business_categories?.icon || ''] || Building2;

  return (
    <div
      className={cn(
        'flex-shrink-0 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border/50',
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={business?.name ? `${business.name} logo` : 'Business logo'}
          onError={() => setFailed(true)}
          loading="eager"
          className="w-full h-full object-contain p-1"
        />
      ) : (
        <SectorIcon className="w-1/2 h-1/2 text-muted-foreground" strokeWidth={1.5} />
      )}
    </div>
  );
}