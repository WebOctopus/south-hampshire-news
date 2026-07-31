import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, FileSpreadsheet, ShieldAlert, Star, Trash2 } from 'lucide-react';

interface FeaturedPreview {
  submitted: number;
  willFeature: number;
  alreadyFeatured: number;
  willUnfeature: number;
  currentlyFeatured: number;
  percentUnfeatured: number;
  thresholdPercent: number;
  exceedsThreshold: boolean;
  unfeatureList: { name: string; crmId: string }[];
  inactiveMatches: { name: string; crmId: string }[];
  inactiveCount: number;
  unmatched: string[];
  unmatchedCount: number;
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      out.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  out.push(current);
  return out;
}

const ID_HEADERS = ['crm company id', 'company id', 'crm id', 'record id', 'mirola company id'];

/** Reads only the Company ID column from a Mirola CSV export. */
function extractIdsFromCSV(text: string): string[] {
  const records: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') inQuotes = !inQuotes;
    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current.trim()) records.push(current);
      current = '';
      if (char === '\r' && text[i + 1] === '\n') i++;
    } else {
      current += char;
    }
  }
  if (current.trim()) records.push(current);
  if (records.length === 0) throw new Error('CSV file is empty');

  const headers = parseCSVLine(records[0]).map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const idx = headers.findIndex((h) => ID_HEADERS.includes(h));
  if (idx === -1) throw new Error('No "Company ID" column found in this file');

  const ids: string[] = [];
  for (let i = 1; i < records.length; i++) {
    const value = (parseCSVLine(records[i])[idx] ?? '').trim().replace(/^"|"$/g, '');
    if (value) ids.push(value);
  }
  return Array.from(new Set(ids));
}

export function FeaturedAdvertisersImport() {
  const [ids, setIds] = useState<string[]>([]);
  const [pasted, setPasted] = useState('');
  const [preview, setPreview] = useState<FeaturedPreview | null>(null);
  const [result, setResult] = useState<{ featured: number; unfeatured: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const reset = () => {
    setIds([]);
    setPasted('');
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsedIds = extractIdsFromCSV(await file.text());
      setIds(parsedIds);
      setPasted('');
      setPreview(null);
      setResult(null);
      toast({ title: 'File loaded', description: `${parsedIds.length} Company IDs found.` });
    } catch (err: any) {
      toast({ title: 'Could not read file', description: err.message, variant: 'destructive' });
    }
  };

  const effectiveIds = () => {
    if (pasted.trim()) {
      return Array.from(new Set(pasted.split(/\r?\n/).map((v) => v.trim()).filter(Boolean)));
    }
    return ids;
  };

  const call = async (mode: 'featured-preview' | 'featured-apply', force = false) => {
    const crmIds = effectiveIds();
    if (crmIds.length === 0) {
      toast({ title: 'Nothing to process', description: 'Upload a CSV or paste Company IDs first.', variant: 'destructive' });
      return null;
    }
    const { data, error } = await supabase.functions.invoke('import-directory-csv', {
      body: { mode, crmIds, force },
    });
    if (error) throw new Error(error.message);
    if (data?.error && !data?.blocked) throw new Error(data.error);
    return data;
  };

  const runPreview = async () => {
    setBusy(true);
    setResult(null);
    try {
      const data = await call('featured-preview');
      if (data) setPreview(data as FeaturedPreview);
    } catch (err: any) {
      toast({ title: 'Preview failed', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const runApply = async (force: boolean) => {
    setBusy(true);
    try {
      const data = await call('featured-apply', force);
      if (!data) return;
      if (data.blocked) {
        toast({ title: 'Blocked by safety guard', description: data.error, variant: 'destructive' });
        return;
      }
      setResult({ featured: data.featured, unfeatured: data.unfeatured });
      setPreview(null);
      toast({
        title: 'Featured advertisers updated',
        description: `${data.featured} featured, ${data.unfeatured} unfeatured.`,
      });
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const count = effectiveIds().length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" /> Set featured advertisers
        </CardTitle>
        <CardDescription>
          Upload the CRM export filtered to Current Advertiser, or paste Company IDs one per line.
          The list is the complete set — anyone not on it stops being featured.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFile} className="hidden" id="featured-csv" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={busy}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Choose CSV file
          </Button>
          <Button onClick={runPreview} disabled={busy || count === 0}>
            {busy ? 'Working…' : 'Preview changes'}
          </Button>
          {(count > 0 || preview || result) && (
            <Button variant="ghost" onClick={reset} disabled={busy}>
              <Trash2 className="h-4 w-4 mr-2" /> Clear
            </Button>
          )}
          {count > 0 && (
            <span className="text-sm text-muted-foreground">{count} Company IDs ready</span>
          )}
        </div>

        <Textarea
          value={pasted}
          onChange={(e) => { setPasted(e.target.value); setPreview(null); setResult(null); }}
          placeholder="Or paste Company IDs here, one per line"
          rows={4}
          disabled={busy}
        />

        {preview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Will become featured" value={preview.willFeature} />
              <Stat label="Already featured" value={preview.alreadyFeatured} />
              <Stat label="Will stop being featured" value={preview.willUnfeature} />
              <Stat label="Matched but switched off" value={preview.inactiveCount} />
              <Stat label="No match in directory" value={preview.unmatchedCount} />
            </div>

            {preview.exceedsThreshold && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>
                  This would unfeature {preview.percentUnfeatured}% of currently featured listings
                </AlertTitle>
                <AlertDescription>
                  That is above the {preview.thresholdPercent}% safety threshold. Check the file is
                  complete before overriding — a truncated file would empty the Featured tier.
                </AlertDescription>
              </Alert>
            )}

            {preview.unfeatureList.length > 0 && (
              <IssueTable
                title="Will stop being featured"
                headers={['Name', 'Company ID']}
                rows={preview.unfeatureList.map((b) => [b.name, b.crmId])}
                total={preview.willUnfeature}
              />
            )}

            {preview.inactiveMatches.length > 0 && (
              <IssueTable
                title="In the directory but switched off — cannot be featured"
                headers={['Name', 'Company ID']}
                rows={preview.inactiveMatches.map((b) => [b.name, b.crmId])}
                total={preview.inactiveCount}
              />
            )}

            {preview.unmatched.length > 0 && (
              <IssueTable
                title="No match at all — never imported, most likely no in-scope area"
                headers={['Company ID']}
                rows={preview.unmatched.map((id) => [id])}
                total={preview.unmatchedCount}
              />
            )}

            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={() => runApply(preview.exceedsThreshold)}
                disabled={busy}
                variant={preview.exceedsThreshold ? 'destructive' : 'default'}
              >
                {preview.exceedsThreshold ? 'Apply anyway (override)' : 'Confirm and apply'}
              </Button>
              <span className="text-sm text-muted-foreground">
                Only the featured flag changes. Nothing else is touched.
              </span>
            </div>
          </div>
        )}

        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Featured tier updated</AlertTitle>
            <AlertDescription>
              {result.featured} newly featured, {result.unfeatured} removed from the Featured tier.
            </AlertDescription>
          </Alert>
        )}

        {!preview && !result && count > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Nothing written yet</AlertTitle>
            <AlertDescription>Run the preview and confirm before anything changes.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value.toLocaleString()}</div>
    </div>
  );
}

function IssueTable({ title, headers, rows, total }: {
  title: string; headers: string[]; rows: string[][]; total: number;
}) {
  return (
    <div>
      <h4 className="font-medium mb-2">
        {title} <span className="text-muted-foreground text-sm">({total})</span>
      </h4>
      <div className="max-h-72 overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>{headers.map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>{r.map((cell, j) => <TableCell key={j} className="text-sm">{cell}</TableCell>)}</TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {total > rows.length && (
        <p className="text-xs text-muted-foreground mt-1">Showing first {rows.length} of {total}.</p>
      )}
    </div>
  );
}