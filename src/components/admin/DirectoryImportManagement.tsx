import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ImportConflictsPanel } from './ImportConflictsPanel';
import {
  AlertTriangle, CheckCircle, FileSpreadsheet, ShieldAlert, Trash2, Upload,
} from 'lucide-react';

const BATCH_SIZE = 500;

interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}

interface DeactivationPreview {
  activeCount: number;
  wouldDeactivate: number;
  percent: number;
  thresholdPercent: number;
  exceedsThreshold: boolean;
  sample: string[];
}

interface ValidationReport {
  importRunId: string;
  toInsert: number;
  toUpdate: number;
  rejected: { row: number; name: string; reason: string }[];
  partiallyResolved: { row: number; name: string; kept: number[]; discarded: string[] }[];
  suppressedSkipped: { row: number; name: string }[];
  removedSkipped: { row: number; name: string }[];
  noKeywords: { row: number; name: string }[];
  newKeywords: string[];
  conflicts: { row: number; name: string; field: string; crm_value: string; current_value: string }[];
  deactivationPreview: DeactivationPreview | null;
}

interface CommitSummary {
  inserted: number;
  updated: number;
  rejected: number;
  suppressedSkipped: number;
  removedSkipped: number;
  conflictsRecorded: number;
  errors: string[];
  deactivation: {
    outcome: string;
    message: string;
    deactivated: number;
    missingBatches?: number[];
    failedBatches?: number[];
  } | null;
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

function parseCSV(text: string): ParsedCSV {
  // Handle quoted fields that contain newlines
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

  const headers = parseCSVLine(records[0]).map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < records.length; i++) {
    const values = parseCSVLine(records[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] ?? '').trim().replace(/^"|"$/g, ''); });
    rows.push(row);
  }
  return { headers, rows };
}

export function DirectoryImportManagement() {
  const [parsed, setParsed] = useState<ParsedCSV | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [summary, setSummary] = useState<CommitSummary | null>(null);
  const [phase, setPhase] = useState<'idle' | 'validating' | 'importing'>('idle');
  const [progress, setProgress] = useState(0);
  const [forcing, setForcing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const reset = () => {
    setParsed(null);
    setReport(null);
    setSummary(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = parseCSV(await file.text());
      setParsed(data);
      setReport(null);
      setSummary(null);
      toast({ title: 'CSV loaded', description: `${data.rows.length.toLocaleString()} rows ready to validate.` });
    } catch (err: any) {
      toast({ title: 'Could not read file', description: err.message, variant: 'destructive' });
    }
  };

  const runValidate = async () => {
    if (!parsed) return;
    setPhase('validating');
    setProgress(0);
    setSummary(null);

    const batches = Math.ceil(parsed.rows.length / BATCH_SIZE);
    const acc: ValidationReport = {
      importRunId: '',
      toInsert: 0,
      toUpdate: 0,
      rejected: [],
      partiallyResolved: [],
      suppressedSkipped: [],
      removedSkipped: [],
      noKeywords: [],
      newKeywords: [],
      conflicts: [],
      deactivationPreview: null,
    };

    try {
      for (let i = 0; i < batches; i++) {
        const rows = parsed.rows.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        const { data, error } = await supabase.functions.invoke('import-directory-csv', {
          body: {
            mode: 'validate',
            rows,
            batchIndex: i,
            rowOffset: i * BATCH_SIZE,
            totalBatches: batches,
            totalRows: parsed.rows.length,
            importRunId: acc.importRunId || undefined,
            isFinal: i === batches - 1,
          },
        });
        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        acc.importRunId = data.importRunId;
        acc.toInsert += data.toInsert;
        acc.toUpdate += data.toUpdate;
        acc.rejected.push(...data.rejected);
        acc.partiallyResolved.push(...data.partiallyResolved);
        acc.suppressedSkipped.push(...data.suppressedSkipped);
        acc.removedSkipped.push(...(data.removedSkipped ?? []));
        acc.noKeywords.push(...data.noKeywords);
        acc.conflicts.push(...data.conflicts);
        for (const k of data.newKeywords) if (!acc.newKeywords.includes(k)) acc.newKeywords.push(k);
        if (data.deactivationPreview) acc.deactivationPreview = data.deactivationPreview;

        setProgress(Math.round(((i + 1) / batches) * 100));
      }
      setReport({ ...acc });
      toast({ title: 'Validation complete', description: 'Nothing has been written yet. Review the report below.' });
    } catch (err: any) {
      toast({ title: 'Validation failed', description: err.message, variant: 'destructive' });
    } finally {
      setPhase('idle');
    }
  };

  const runDeactivation = async (importRunId: string, force: boolean) => {
    const { data, error } = await supabase.functions.invoke('import-directory-csv', {
      body: { mode: 'deactivate', importRunId, forceDeactivate: force },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const runCommit = async () => {
    if (!parsed || !report) return;
    setPhase('importing');
    setProgress(0);

    const batches = Math.ceil(parsed.rows.length / BATCH_SIZE);
    const acc: CommitSummary = {
      inserted: 0, updated: 0, rejected: 0, suppressedSkipped: 0, removedSkipped: 0,
      conflictsRecorded: 0, errors: [], deactivation: null,
    };

    try {
      for (let i = 0; i < batches; i++) {
        const rows = parsed.rows.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        const { data, error } = await supabase.functions.invoke('import-directory-csv', {
          body: {
            mode: 'commit',
            rows,
            batchIndex: i,
            rowOffset: i * BATCH_SIZE,
            totalBatches: batches,
            importRunId: report.importRunId,
          },
        });
        if (error) {
          acc.errors.push(`Batch ${i + 1}: ${error.message}`);
        } else if (data?.success === false) {
          acc.errors.push(`Batch ${i + 1}: ${data.error}`);
        } else if (data) {
          acc.inserted += data.inserted;
          acc.updated += data.updated;
          acc.rejected += data.rejected;
          acc.suppressedSkipped += data.suppressedSkipped;
          acc.removedSkipped += data.removedSkipped ?? 0;
          acc.conflictsRecorded += data.conflictsRecorded;
        }
        setProgress(Math.round(((i + 1) / batches) * 100));
      }

      acc.deactivation = await runDeactivation(report.importRunId, false);
      setSummary({ ...acc });
      toast({
        title: 'Import complete',
        description: `${acc.inserted} added, ${acc.updated} updated.`,
      });
    } catch (err: any) {
      setSummary({ ...acc });
      toast({ title: 'Import failed', description: err.message, variant: 'destructive' });
    } finally {
      setPhase('idle');
    }
  };

  const forceDeactivate = async () => {
    if (!report) return;
    setForcing(true);
    try {
      const result = await runDeactivation(report.importRunId, true);
      setSummary((prev) => (prev ? { ...prev, deactivation: result } : prev));
      toast({ title: 'Deactivation applied', description: result.message });
    } catch (err: any) {
      toast({ title: 'Deactivation failed', description: err.message, variant: 'destructive' });
    } finally {
      setForcing(false);
    }
  };

  const busy = phase !== 'idle';
  const preview = report?.deactivationPreview;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Directory Import</h2>
        <p className="text-muted-foreground">
          Import the CRM export into the business directory. Validation runs first and writes nothing —
          you confirm before anything changes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Upload CRM export
          </CardTitle>
          <CardDescription>
            CSV only. Every row needs a CRM company ID and at least one in-scope area (1-14).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFile} className="hidden" id="directory-csv" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={busy}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Choose CSV file
            </Button>
            <Button onClick={runValidate} disabled={!parsed || busy}>
              {phase === 'validating' ? 'Validating…' : 'Validate'}
            </Button>
            {parsed && (
              <Button variant="ghost" onClick={reset} disabled={busy}>
                <Trash2 className="h-4 w-4 mr-2" /> Clear
              </Button>
            )}
          </div>

          {parsed && (
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertTitle>File ready</AlertTitle>
              <AlertDescription>
                {parsed.rows.length.toLocaleString()} rows, {parsed.headers.length} columns.
              </AlertDescription>
            </Alert>
          )}

          {busy && <Progress value={progress} />}
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Validation report</CardTitle>
            <CardDescription>Nothing has been written yet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="To add" value={report.toInsert} />
              <Stat label="To update" value={report.toUpdate} />
              <Stat label="Rejected" value={report.rejected.length} tone={report.rejected.length ? 'warn' : undefined} />
              <Stat label="Suppressed, skipped" value={report.suppressedSkipped.length} />
              <Stat
                label="Skipped — marked Removed in CRM"
                value={report.removedSkipped.length}
                tone={report.removedSkipped.length ? 'warn' : undefined}
              />
              <Stat label="Partially resolved areas" value={report.partiallyResolved.length} />
              <Stat label="No keywords" value={report.noKeywords.length} tone={report.noKeywords.length ? 'warn' : undefined} />
              <Stat label="New keyword terms" value={report.newKeywords.length} />
              <Stat label="Owner field conflicts" value={report.conflicts.length} />
            </div>

            {report.noKeywords.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{report.noKeywords.length} listings have no keywords</AlertTitle>
                <AlertDescription>
                  They will still import, but will not surface in keyword searches.
                </AlertDescription>
              </Alert>
            )}

            {preview && (
              <Alert variant={preview.exceedsThreshold ? 'destructive' : undefined}>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>
                  {preview.wouldDeactivate.toLocaleString()} of {preview.activeCount.toLocaleString()} active
                  listings would be switched off ({preview.percent}%)
                </AlertTitle>
                <AlertDescription>
                  {preview.exceedsThreshold
                    ? `That is above the ${preview.thresholdPercent}% safety threshold, so the sweep will be skipped and offered as an explicit override after the import.`
                    : 'These are listings in the directory that are absent from this file.'}
                  {preview.sample.length > 0 && (
                    <span className="block mt-1 text-xs opacity-80">
                      e.g. {preview.sample.slice(0, 5).join(', ')}…
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {report.rejected.length > 0 && (
              <IssueTable
                title="Rejected rows"
                rows={report.rejected.slice(0, 100).map((r) => [String(r.row), r.name, r.reason])}
                headers={['Row', 'Name', 'Reason']}
                total={report.rejected.length}
              />
            )}

            {report.partiallyResolved.length > 0 && (
              <IssueTable
                title="Partially resolved areas"
                rows={report.partiallyResolved.slice(0, 100).map((r) => [
                  String(r.row), r.name, `Kept ${r.kept.join(', ')}`, `Discarded ${r.discarded.join('; ')}`,
                ])}
                headers={['Row', 'Name', 'Kept', 'Discarded']}
                total={report.partiallyResolved.length}
              />
            )}

            {report.removedSkipped.length > 0 && (
              <IssueTable
                title="Skipped — marked Removed in CRM"
                rows={report.removedSkipped.slice(0, 100).map((r) => [String(r.row), r.name])}
                headers={['Row', 'Name']}
                total={report.removedSkipped.length}
              />
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={runCommit} disabled={busy}>
                {phase === 'importing' ? 'Importing…' : 'Confirm import'}
              </Button>
              <span className="text-sm text-muted-foreground">
                This writes to the directory. Suppressed listings are never touched.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" /> Import result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Added" value={summary.inserted} />
              <Stat label="Updated" value={summary.updated} />
              <Stat label="Rejected" value={summary.rejected} />
              <Stat label="Skipped — marked Removed in CRM" value={summary.removedSkipped} />
              <Stat label="Conflicts recorded" value={summary.conflictsRecorded} />
            </div>

            {summary.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{summary.errors.length} batches failed</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 text-xs">
                    {summary.errors.slice(0, 10).map((e) => <li key={e}>{e}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {summary.deactivation && (
              <Alert variant={summary.deactivation.outcome.startsWith('skipped') ? 'destructive' : undefined}>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>
                  {summary.deactivation.outcome === 'skipped_incomplete' && 'Import incomplete, deactivation skipped'}
                  {summary.deactivation.outcome === 'skipped_volume' && 'Deactivation skipped — above safety threshold'}
                  {summary.deactivation.outcome === 'applied' && 'Deactivation applied'}
                  {summary.deactivation.outcome === 'forced' && 'Deactivation applied (override)'}
                </AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{summary.deactivation.message}</p>
                  {summary.deactivation.outcome === 'skipped_incomplete' && (
                    <p className="text-xs">
                      {summary.deactivation.failedBatches?.length
                        ? `Failed batches: ${summary.deactivation.failedBatches.map((b) => b + 1).join(', ')}. `
                        : ''}
                      {summary.deactivation.missingBatches?.length
                        ? `Missing batches: ${summary.deactivation.missingBatches.map((b) => b + 1).join(', ')}.`
                        : ''}
                    </p>
                  )}
                  {summary.deactivation.outcome === 'skipped_volume' && (
                    <Button size="sm" variant="outline" onClick={forceDeactivate} disabled={forcing}>
                      {forcing ? 'Deactivating…' : 'Deactivate anyway'}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <ImportConflictsPanel />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'warn' }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">
        {value.toLocaleString()}
        {tone === 'warn' && value > 0 && <Badge variant="secondary" className="ml-2 align-middle">review</Badge>}
      </div>
    </div>
  );
}

function IssueTable({ title, headers, rows, total }: {
  title: string; headers: string[]; rows: string[][]; total: number;
}) {
  return (
    <div>
      <h4 className="font-medium mb-2">{title} <span className="text-muted-foreground text-sm">({total})</span></h4>
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