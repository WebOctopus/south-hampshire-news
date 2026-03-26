import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, CheckCircle, Loader2, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ArtworkUploadSectionProps {
  booking: any;
  adSize: any;
}

export const ArtworkUploadSection = ({ booking, adSize }: ArtworkUploadSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: artwork, isLoading } = useQuery({
    queryKey: ['booking-artwork', booking.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_artwork' as any)
        .select('*')
        .eq('booking_id', booking.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const isPaid = booking.payment_status === 'paid' || booking.payment_status === 'confirmed';
  if (!isPaid) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF or JPG file.', variant: 'destructive' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 20MB.', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${user.id}/${booking.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('booking-artwork')
        .upload(filePath, selectedFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('booking-artwork')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('booking_artwork' as any)
        .insert({
          booking_id: booking.id,
          user_id: user.id,
          file_url: publicUrl,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          notes: notes || null,
          status: 'pending',
        } as any);
      if (insertError) throw insertError;

      toast({ title: 'Artwork uploaded!', description: 'Your artwork has been submitted for review.' });
      setSelectedFile(null);
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['booking-artwork', booking.id] });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
    }
  };

  const canUpload = !artwork || artwork.status === 'rejected';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Artwork Submission</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {adSize && (
          <div className="bg-muted p-4 rounded-lg space-y-1">
            <p className="text-sm font-medium">
              Ad Size: {adSize.name} — {adSize.dimensions}
            </p>
            <p className="text-sm text-muted-foreground">
              Please supply artwork at <strong>{adSize.dimensions}</strong>, 300dpi, as PDF or JPG.
            </p>
          </div>
        )}

        {artwork && (
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{artwork.file_name}</span>
              </div>
              {getStatusBadge(artwork.status)}
            </div>
            <p className="text-xs text-muted-foreground">
              Uploaded: {new Date(artwork.uploaded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            {artwork.notes && (
              <p className="text-xs text-muted-foreground">Notes: {artwork.notes}</p>
            )}
            {artwork.status === 'rejected' && artwork.admin_notes && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">
                  <strong>Feedback:</strong> {artwork.admin_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {canUpload && (
          <div className="space-y-3">
            {artwork?.status === 'rejected' && (
              <p className="text-sm text-muted-foreground">
                Your artwork was rejected. Please upload a revised version.
              </p>
            )}

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
                id="artwork-upload"
                disabled={uploading}
              />
              <label htmlFor="artwork-upload" className="cursor-pointer space-y-2 block">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                {selectedFile ? (
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Click to select your artwork file</p>
                    <p className="text-xs text-muted-foreground">PDF or JPG, max 20MB</p>
                  </>
                )}
              </label>
            </div>

            <Textarea
              placeholder="Optional notes about your artwork..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Artwork
                </>
              )}
            </Button>
          </div>
        )}

        {artwork?.status === 'approved' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700">Your artwork has been approved!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
