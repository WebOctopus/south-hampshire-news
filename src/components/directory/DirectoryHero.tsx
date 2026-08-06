import { MapPin, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostcodeSelect } from './PostcodeSelect';
import { KeywordAutocomplete } from './KeywordAutocomplete';

interface Props {
  keyword: string;
  onKeywordChange: (v: string) => void;
  postcode: string;
  onPostcodeChange: (v: string) => void;
  onSearch: () => void;
  onNewSearch?: () => void;
  hasResults?: boolean;
}


export function DirectoryHero({
  keyword, onKeywordChange, postcode, onPostcodeChange, onSearch,
}: Props) {
  const hasKeyword = keyword.trim().length > 0;
  const canSearch = hasKeyword && !!postcode;
  const hint = !hasKeyword && !postcode
    ? 'Enter a keyword and choose your postcode to search.'
    : !hasKeyword
      ? 'Add a keyword to search.'
      : !postcode
        ? 'Choose your postcode to search.'
        : '';

  return (
    <section className="relative bg-community-navy text-white overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 30% 20%, hsl(15 80% 50% / 0.4), transparent 60%)',
        }}
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-400/40 text-orange-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <MapPin className="h-3 w-3" />
          Discover Directory
        </div>
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
          Find a local business, trade,<br className="hidden md:block" />
          class or community group<br className="hidden md:block" />
          in <span className="italic text-orange-300">your area.</span>
        </h1>
        <p className="text-white/70 text-base md:text-lg max-w-2xl mb-8">
          Tell us what you're looking for and your <strong className="text-white">postcode</strong>.
          <strong className="text-white"> Both are required</strong> so we only show you businesses near you.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); if (canSearch) onSearch(); }}
          className="flex flex-col md:flex-row gap-3 max-w-4xl"
        >
          <KeywordAutocomplete
            className="flex-1"
            value={keyword}
            onChange={onKeywordChange}
            postcode={postcode}
          />
          <PostcodeSelect
            className="w-full md:w-64"
            value={postcode}
            onChange={onPostcodeChange}
          />
          <Button
            type="submit"
            size="lg"
            disabled={!canSearch}
            className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60"
          >
            <Search className="h-5 w-5 mr-2" /> Search
          </Button>
        </form>
        <p className="text-white/60 text-xs mt-3">
          {hint || 'Press Search to see businesses near you.'}
        </p>
      </div>
    </section>
  );
}