import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  businessId: string;
  businessName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BusinessRemovalRequestDialog({ businessId, businessName, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', relationship: '', reason: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc('submit_business_removal_request', {
        _business_id: businessId,
        _name: form.name,
        _email: form.email,
        _relationship: form.relationship || null,
        _reason: form.reason,
      });
      if (error) throw error;

      // Fire-and-forget admin notification; never block the confirmation on it.
      supabase.functions
        .invoke('send-directory-notification', {
          body: { type: 'removal_submitted_admin', business_id: businessId, requester_email: form.email },
        })
        .catch(() => undefined);

      setSubmitted(true);
    } catch (err: any) {
      toast({ title: 'Could not send your request', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setSubmitted(false);
      setForm({ name: '', email: '', relationship: '', reason: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request removal of this listing</DialogTitle>
          <DialogDescription>
            Tell us why "{businessName}" should be taken off the Discover directory. You do not need an account.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-4 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-community-green mx-auto" />
            <p className="text-sm text-muted-foreground">
              Thank you — your request has been sent to our team. We review removal requests within a few working days
              and will email you at the address you gave us.
            </p>
            <Button onClick={() => close(false)} className="w-full">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="removal_name">Your name</Label>
              <Input
                id="removal_name"
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="removal_email">Your email</Label>
              <Input
                id="removal_email"
                type="email"
                required
                maxLength={255}
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="removal_relationship">Your relationship to the business</Label>
              <Select
                value={form.relationship}
                onValueChange={(value) => setForm((p) => ({ ...p, relationship: value }))}
              >
                <SelectTrigger id="removal_relationship">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">I own the business</SelectItem>
                  <SelectItem value="employee">I work for the business</SelectItem>
                  <SelectItem value="representative">I represent the business</SelectItem>
                  <SelectItem value="closed">The business has closed</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="removal_reason">Why should we remove it?</Label>
              <Textarea
                id="removal_reason"
                required
                rows={4}
                maxLength={2000}
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                placeholder="For example: the business has closed, or we never asked to be listed."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Sending...' : 'Send request'}
              </Button>
              <Button type="button" variant="outline" onClick={() => close(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}