import { Facebook, Instagram, Linkedin, Youtube, Music2 } from 'lucide-react';
import checkatradeAsset from '@/assets/checkatrade.png.asset.json';

export interface SocialUrls {
  facebook_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
  tiktok_url?: string | null;
  youtube_url?: string | null;
  checkatrade_url?: string | null;
}

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const CheckatradeIcon = ({ className }: { className?: string }) => (
  <img src={checkatradeAsset.url} alt="" aria-hidden="true" className={className} />
);

export const toSocialHref = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

export const getSocialLinks = (business: SocialUrls) =>
  [
    { key: 'facebook', label: 'Facebook', url: business.facebook_url, Icon: Facebook, brand: false },
    { key: 'instagram', label: 'Instagram', url: business.instagram_url, Icon: Instagram, brand: false },
    { key: 'twitter', label: 'X', url: business.twitter_url, Icon: XIcon, brand: false },
    { key: 'linkedin', label: 'LinkedIn', url: business.linkedin_url, Icon: Linkedin, brand: false },
    { key: 'tiktok', label: 'TikTok', url: business.tiktok_url, Icon: Music2, brand: false },
    { key: 'youtube', label: 'YouTube', url: business.youtube_url, Icon: Youtube, brand: false },
    { key: 'checkatrade', label: 'Checkatrade', url: business.checkatrade_url, Icon: CheckatradeIcon, brand: true },
  ].filter((s) => !!s.url && String(s.url).trim().length > 0);

interface Props {
  business: SocialUrls;
  size?: 'sm' | 'md';
  className?: string;
}

export function SocialLinks({ business, size = 'md', className = '' }: Props) {
  const socials = getSocialLinks(business);
  if (socials.length === 0) return null;

  const box = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const glyph = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const brandGlyph = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {socials.map(({ key, label, url, Icon, brand }) => (
        <a
          key={key}
          href={toSocialHref(url as string)}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          onClick={(e) => e.stopPropagation()}
          className={
            brand
              ? `inline-flex ${box} items-center justify-center rounded-full border border-community-teal/25 bg-background hover:border-community-teal transition-colors`
              : `inline-flex ${box} items-center justify-center rounded-full border border-community-teal/25 text-community-teal hover:bg-community-teal hover:text-background transition-colors`
          }
        >
          <Icon className={brand ? `${brandGlyph} object-contain` : glyph} />
        </a>
      ))}
    </div>
  );
}
