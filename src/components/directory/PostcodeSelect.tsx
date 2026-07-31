import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { postcodeMatches } from '@/lib/postcodeMatch';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (postcode: string) => void;
  className?: string;
}

export function PostcodeSelect({ value, onChange, className }: Props) {
  const [options, setOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc('get_directory_postcodes');
      if (cancelled || error || !data) return;
      setOptions((data as { postcode: string }[]).map((r) => r.postcode).filter(Boolean));
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(
    () => options.filter((o) => postcodeMatches(o, query)),
    [options, query]
  );

  const select = (pc: string) => {
    onChange(pc);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <div
        className="flex items-center gap-2 h-14 rounded-md bg-background border border-input px-3 cursor-text"
        onClick={() => setOpen(true)}
      >
        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <Input
          value={open ? query : value}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={value || 'Your postcode'}
          aria-label="Your postcode"
          className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto text-base text-foreground"
        />
        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No matching postcodes in our distribution areas
            </p>
          ) : (
            filtered.map((pc) => (
              <button
                key={pc}
                type="button"
                onClick={() => select(pc)}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-popover-foreground hover:bg-accent"
              >
                <span>{pc}</span>
                {value === pc && <Check className="h-4 w-4 text-community-green" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}