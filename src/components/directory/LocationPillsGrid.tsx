import { cn } from '@/lib/utils';

interface Props {
  locations: string[]; // raw edition_area strings from DB
  selected: string;
  onSelect: (location: string) => void;
  cleanAreaName: (s: string) => string;
}

// Best-effort extraction of postcodes from the cleaned area name
function extractPostcodes(name: string): string {
  const matches = name.match(/\b[A-Z]{1,2}\d{1,2}\b/g);
  return matches ? matches.join(' ') : '';
}

export function LocationPillsGrid({ locations, selected, onSelect, cleanAreaName }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {locations.map((loc) => {
        const cleaned = cleanAreaName(loc);
        const postcodes = extractPostcodes(cleaned);
        const displayName = cleaned.replace(/[\s,-]*[A-Z]{1,2}\d{1,2}.*$/i, '').trim() || cleaned;
        const active = selected === loc;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => onSelect(loc)}
            className={cn(
              'rounded-2xl border-2 px-3 py-3 text-center transition-all',
              active
                ? 'border-orange-500 bg-orange-50 shadow-sm'
                : 'border-blue-300 bg-background hover:border-blue-500 hover:shadow-sm',
            )}
          >
            <div className="font-semibold uppercase text-xs tracking-wide leading-tight">
              {displayName}
            </div>
            {postcodes && (
              <div className="text-xs text-muted-foreground mt-1">{postcodes}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}