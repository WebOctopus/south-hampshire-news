import { MapPin, ArrowRight, Loader2 } from 'lucide-react';

export interface Suggestion {
  id: string;
  slug: string | null;
  name: string;
  sector: string | null;
  city: string | null;
}

interface Props {
  open: boolean;
  loading: boolean;
  term: string;
  suggestions: Suggestion[];
  locationSelected: boolean;
  onPick: (s: Suggestion) => void;
  onSeeAll: () => void;
}

export function SearchSuggestions({
  open, loading, term, suggestions, locationSelected, onPick, onSeeAll,
}: Props) {
  if (!open) return null;
  const trimmed = term.trim();
  const tooShort = trimmed.length < 2;

  return (
    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white text-foreground rounded-lg shadow-xl border border-border overflow-hidden">
      {tooShort ? (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          Keep typing to see suggestions…
        </div>
      ) : loading ? (
        <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Searching…
        </div>
      ) : suggestions.length === 0 ? (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          No matches for "{trimmed}".
        </div>
      ) : (
        <ul className="max-h-80 overflow-y-auto divide-y divide-border">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onPick(s); }}
                className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    {s.sector && <span className="truncate">{s.sector}</span>}
                    {s.city && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3" /> {s.city}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onSeeAll(); }}
        disabled={!locationSelected || tooShort}
        className="w-full px-4 py-3 text-sm font-medium border-t border-border bg-muted/40 hover:bg-muted text-left flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span>
          {locationSelected
            ? <>See all results for <span className="font-semibold">"{trimmed || '…'}"</span></>
            : 'Choose a location to see all results'}
        </span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}