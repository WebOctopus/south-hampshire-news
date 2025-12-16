import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, CheckCircle2, AlertCircle, Building2, Users, XCircle, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SyncResult {
  success: boolean;
  totalContacts: number;
  processed: number;
  skipped: number;
  errors: string[];
  hasMore: boolean;
  lastTimestamp: number | null;
}

interface CumulativeResult {
  totalContacts: number;
  processed: number;
  skipped: number;
  errors: string[];
}

export function GHLSyncManagement() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [cumulativeResult, setCumulativeResult] = useState<CumulativeResult | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSync = async (resumeFrom?: number | null) => {
    setIsSyncing(true);
    
    // If starting fresh, reset cumulative results
    if (!resumeFrom) {
      setCumulativeResult(null);
      setLastTimestamp(null);
    }

    try {
      const { data, error } = await supabase.functions.invoke('pull-ghl-contacts', {
        body: {
          limit: 500,
          startAfter: resumeFrom || null,
        }
      });

      if (error) {
        throw error;
      }

      const result: SyncResult = {
        success: true,
        totalContacts: data?.results?.total_contacts_fetched || 0,
        processed: data?.results?.businesses_processed || 0,
        skipped: data?.results?.skipped_no_company || 0,
        errors: data?.results?.errors || [],
        hasMore: data?.hasMore || false,
        lastTimestamp: data?.lastTimestamp || null,
      };

      setLastSyncResult(result);
      setLastTimestamp(result.lastTimestamp);

      // Update cumulative results
      setCumulativeResult(prev => ({
        totalContacts: (prev?.totalContacts || 0) + result.totalContacts,
        processed: (prev?.processed || 0) + result.processed,
        skipped: (prev?.skipped || 0) + result.skipped,
        errors: [...(prev?.errors || []), ...result.errors],
      }));

      toast({
        title: result.hasMore ? "Batch Complete" : "Sync Complete",
        description: result.hasMore 
          ? `Processed ${result.processed} businesses. Click "Continue Sync" for more.`
          : `Successfully synced ${result.processed} businesses from GHL.`,
      });
    } catch (error: any) {
      console.error('GHL sync error:', error);
      
      setLastSyncResult({
        success: false,
        totalContacts: 0,
        processed: 0,
        skipped: 0,
        errors: [error.message || 'Unknown error occurred'],
        hasMore: false,
        lastTimestamp: null,
      });

      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync contacts from GHL.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const displayResults = cumulativeResult || (lastSyncResult && {
    totalContacts: lastSyncResult.totalContacts,
    processed: lastSyncResult.processed,
    skipped: lastSyncResult.skipped,
    errors: lastSyncResult.errors,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">GHL Contact Sync</h2>
        <p className="text-muted-foreground">
          Pull contacts from GoHighLevel and sync them to the Business Directory. Processes 500 contacts per batch to avoid timeouts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync Contacts
          </CardTitle>
          <CardDescription>
            This will fetch contacts from GHL that have a company name and import them as businesses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleSync()} 
              disabled={isSyncing}
              size="lg"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Start Fresh Sync
                </>
              )}
            </Button>

            {lastSyncResult?.hasMore && lastTimestamp && !isSyncing && (
              <Button 
                onClick={() => handleSync(lastTimestamp)} 
                variant="secondary"
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" />
                Continue Sync
              </Button>
            )}
          </div>

          {isSyncing && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Processing contacts... This may take 30-60 seconds.</p>
              <Progress value={undefined} className="w-full" />
            </div>
          )}

          {displayResults && (
            <Card className={lastSyncResult?.success !== false ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  {lastSyncResult?.success !== false ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${lastSyncResult?.success !== false ? 'text-green-800' : 'text-red-800'}`}>
                    {lastSyncResult?.hasMore ? 'Batch Complete - More Available' : 
                     lastSyncResult?.success !== false ? 'Sync Completed' : 'Sync Failed'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contacts Fetched</p>
                      <p className="text-xl font-bold">{displayResults.totalContacts}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Building2 className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Businesses Imported</p>
                      <p className="text-xl font-bold">{displayResults.processed}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <XCircle className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Skipped (No Company)</p>
                      <p className="text-xl font-bold">{displayResults.skipped}</p>
                    </div>
                  </div>
                </div>

                {lastSyncResult?.hasMore && (
                  <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-800">
                      More contacts available. Click "Continue Sync" to process the next batch.
                    </p>
                  </div>
                )}

                {displayResults.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-100 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {displayResults.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {displayResults.errors.length > 5 && (
                        <li>...and {displayResults.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
