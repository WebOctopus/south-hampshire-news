import { useState } from 'react';
import { z } from 'zod';
import { Check, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import {
  AppliedDiscount,
  DiscountProductType,
  DiscountType,
} from '@/lib/discountCalculations';

const codeSchema = z.string().trim().min(1, 'Enter a code').max(32, 'Code too long');

interface DiscountCodeInputProps {
  productType: DiscountProductType;
  email?: string;
  currentDiscount: AppliedDiscount | null;
  onApplied: (discount: AppliedDiscount) => void;
  onCleared: () => void;
}

export function DiscountCodeInput({
  productType,
  email,
  currentDiscount,
  onApplied,
  onCleared,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  const handleApply = async () => {
    setMessage(null);
    const parsed = codeSchema.safeParse(code);
    if (!parsed.success) {
      setMessage({ kind: 'error', text: parsed.error.issues[0]?.message || 'Invalid code' });
      return;
    }
    const cleanCode = parsed.data.toUpperCase();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('validate_discount_code', {
        p_code: cleanCode,
        p_product_type: productType,
        p_email: email || undefined,
      });
      if (error) {
        setMessage({ kind: 'error', text: error.message });
        return;
      }
      const result = data as {
        valid: boolean;
        message?: string;
        code_id?: string;
        discount_type?: DiscountType;
        discount_value?: number;
        free_item_text?: string | null;
      };
      if (!result?.valid) {
        setMessage({ kind: 'error', text: result?.message || 'This code is not valid.' });
        return;
      }
      onApplied({
        code: cleanCode,
        code_id: result.code_id,
        discount_type: result.discount_type as DiscountType,
        discount_value: Number(result.discount_value) || 0,
        free_item_text: result.free_item_text ?? null,
      });
      setCode('');
      setMessage({ kind: 'success', text: `Code "${cleanCode}" applied.` });
    } catch (err: any) {
      setMessage({ kind: 'error', text: err?.message || 'Failed to validate code.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = () => {
    onCleared();
    setMessage(null);
  };

  if (currentDiscount) {
    return (
      <div className="rounded-md border bg-muted/40 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-600" />
          <span>
            Voucher code <span className="font-mono font-semibold">{currentDiscount.code}</span> applied
          </span>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
          <X className="h-4 w-4 mr-1" /> Remove
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="discount-code" className="flex items-center gap-2 text-sm">
        <Tag className="h-4 w-4" /> Voucher code
      </Label>
      <div className="flex gap-2">
        <Input
          id="discount-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          maxLength={32}
          className="font-mono"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApply();
            }
          }}
        />
        <Button type="button" onClick={handleApply} disabled={submitting || !code.trim()}>
          {submitting ? 'Checking…' : 'Apply'}
        </Button>
      </div>
      {message && (
        <p className={message.kind === 'error' ? 'text-sm text-destructive' : 'text-sm text-green-700'}>
          {message.text}
        </p>
      )}
    </div>
  );
}
