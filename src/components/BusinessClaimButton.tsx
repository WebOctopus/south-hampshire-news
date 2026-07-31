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
  triggerClassName?: string;
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  hideWhenPending?: boolean;
}

export function BusinessClaimButton({
  businessId,
  businessName,
  ownerId,
  triggerClassName,
  triggerLabel,
  triggerIcon,
  hideWhenPending,
}: BusinessClaimButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [ownClaim, setOwnClaim] = useState<any>(null);
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
        // Only this user's own most recent claim matters. Claims by other
        // users must never suppress the claim button — the admin queue
        // adjudicates between competing claims.
        const { data } = await supabase
          .from('business_claim_requests')
          .select('*')
          .eq('business_id', businessId)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setOwnClaim(data);
      }
      setCheckingClaim(false);
    };
    
    checkAuth();
  }, [businessId]);

  // Business already has an owner: no claiming, but give a contact route.
  if (ownerId) {
    if (hideWhenPending) {
      return (
        <Link
          to="/contact"
          className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white underline underline-offset-2 transition-colors"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          This listing is managed by its owner — contact us
        </Link>
      );
    }
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 mr-1 text-muted-foreground" />
          This listing is managed by its owner
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          If you believe this listing was claimed in error,{' '}
          <Link to="/contact" className="underline underline-offset-2">
            contact our team
          </Link>
          .
        </p>
      </div>
    );
  }

  // Still checking auth/claim status
  if (checkingClaim) {
    return null;
  }

  // User not logged in
  if (!userId) {
    return (
      <Link to="/auth">
        {triggerClassName ? (
          <button type="button" className={triggerClassName}>
            {triggerIcon ?? <Building2 className="h-3.5 w-3.5" />}
            {triggerLabel ?? 'Sign in to claim'}
          </button>
        ) : (
          <Button variant="outline" className="w-full">
            <Building2 className="h-4 w-4 mr-2" />
            Sign in to claim this business
          </Button>
        )}
      </Link>
    );
  }

  // This user's own claim is pending or approved — no new claim allowed.
  const ownStatus = ownClaim?.status as string | undefined;
  const ownClaimBlocks = ownStatus === 'pending' || ownStatus === 'approved';

  if (ownClaimBlocks) {
    if (hideWhenPending) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-white/15 text-white/80 border border-white/25 text-xs font-medium px-4 py-2 rounded-lg cursor-not-allowed">
          {ownStatus === 'pending' ? (
            <>
              <Clock className="h-3.5 w-3.5" /> Your claim is under review
            </>
          ) : (
            <>
              <CheckCircle className="h-3.5 w-3.5" /> Your claim has been approved
            </>
          )}
        </span>
      );
    }

    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2 font-medium">
          {ownStatus === 'pending' ? (
            <Clock className="h-4 w-4 mr-1 text-yellow-600" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
          )}
          {ownStatus === 'pending' ? 'Your claim is under review' : 'Your claim has been approved'}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {ownStatus === 'pending'
            ? 'Your claim is being reviewed by our team.'
            : 'Visit your dashboard to manage this business.'}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      const { data: created, error } = await supabase
        .from('business_claim_requests')
        .insert({
          business_id: businessId,
          user_id: userId,
          verification_method: formData.verification_method || null,
          verification_notes: formData.verification_notes || null
        })
        .select('id')
        .single();

      if (error) throw error;

      if (created?.id) {
        supabase.functions
          .invoke('send-directory-notification', {
            body: { type: 'claim_submitted_admin', claim_id: created.id },
          })
          .catch(() => undefined);
      }

      toast({
        title: "Claim Submitted",
        description: "Your claim request has been submitted for review. We'll notify you once it's processed."
      });

      setIsOpen(false);
      setOwnClaim({ status: 'pending' });
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
    <div className="space-y-1.5">
      {ownStatus === 'rejected' && (
        <p
          className={
            hideWhenPending
              ? 'flex items-center gap-1.5 text-[11px] text-white/70'
              : 'flex items-center gap-1.5 text-xs text-muted-foreground'
          }
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Your previous claim was rejected — you can apply again with more evidence.
        </p>
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerClassName ? (
          <button type="button" className={triggerClassName}>
            {triggerIcon ?? <Building2 className="h-3.5 w-3.5" />}
            {triggerLabel ?? 'Claim This Business'}
          </button>
        ) : (
          <Button variant="outline" className="w-full">
            <Building2 className="h-4 w-4 mr-2" />
            Claim This Business
          </Button>
        )}
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
    </div>
  );
}