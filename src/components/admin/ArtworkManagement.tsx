import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, CheckCircle, XCircle, Eye, Loader2, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const ArtworkManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const { data: artworks = [], isLoading } = useQuery({
    queryKey: ['admin-artwork', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('booking_artwork' as any)
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch booking details for all artworks
  const bookingIds = [...new Set(artworks.map((a: any) => a.booking_id))];
  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-artwork-bookings', bookingIds],
    queryFn: async () => {
      if (bookingIds.length === 0) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('id, contact_name, company, email, ad_size_id, payment_status')
        .in('id', bookingIds);
      if (error) throw error;
      return data;
    },
    enabled: bookingIds.length > 0,
  });

  // Fetch ad sizes for all bookings
  const adSizeIds = [...new Set(bookings.map((b: any) => b.ad_size_id).filter(Boolean))];
  const { data: adSizes = [] } = useQuery({
    queryKey: ['admin-artwork-adsizes', adSizeIds],
    queryFn: async () => {
      if (adSizeIds.length === 0) return [];
      const { data, error } = await supabase
        .from('ad_sizes')
        .select('id, name, dimensions')
        .in('id', adSizeIds);
      if (error) throw error;
      return data;
    },
    enabled: adSizeIds.length > 0,
  });

  const getBooking = (bookingId: string) => bookings.find((b: any) => b.id === bookingId);
  const getAdSize = (adSizeId: string) => adSizes.find((a: any) => a.id === adSizeId);

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selectedArtwork) return;
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('booking_artwork' as any)
        .update({
          status,
          admin_notes: adminNotes || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq('id', selectedArtwork.id);
      if (error) throw error;

      toast({ title: 'Success', description: `Artwork ${status}.` });
      setReviewDialogOpen(false);
      setSelectedArtwork(null);
      setAdminNotes('');
      queryClient.invalidateQueries({ queryKey: ['admin-artwork'] });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default: return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Artwork Submissions</h2>
          <p className="text-muted-foreground">Review and manage uploaded artwork from advertisers.</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Palette className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No artwork submissions found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Ad Size</TableHead>
                  <TableHead>Payment Ref</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artworks.map((artwork: any) => {
                  const booking = getBooking(artwork.booking_id);
                  const adSize = booking ? getAdSize(booking.ad_size_id) : null;
                  return (
                    <TableRow key={artwork.id}>
                      <TableCell className="font-medium">
                        {booking?.contact_name || 'Unknown'}
                        <br />
                        <span className="text-xs text-muted-foreground">{booking?.email}</span>
                      </TableCell>
                      <TableCell>{booking?.company || '-'}</TableCell>
                      <TableCell>
                        {adSize ? `${adSize.name} (${adSize.dimensions})` : '-'}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">REF-{artwork.booking_id?.substring(0, 8).toUpperCase()}</span>
                        {booking?.payment_status && (
                          <Badge className={`ml-2 text-xs ${booking.payment_status === 'paid' || booking.payment_status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {booking.payment_status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <a
                          href={artwork.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          {artwork.file_name}
                        </a>
                        {artwork.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{artwork.notes}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(artwork.uploaded_at).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell>{getStatusBadge(artwork.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {artwork.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                                onClick={() => {
                                  setSelectedArtwork(artwork);
                                  setAdminNotes('');
                                  setReviewDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Review
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a href={artwork.file_url} download={artwork.file_name} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <a href={artwork.file_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Artwork</DialogTitle>
          </DialogHeader>
          {selectedArtwork && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">{selectedArtwork.file_name}</p>
                <a
                  href={selectedArtwork.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View / Download File
                </a>
              </div>
              {selectedArtwork.notes && (
                <div>
                  <Label>User Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedArtwork.notes}</p>
                </div>
              )}
              <div>
                <Label>Admin Notes (optional)</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Feedback for the user..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleReview('approved')}
                  disabled={updating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve
                </Button>
                <Button
                  onClick={() => handleReview('rejected')}
                  disabled={updating}
                  variant="destructive"
                  className="flex-1"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArtworkManagement;
