import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const GoCardlessTest = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-gocardless');
      
      if (error) {
        setResult({ error: error.message, type: 'error' });
      } else {
        setResult({ ...data, type: 'success' });
      }
    } catch (err: any) {
      setResult({ error: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>GoCardless API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Test GoCardless Connection'}
        </Button>
        
        {result && (
          <div className={`p-4 rounded-lg ${
            result.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};