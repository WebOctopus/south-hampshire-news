import { Phone, Globe, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube, Music2 } from 'lucide-react';
import checkatradeAsset from '@/assets/checkatrade.png.asset.json';

interface Props {
  business: {
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    postcode?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    twitter_url?: string | null;
    linkedin_url?: string | null;
    tiktok_url?: string | null;
    youtube_url?: string | null;
    checkatrade_url?: string | null;
  };
}

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const toHref = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

const CheckatradeIcon = ({ className }: { className?: string }) => (
  <img src={checkatradeAsset.url} alt="" aria-hidden="true" className={className} />
);

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

  const socials = [
    { key: 'facebook', label: 'Facebook', url: business.facebook_url, Icon: Facebook },
    { key: 'instagram', label: 'Instagram', url: business.instagram_url, Icon: Instagram },
    { key: 'twitter', label: 'X', url: business.twitter_url, Icon: XIcon },
    { key: 'linkedin', label: 'LinkedIn', url: business.linkedin_url, Icon: Linkedin },
    { key: 'tiktok', label: 'TikTok', url: business.tiktok_url, Icon: Music2 },
    { key: 'youtube', label: 'YouTube', url: business.youtube_url, Icon: Youtube },
    {
      key: 'checkatrade',
      label: 'Checkatrade',
      url: business.checkatrade_url,
      Icon: CheckatradeIcon,
      brand: true,
    },
  ].filter((s) => !!s.url && s.url.trim().length > 0);

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

      {socials.length > 0 && (
        <div className="mt-4 pt-3 border-t border-community-teal/15 flex flex-wrap items-center gap-2">
          {socials.map(({ key, label, url, Icon, brand }: any) => (
            <a
              key={key}
              href={toHref(url as string)}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              title={label}
              className={
                brand
                  ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-community-teal/25 bg-background hover:border-community-teal transition-colors'
                  : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-community-teal/25 text-community-teal hover:bg-community-teal hover:text-background transition-colors'
              }
            >
              <Icon className={brand ? 'h-5 w-5 object-contain' : 'h-4 w-4'} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}