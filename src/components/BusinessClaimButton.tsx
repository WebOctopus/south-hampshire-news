import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Building2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BusinessClaimButtonProps {
  businessId: string;
  businessName: string;
  ownerId: string | null;
}

export function BusinessClaimButton({ businessId, businessName, ownerId }: BusinessClaimButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [existingClaim, setExistingClaim] = useState<any>(null);
  const [checkingClaim, setCheckingClaim] = useState(true);
  const [formData, setFormData] = useState({
    verification_method: '',
    verification_notes: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      
      if (session?.user?.id) {
        // Check for existing claim
        const { data } = await supabase
          .from('business_claim_requests')
          .select('*')
          .eq('business_id', businessId)
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        setExistingClaim(data);
      }
      setCheckingClaim(false);
    };
    
    checkAuth();
  }, [businessId]);

  // Don't show if business already has an owner
  if (ownerId) {
    return null;
  }

  // Still checking auth/claim status
  if (checkingClaim) {
    return null;
  }

  // User not logged in
  if (!userId) {
    return (
      <Link to="/auth">
        <Button variant="outline" className="w-full">
          <Building2 className="h-4 w-4 mr-2" />
          Sign in to claim this business
        </Button>
      </Link>
    );
  }

  // User already has a claim
  if (existingClaim) {
    const statusIcon = existingClaim.status === 'pending' 
      ? <Clock className="h-4 w-4 mr-2 text-yellow-600" />
      : existingClaim.status === 'approved'
        ? <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
        : <AlertCircle className="h-4 w-4 mr-2 text-red-600" />;

    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2 font-medium">
          {statusIcon}
          Claim {existingClaim.status}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {existingClaim.status === 'pending' 
            ? 'Your claim is being reviewed by our team.'
            : existingClaim.status === 'approved'
              ? 'Your claim has been approved. Visit your dashboard to manage this business.'
              : 'Your claim was rejected. Contact support for more information.'}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('business_claim_requests')
        .insert({
          business_id: businessId,
          user_id: userId,
          verification_method: formData.verification_method || null,
          verification_notes: formData.verification_notes || null
        });

      if (error) throw error;

      toast({
        title: "Claim Submitted",
        description: "Your claim request has been submitted for review. We'll notify you once it's processed."
      });

      setIsOpen(false);
      // Refresh to show pending status
      setExistingClaim({ status: 'pending' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Building2 className="h-4 w-4 mr-2" />
          Claim This Business
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim Business Ownership</DialogTitle>
          <DialogDescription>
            Submit a claim to take ownership of "{businessName}". Our team will review your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification_method">How can we verify you own this business?</Label>
            <Select
              value={formData.verification_method}
              onValueChange={(value) => setFormData(prev => ({ ...prev, verification_method: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select verification method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">I have access to the business email</SelectItem>
                <SelectItem value="phone">I can receive calls at the business phone</SelectItem>
                <SelectItem value="document">I can provide business documents</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification_notes">Additional Information</Label>
            <Textarea
              id="verification_notes"
              value={formData.verification_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, verification_notes: e.target.value }))}
              placeholder="Tell us more about your connection to this business..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Claim'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}