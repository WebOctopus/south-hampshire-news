import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Eye, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface RemovalRequest {
  id: string;
  business_id: string;
  requester_name: string;
  requester_email: string;
  relationship: string | null;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  business?: { name: string } | null;
}

export function RemovalRequestsPanel() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<RemovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RemovalRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('business_removal_requests')
      .select('*, business:businesses(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setRequests((data || []) as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const run = async (action: 'approve' | 'reject', request: RemovalRequest) => {
    setProcessing(true);
    try {
      const { error } =
        action === 'approve'
          ? await supabase.rpc('approve_business_removal', { _request_id: request.id })
          : await supabase.rpc('reject_business_removal', { _request_id: request.id, _reason: adminNotes || null });
      if (error) throw error;

      if (action === 'approve') {
        supabase.functions
          .invoke('send-directory-notification', {
            body: { type: 'removal_approved_customer', removal_request_id: request.id },
          })
          .catch(() => undefined);
      }

      toast({
        title: action === 'approve' ? 'Listing removed' : 'Request rejected',
        description:
          action === 'approve'
            ? 'The listing is now hidden and suppressed, so the CRM import will not reinstate it.'
            : 'The listing was left untouched.',
      });
      setSelected(null);
      setAdminNotes('');
      load();
    } catch (err: any) {
      // Surface the database exception verbatim — these messages are written for admins.
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'pending')
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    if (status === 'approved')
      return <Badge variant="secondary" className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" /> Removed</Badge>;
    return <Badge variant="secondary" className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" /> Rejected</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Removal Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No removal requests yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.business?.name || 'Unknown listing'}</TableCell>
                      <TableCell>
                        <div>{r.requester_name}</div>
                        <div className="text-xs text-muted-foreground">{r.requester_email}</div>
                      </TableCell>
                      <TableCell>{r.relationship || '-'}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell>{format(new Date(r.created_at), 'dd MMM yyyy')}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelected(r);
                            setAdminNotes(r.admin_notes || '');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Removal Request</DialogTitle>
            <DialogDescription>
              Approving hides the listing and suppresses it, so the CRM import will not bring it back.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Business</Label>
                  <p className="font-medium">{selected.business?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requester</Label>
                  <p className="font-medium">{selected.requester_name}</p>
                  <p className="text-xs text-muted-foreground">{selected.requester_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Relationship</Label>
                  <p className="font-medium">{selected.relationship || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{statusBadge(selected.status)}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Reason given</Label>
                <p className="text-sm mt-1 p-2 bg-muted rounded whitespace-pre-line">{selected.reason}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="removal_admin_notes">Admin notes</Label>
                <Textarea
                  id="removal_admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Used as the reason when rejecting (optional)"
                />
              </div>

              {selected.status === 'pending' ? (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => run('approve', selected)}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" /> Approve removal
                  </Button>
                  <Button variant="destructive" onClick={() => run('reject', selected)} disabled={processing} className="flex-1">
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              ) : (
                <div className="pt-2 text-center text-muted-foreground text-sm">
                  This request has already been {selected.status === 'approved' ? 'approved' : 'rejected'}.
                  {selected.reviewed_at && (
                    <p className="text-xs mt-1">
                      Reviewed on {format(new Date(selected.reviewed_at), 'dd MMM yyyy HH:mm')}
                    </p>
                  )}
                  {selected.admin_notes && <p className="text-xs mt-1">Notes: {selected.admin_notes}</p>}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}