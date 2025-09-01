import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/pricingCalculator';

interface DeleteQuoteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quote: any;
  isDeleting: boolean;
}

export default function DeleteQuoteDialog({ 
  open, 
  onClose, 
  onConfirm, 
  quote, 
  isDeleting 
}: DeleteQuoteDialogProps) {
  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Delete Quote?
          </DialogTitle>
          <DialogDescription className="text-gray-500 mt-2">
            This action cannot be undone. This quote will be permanently removed from your dashboard.
          </DialogDescription>
        </DialogHeader>

        {/* Quote Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">
            {quote.title || 'Advertising Campaign'}
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Campaign Type:</span>
              <span className="font-medium capitalize">{quote.pricing_model}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Investment:</span>
              <span className="font-medium text-primary">{formatPrice(quote.final_total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Reach:</span>
              <span className="font-medium">{(quote.total_circulation || 0).toLocaleString()} homes</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Quote
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}