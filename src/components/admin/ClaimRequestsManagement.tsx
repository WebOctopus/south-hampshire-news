import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Eye, Building2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ClaimRequest {
  id: string;
  business_id: string;
  user_id: string;
  status: string;
  verification_method: string | null;
  verification_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  business?: {
    name: string;
    email: string;
    phone: string;
  };
  profile?: {
    display_name: string;
  };
}

export function ClaimRequestsManagement() {
  const { toast } = useToast();
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadClaimRequests();
  }, []);

  const loadClaimRequests = async () => {
    setLoading(true);
    try {
      // Fetch claim requests with business info
      const { data: claimsData, error: claimsError } = await supabase
        .from('business_claim_requests')
        .select(`
          *,
          business:businesses(name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (claimsError) throw claimsError;

      // Fetch profiles for user IDs
      const userIds = [...new Set((claimsData || []).map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      // Merge profile data with claims
      const mergedClaims = (claimsData || []).map(claim => ({
        ...claim,
        profile: profilesData?.find(p => p.user_id === claim.user_id) || null
      }));

      setClaims(mergedClaims as any);
    } catch (error: any) {
      console.error('Error loading claim requests:', error);
      toast({
        title: "Error",
        description: "Failed to load claim requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claim: ClaimRequest) => {
    setProcessing(true);
    try {
      // Get current user for reviewed_by
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update claim request status
      const { error: claimError } = await supabase
        .from('business_claim_requests')
        .update({
          status: 'approved',
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', claim.id);

      if (claimError) throw claimError;

      // Update business owner_id
      const { error: businessError } = await supabase
        .from('businesses')
        .update({ owner_id: claim.user_id })
        .eq('id', claim.business_id);

      if (businessError) throw businessError;

      toast({
        title: "Claim Approved",
        description: `Business ownership has been transferred to the claimant.`
      });

      setSelectedClaim(null);
      setAdminNotes('');
      loadClaimRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (claim: ClaimRequest) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('business_claim_requests')
        .update({
          status: 'rejected',
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', claim.id);

      if (error) throw error;

      toast({
        title: "Claim Rejected",
        description: "The claim request has been rejected."
      });

      setSelectedClaim(null);
      setAdminNotes('');
      loadClaimRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = claims.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Business Claim Requests</h2>
        <p className="text-muted-foreground">
          Review and manage business ownership claims from users.
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Claim Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : claims.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No claim requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Claimant</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">
                        {claim.business?.name || 'Unknown Business'}
                      </TableCell>
                      <TableCell>
                        {claim.profile?.display_name || claim.user_id.slice(0, 8) + '...'}
                      </TableCell>
                      <TableCell>
                        {claim.verification_method || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(claim.status)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(claim.created_at), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setAdminNotes(claim.admin_notes || '');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
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

      {/* Review Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Claim Request</DialogTitle>
            <DialogDescription>
              Review the claim details and approve or reject the request.
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Business</Label>
                  <p className="font-medium">{selectedClaim.business?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Claimant</Label>
                  <p className="font-medium">{selectedClaim.profile?.display_name || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Business Email</Label>
                  <p className="font-medium">{selectedClaim.business?.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Business Phone</Label>
                  <p className="font-medium">{selectedClaim.business?.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Verification Method</Label>
                  <p className="font-medium">{selectedClaim.verification_method || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{getStatusBadge(selectedClaim.status)}</p>
                </div>
              </div>

              {selectedClaim.verification_notes && (
                <div>
                  <Label className="text-muted-foreground">Claimant's Notes</Label>
                  <p className="text-sm mt-1 p-2 bg-muted rounded">
                    {selectedClaim.verification_notes}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this claim (optional)"
                  rows={3}
                />
              </div>

              {selectedClaim.status === 'pending' ? (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApprove(selectedClaim)}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedClaim)}
                    disabled={processing}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="pt-4 text-center text-muted-foreground">
                  This claim has already been {selectedClaim.status}.
                  {selectedClaim.reviewed_at && (
                    <p className="text-xs mt-1">
                      Reviewed on {format(new Date(selectedClaim.reviewed_at), 'dd MMM yyyy HH:mm')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}