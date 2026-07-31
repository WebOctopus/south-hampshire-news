import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, X, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type KeywordEditorMode = 'admin' | 'owner-verified' | 'owner-readonly';

interface KeywordRow {
  keyword_id: string;
  term: string;
  source: string;
}

interface Props {
  businessId?: string | null;
  businessName?: string;
  mode: KeywordEditorMode;
  ownerKeywordLimit?: number;
}

export function BusinessKeywordsEditor({
  businessId,
  businessName,
  mode,
  ownerKeywordLimit = 2,
}: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<KeywordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [term, setTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<number | null>(null);

  const canEdit = mode === 'admin' || mode === 'owner-verified';

  const load = useCallback(async () => {
    if (!businessId) {
      setRows([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('business_keywords')
      .select('keyword_id, source, keywords ( term )')
      .eq('business_id', businessId);
    if (!error && data) {
      setRows(
        (data as any[])
          .map((r) => ({
            keyword_id: r.keyword_id as string,
            source: (r.source as string) || 'crm',
            term: (r.keywords?.term as string) || '',
          }))
          .filter((r) => r.term)
          .sort((a, b) => a.term.localeCompare(b.term)),
      );
    }
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const ownerCount = useMemo(() => rows.filter((r) => r.source === 'owner').length, [rows]);
  const atLimit = mode === 'owner-verified' && ownerCount >= ownerKeywordLimit;

  // Suggestions from the shared keyword list
  useEffect(() => {
    if (!canEdit) return;
    const q = term.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      const { data } = await supabase
        .from('keywords')
        .select('term')
        .ilike('normalised_term', `%${q.toLowerCase()}%`)
        .order('normalised_term')
        .limit(8);
      const existing = new Set(rows.map((r) => r.term.toLowerCase()));
      setSuggestions(
        ((data as any[]) || [])
          .map((d) => d.term as string)
          .filter((t) => !existing.has(t.toLowerCase())),
      );
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [term, canEdit, rows]);

  const addKeyword = async (value: string) => {
    const clean = value.trim().replace(/\s+/g, ' ');
    if (!clean || !businessId) return;
    if (rows.some((r) => r.term.toLowerCase() === clean.toLowerCase())) {
      setTerm('');
      setSuggestions([]);
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc('add_owner_business_keyword', {
      _business_id: businessId,
      _term: clean,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Keyword not added', description: error.message, variant: 'destructive' });
      return;
    }
    setTerm('');
    setSuggestions([]);
    await load();
  };

  const removeKeyword = async (keywordId: string) => {
    if (!businessId) return;
    setSaving(true);
    const { error } = await supabase
      .from('business_keywords')
      .delete()
      .eq('business_id', businessId)
      .eq('keyword_id', keywordId);
    setSaving(false);
    if (error) {
      toast({ title: 'Could not remove keyword', description: error.message, variant: 'destructive' });
      return;
    }
    await load();
  };

  const canRemove = (row: KeywordRow) => {
    if (mode === 'admin') return true;
    if (mode === 'owner-verified') return row.source === 'owner';
    return false;
  };

  if (!businessId) {
    return (
      <div className="space-y-2">
        <Label>Keywords</Label>
        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          Save the listing first to add keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>Keywords</Label>
        {mode === 'owner-verified' && (
          <span className="text-xs text-muted-foreground">
            {ownerCount} of {ownerKeywordLimit} used
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {!loading && rows.length === 0 && (
          <span className="text-xs text-muted-foreground italic">No keywords yet</span>
        )}
        {rows.map((row) => {
          const removable = canRemove(row);
          const isOwnerTag = row.source === 'owner';
          return (
            <Badge
              key={row.keyword_id}
              variant="outline"
              className={cn(
                'gap-1 font-normal',
                isOwnerTag
                  ? 'border-primary/40 bg-primary/10 text-foreground'
                  : 'border-border bg-muted text-muted-foreground',
              )}
            >
              {!removable && <Lock className="h-3 w-3 opacity-60" />}
              {row.term}
              {removable && (
                <button
                  type="button"
                  onClick={() => removeKeyword(row.keyword_id)}
                  disabled={saving}
                  aria-label={`Remove ${row.term}`}
                  className="rounded-full hover:bg-foreground/10"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          );
        })}
      </div>

      {mode === 'owner-readonly' && (
        <p className="text-xs text-muted-foreground">
          Claim and verify this listing to add your own keywords.
        </p>
      )}

      {canEdit && (
        <>
          <div className="flex gap-2">
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addKeyword(term);
                }
              }}
              placeholder={atLimit ? 'Keyword allowance used' : 'e.g. boiler repair'}
              maxLength={40}
              disabled={saving || atLimit}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => addKeyword(term)}
              disabled={saving || atLimit || term.trim().length < 2}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="ml-1">Add</span>
            </Button>
          </div>

          {suggestions.length > 0 && !atLimit && (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addKeyword(s)}
                  className="text-xs rounded-full border border-border px-2 py-1 hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {mode === 'owner-verified'
              ? `Up to ${ownerKeywordLimit} of your own keywords. 2–40 characters, letters, numbers, spaces, hyphens and ampersands only — and not just "${businessName || 'your business name'}".`
              : 'Keywords power directory search. Existing terms are reused rather than duplicated.'}
          </p>
        </>
      )}
    </div>
  );
}
