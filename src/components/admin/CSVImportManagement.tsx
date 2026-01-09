import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Download, Trash2 } from 'lucide-react';

interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}

interface ImportResult {
  batchIndex: number;
  totalBatches: number;
  processed: number;
  inserted: number;
  skipped: number;
  errors: string[];
}

interface CumulativeResult {
  totalProcessed: number;
  totalInserted: number;
  totalSkipped: number;
  allErrors: string[];
}

const COLUMN_MAPPING = [
  { csv: 'Company name', db: 'name', required: true },
  { csv: 'Street Address', db: 'address_line1', required: false },
  { csv: 'Street Address 2', db: 'address_line2', required: false },
  { csv: 'Street Address 3', db: '(appended to address_line2)', required: false },
  { csv: 'Postal Code', db: 'postcode', required: false },
  { csv: 'City', db: 'city', required: false },
  { csv: 'Company Domain Name', db: 'website', required: false },
  { csv: 'Phone Number', db: 'phone', required: false },
  { csv: 'Company Email', db: 'email', required: false },
  { csv: 'Sector', db: 'sector', required: false },
  { csv: 'Biz Type', db: 'biz_type', required: false },
  { csv: '14 Editions - Local', db: 'edition_area', required: false },
];

const BATCH_SIZE = 500;

export function CSVImportManagement() {
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [replaceAll, setReplaceAll] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [result, setResult] = useState<CumulativeResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): ParsedCSV => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    // Parse rows
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length > 0) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim().replace(/^"|"$/g, '') || '';
        });
        rows.push(row);
      }
    }

    return { headers, rows };
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    
    return result;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setParsedCSV(parsed);
      setResult(null);
      setProgress(0);
      
      toast({
        title: "CSV Loaded",
        description: `Found ${parsed.rows.length.toLocaleString()} rows ready for import.`,
      });
    } catch (error: any) {
      toast({
        title: "Parse Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!parsedCSV) return;

    setIsImporting(true);
    setProgress(0);
    
    const batches = Math.ceil(parsedCSV.rows.length / BATCH_SIZE);
    setTotalBatches(batches);

    const cumulative: CumulativeResult = {
      totalProcessed: 0,
      totalInserted: 0,
      totalSkipped: 0,
      allErrors: [],
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      for (let i = 0; i < batches; i++) {
        setCurrentBatch(i + 1);
        const start = i * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, parsedCSV.rows.length);
        const batchRows = parsedCSV.rows.slice(start, end);

        const response = await supabase.functions.invoke('import-businesses-csv', {
          body: {
            rows: batchRows,
            batchIndex: i,
            totalBatches: batches,
            replaceAll: replaceAll,
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const batchResult: ImportResult = response.data;
        cumulative.totalProcessed += batchResult.processed;
        cumulative.totalInserted += batchResult.inserted;
        cumulative.totalSkipped += batchResult.skipped;
        cumulative.allErrors.push(...batchResult.errors);

        setProgress(Math.round(((i + 1) / batches) * 100));
      }

      setResult(cumulative);
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${cumulative.totalInserted.toLocaleString()} businesses.`,
      });

    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const clearFile = () => {
    setParsedCSV(null);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const headers = COLUMN_MAPPING.map(m => m.csv).join(',');
    const blob = new Blob([headers + '\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">CSV Import</h2>
        <p className="text-muted-foreground">
          Import businesses from a CSV file. This will bulk-load data into the business directory.
        </p>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>
            Select a CSV file containing business data to import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Choose CSV File
            </Button>
            
            <Button variant="ghost" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>

            {parsedCSV && (
              <Button variant="ghost" onClick={clearFile} disabled={isImporting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {parsedCSV && (
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertTitle>File Ready</AlertTitle>
              <AlertDescription>
                {parsedCSV.rows.length.toLocaleString()} rows loaded with {parsedCSV.headers.length} columns
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Column Mapping Card */}
      <Card>
        <CardHeader>
          <CardTitle>Column Mapping</CardTitle>
          <CardDescription>
            How CSV columns will be mapped to the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CSV Column</TableHead>
                <TableHead>Database Field</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COLUMN_MAPPING.map((mapping) => {
                const found = parsedCSV?.headers.includes(mapping.csv);
                return (
                  <TableRow key={mapping.csv}>
                    <TableCell className="font-mono text-sm">{mapping.csv}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{mapping.db}</TableCell>
                    <TableCell>
                      {mapping.required ? (
                        <Badge variant="destructive">Required</Badge>
                      ) : (
                        <Badge variant="secondary">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {parsedCSV ? (
                        found ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Import Options */}
      {parsedCSV && (
        <Card>
          <CardHeader>
            <CardTitle>Import Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="replace-all">Replace All Existing Data</Label>
                <p className="text-sm text-muted-foreground">
                  {replaceAll 
                    ? "All existing businesses will be deleted before import" 
                    : "New businesses will be added alongside existing ones"}
                </p>
              </div>
              <Switch
                id="replace-all"
                checked={replaceAll}
                onCheckedChange={setReplaceAll}
                disabled={isImporting}
              />
            </div>

            {replaceAll && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This will permanently delete all existing businesses before importing. This action cannot be undone.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleImport} 
              disabled={isImporting}
              className="w-full"
              size="lg"
            >
              {isImporting ? (
                <>Importing... Batch {currentBatch} of {totalBatches}</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Start Import ({parsedCSV.rows.length.toLocaleString()} rows)
                </>
              )}
            </Button>

            {isImporting && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {progress}% complete
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className={result.allErrors.length > 0 ? "border-yellow-500" : "border-green-500"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.allErrors.length > 0 ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {result.totalInserted.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Imported</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {result.totalSkipped.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Skipped (No Name)</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {result.totalProcessed.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Processed</p>
              </div>
            </div>

            {result.allErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Errors ({result.allErrors.length})</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 max-h-40 overflow-y-auto">
                    {result.allErrors.slice(0, 10).map((error, i) => (
                      <li key={i} className="text-sm">{error}</li>
                    ))}
                    {result.allErrors.length > 10 && (
                      <li className="text-sm">...and {result.allErrors.length - 10} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {parsedCSV && !result && (
        <Card>
          <CardHeader>
            <CardTitle>Preview (First 10 Rows)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Postcode</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Edition Area</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedCSV.rows.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{row["Company name"] || '-'}</TableCell>
                      <TableCell>{row["City"] || '-'}</TableCell>
                      <TableCell>{row["Postal Code"] || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{row["Company Email"] || '-'}</TableCell>
                      <TableCell>{row["14 Editions - Local"] || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}