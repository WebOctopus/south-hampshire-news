import { Phone, Smartphone, Globe, Mail, MapPin } from 'lucide-react';

interface Props {
  business: {
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    postcode?: string | null;
  };
}

export function BusinessDetailsCard({ business }: Props) {
  const websiteHref = business.website
    ? business.website.startsWith('http')
      ? business.website
      : `https://${business.website}`
    : null;
  const websiteHost = websiteHref
    ? (() => {
        try {
          return new URL(websiteHref).hostname.replace(/^www\./, '');
        } catch {
          return business.website || '';
        }
      })()
    : null;

  const rows: Array<{ key: string; icon: typeof Phone; node: React.ReactNode; on: boolean }> = [
    {
      key: 'phone',
      icon: Phone,
      on: !!business.phone,
      node: business.phone ? (
        <a href={`tel:${business.phone}`} className="text-community-purple hover:underline">
          {business.phone}
        </a>
      ) : (
        <span className="text-muted-foreground/70 italic">No phone listed</span>
      ),
    },
    {
      key: 'mobile',
      icon: Smartphone,
      on: !!business.phone,
      node: business.phone ? (
        <a href={`tel:${business.phone}`} className="text-community-purple hover:underline">
          {business.phone}
        </a>
      ) : (
        <span className="text-muted-foreground/70 italic">No mobile listed</span>
      ),
    },
    {
      key: 'web',
      icon: Globe,
      on: !!websiteHref,
      node: websiteHref ? (
        <a
          href={websiteHref}
          target="_blank"
          rel="noreferrer"
          className="text-community-purple hover:underline truncate"
        >
          {websiteHost}
        </a>
      ) : (
        <span className="text-muted-foreground/70 italic">No website</span>
      ),
    },
    {
      key: 'email',
      icon: Mail,
      on: !!business.email,
      node: business.email ? (
        <a
          href={`mailto:${business.email}`}
          className="text-community-purple hover:underline truncate"
        >
          {business.email}
        </a>
      ) : (
        <span className="text-muted-foreground/70 italic">No email listed</span>
      ),
    },
    {
      key: 'address',
      icon: MapPin,
      on: !!(business.address_line1 || business.city),
      node:
        business.address_line1 || business.city ? (
          <span className="text-foreground/85">
            {business.address_line1 && <span className="block">{business.address_line1}</span>}
            {business.address_line2 && <span className="block">{business.address_line2}</span>}
            <span className="block">
              {[business.city, business.postcode].filter(Boolean).join(', ')}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground/70 italic">No address</span>
        ),
    },
  ];

  return (
    <div className="bg-card border border-community-teal/25 rounded-xl p-5">
      <div className="text-sm">
        {rows.map(({ key, icon: Icon, node, on }) => (
          <div
            key={key}
            className="flex items-start gap-2.5 py-2 border-b border-community-teal/15 last:border-0"
          >
            <Icon
              className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                on ? 'text-community-teal' : 'text-muted-foreground/40'
              }`}
            />
            <div className="min-w-0 flex-1 leading-snug">{node}</div>
          </div>
        ))}
      </div>
    </div>
  );
}