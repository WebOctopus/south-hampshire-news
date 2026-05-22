import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchSuggestions, type Suggestion } from './SearchSuggestions';

interface Props {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  selectedLocation: string;
  onLocationChange: (v: string) => void;
  locations: string[];
  cleanAreaName: (s: string) => string;
  onSearch: () => void;
  suggestions: Suggestion[];
  suggestionsLoading: boolean;
  suggestionsOpen: boolean;
  onSuggestionsOpenChange: (open: boolean) => void;
  onSuggestionPick: (s: Suggestion) => void;
}

export function DirectoryHero({
  searchTerm, onSearchChange, selectedLocation, onLocationChange,
  locations, cleanAreaName, onSearch,
  suggestions, suggestionsLoading, suggestionsOpen, onSuggestionsOpenChange, onSuggestionPick,
}: Props) {
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
          Search on any keyword and select <strong className="text-white">Location</strong> based on our Discover Magazine distribution areas. <strong className="text-white">Both are required</strong> to tailor the result!
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); onSearch(); }}
          className="flex flex-col md:flex-row gap-3 max-w-4xl"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search businesses, services, keywords..."
              className="pl-10 h-14 text-black bg-white border-0 text-base"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => onSuggestionsOpenChange(true)}
              onBlur={() => setTimeout(() => onSuggestionsOpenChange(false), 150)}
              onKeyDown={(e) => { if (e.key === 'Escape') onSuggestionsOpenChange(false); }}
            />
            <SearchSuggestions
              open={suggestionsOpen}
              loading={suggestionsLoading}
              term={searchTerm}
              suggestions={suggestions}
              locationSelected={selectedLocation !== 'all'}
              onPick={onSuggestionPick}
              onSeeAll={() => { onSuggestionsOpenChange(false); onSearch(); }}
            />
          </div>
          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger className="w-full md:w-64 h-14 text-black bg-white border-0">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-muted-foreground" />
                <SelectValue placeholder="Your location" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">Your location</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{cleanAreaName(loc)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="lg" className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white">
            <Search className="h-5 w-5 mr-2" /> Search
          </Button>
        </form>
        <p className="text-white/50 text-xs mt-3">
          Keyword and location are both required to search.
        </p>
      </div>
    </section>
  );
}