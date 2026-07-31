import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, RefreshCw } from 'lucide-react';

interface Conflict {
  id: string;
  business_id: string;
  field_name: string;
  crm_value: string | null;
  current_value: string | null;
  created_at: string;
  businesses?: { name: string | null } | null;
}

const FIELD_LABELS: Record<string, string> = {
  description: 'Description',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  logo_url: 'Logo',
  facebook_url: 'Facebook',
  instagram_url: 'Instagram',
  twitter_url: 'Twitter',
  linkedin_url: 'LinkedIn',
};

export function ImportConflictsPanel() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('business_import_conflicts')
      .select('id, business_id, field_name, crm_value, current_value, created_at, businesses(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Could not load conflicts', description: error.message, variant: 'destructive' });
    } else {
      setConflicts((data || []) as unknown as Conflict[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resolve = async (conflict: Conflict, accept: boolean) => {
    setBusyId(conflict.id);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (accept) {
        const { error } = await supabase
          .from('businesses')
          .update({ [conflict.field_name]: conflict.crm_value })
          .eq('id', conflict.business_id);
        if (error) throw error;
      }
      const { error: updateError } = await supabase
        .from('business_import_conflicts')
        .update({
          status: accept ? 'accepted' : 'dismissed',
          resolved_at: new Date().toISOString(),
          resolved_by: userData.user?.id ?? null,
        })
        .eq('id', conflict.id);
      if (updateError) throw updateError;

      setConflicts((prev) => prev.filter((c) => c.id !== conflict.id));
      toast({
        title: accept ? 'CRM value applied' : 'Conflict dismissed',
        description: accept
          ? 'The listing now shows the CRM value.'
          : 'The listing was left as the owner has it.',
      });
    } catch (err: any) {
      toast({ title: 'Could not save', description: err.message, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Owner field conflicts</CardTitle>
          <CardDescription>
            Fields the CRM wants to change but a business owner maintains. Accept to use the CRM value,
            or dismiss to leave the listing alone.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : conflicts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conflicts waiting for review.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Current (owner)</TableHead>
                <TableHead>CRM value</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conflicts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.businesses?.name || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{FIELD_LABELS[c.field_name] || c.field_name}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground" title={c.current_value || ''}>
                    {c.current_value || '—'}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate" title={c.crm_value || ''}>
                    {c.crm_value || '—'}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      disabled={busyId === c.id}
                      onClick={() => resolve(c, true)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === c.id}
                      onClick={() => resolve(c, false)}
                    >
                      <X className="h-4 w-4 mr-1" /> Dismiss
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}