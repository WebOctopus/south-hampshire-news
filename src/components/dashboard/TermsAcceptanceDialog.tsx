import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle, Loader2 } from 'lucide-react';
import BookingTerms from '@/components/dashboard/BookingTerms';
import { supabase } from '@/integrations/supabase/client';

interface TermsAcceptanceDialogProps {
  quote: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quote: any) => Promise<void>;
  isSubmitting?: boolean;
}

export default function TermsAcceptanceDialog({
  quote,
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: TermsAcceptanceDialogProps) {
  const [accepted, setAccepted] = useState(false);
  const [hasRecordedView, setHasRecordedView] = useState(false);

  // Record terms_viewed_at when dialog opens
  React.useEffect(() => {
    if (open && quote?.id && !hasRecordedView) {
      setHasRecordedView(true);
      supabase
        .from('quotes')
        .update({ terms_viewed_at: new Date().toISOString() })
        .eq('id', quote.id)
        .then();
    }
    if (!open) {
      setAccepted(false);
      setHasRecordedView(false);
    }
  }, [open, quote?.id]);

  const handleConfirm = async () => {
    if (!accepted || !quote) return;
    await onConfirm(quote);
  };

  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            Review & Accept Terms
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <BookingTerms pricingModel={quote?.pricing_model} />

          {/* Acceptance checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
            <Checkbox
              id="termsAcceptance"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(!!checked)}
              className="mt-0.5"
            />
            <Label htmlFor="termsAcceptance" className="cursor-pointer text-sm leading-relaxed">
              I have read and accept the <span className="font-semibold">Terms of Booking & Payment</span>. 
              I understand that by confirming this booking, I agree to the terms outlined above.
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!accepted || isSubmitting}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Confirm Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
