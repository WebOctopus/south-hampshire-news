import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, CheckCircle2, AlertCircle, Building2, Users, XCircle } from 'lucide-react';

interface SyncResult {
  success: boolean;
  totalContacts: number;
  processed: number;
  skipped: number;
  errors: string[];
}

export function GHLSyncManagement() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    setLastSyncResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('pull-ghl-contacts');

      if (error) {
        throw error;
      }

      const result: SyncResult = {
        success: true,
        totalContacts: data?.totalContacts || 0,
        processed: data?.processed || 0,
        skipped: data?.skipped || 0,
        errors: data?.errors || []
      };

      setLastSyncResult(result);

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${result.processed} businesses from GHL.`,
      });
    } catch (error: any) {
      console.error('GHL sync error:', error);
      
      setLastSyncResult({
        success: false,
        totalContacts: 0,
        processed: 0,
        skipped: 0,
        errors: [error.message || 'Unknown error occurred']
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">GHL Contact Sync</h2>
        <p className="text-muted-foreground">
          Pull contacts from GoHighLevel and sync them to the Business Directory.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync Contacts
          </CardTitle>
          <CardDescription>
            This will fetch all contacts from GHL that have a company name and import them as businesses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync GHL Contacts
              </>
            )}
          </Button>

          {lastSyncResult && (
            <Card className={lastSyncResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  {lastSyncResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${lastSyncResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {lastSyncResult.success ? 'Sync Completed' : 'Sync Failed'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Contacts</p>
                      <p className="text-xl font-bold">{lastSyncResult.totalContacts}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Building2 className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Businesses Imported</p>
                      <p className="text-xl font-bold">{lastSyncResult.processed}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <XCircle className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Skipped (No Company)</p>
                      <p className="text-xl font-bold">{lastSyncResult.skipped}</p>
                    </div>
                  </div>
                </div>

                {lastSyncResult.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-100 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {lastSyncResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {lastSyncResult.errors.length > 5 && (
                        <li>...and {lastSyncResult.errors.length - 5} more errors</li>
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
