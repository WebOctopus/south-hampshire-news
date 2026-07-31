import { useEffect, useRef, useState } from 'react';
import { Search, Tag, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Suggestion { suggestion: string; kind: string }

interface Props {
  value: string;
  onChange: (v: string) => void;
  postcode: string;
  className?: string;
}

export function KeywordAutocomplete({ value, onChange, postcode, className }: Props) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const skipNext = useRef(false);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (skipNext.current) { skipNext.current = false; return; }
    const term = value.trim();
    if (term.length < 2) { setItems([]); setSearched(false); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc('suggest_directory_keywords', {
        search_term: term,
        postcode: postcode || null,
        limit_count: 8,
      });
      if (cancelled) return;
      setItems(error || !data ? [] : (data as Suggestion[]).slice(0, 8));
      setSearched(true);
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [value, postcode]);

  const pick = (s: string) => {
    skipNext.current = true;
    onChange(s);
    setOpen(false);
  };

  const showPanel = open && value.trim().length >= 2 && searched;

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="What are you looking for?"
        aria-label="Search keyword"
        className="pl-10 h-14 text-base bg-background text-foreground"
      />

      {showPanel && (
        <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {items.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">No matching listings</p>
          ) : (
            items.map((s) => (
              <button
                key={`${s.kind}-${s.suggestion}`}
                type="button"
                onClick={() => pick(s.suggestion)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent"
              >
                {s.kind === 'business' ? (
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className={cn(
                    'flex-1 truncate text-sm text-popover-foreground',
                    s.kind === 'business' && 'font-medium'
                  )}
                >
                  {s.suggestion}
                </span>
                {s.kind === 'business' && (
                  <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-full border border-border text-muted-foreground flex-shrink-0">
                    Business
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}