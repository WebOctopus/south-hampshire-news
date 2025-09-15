import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Gift, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Voucher {
  id: string;
  voucher_code: string;
  voucher_type: string;
  discount_value: number;
  service_type: string;
  is_active: boolean;
  is_used: boolean;
  used_at: string | null;
  expires_at: string | null;
  description: string | null;
  created_at: string;
}

interface VoucherCardProps {
  voucher: Voucher;
  onUseVoucher?: (voucherId: string) => void;
}

const VoucherCard = ({ voucher, onUseVoucher }: VoucherCardProps) => {
  const { toast } = useToast();

  const copyVoucherCode = () => {
    navigator.clipboard.writeText(voucher.voucher_code);
    toast({
      title: "Voucher Code Copied!",
      description: "You can now use this code when booking leafleting services.",
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDiscountText = () => {
    if (voucher.voucher_type === 'percentage') {
      return `${voucher.discount_value}% OFF`;
    }
    return `£${voucher.discount_value} OFF`;
  };

  const isExpired = voucher.expires_at && new Date(voucher.expires_at) < new Date();
  const canUse = voucher.is_active && !voucher.is_used && !isExpired;

  return (
    <Card className={`relative overflow-hidden ${
      voucher.is_used ? 'opacity-60' : canUse ? 'border-community-green shadow-lg' : 'opacity-75'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-community-green" />
            <CardTitle className="text-lg font-heading">Leafleting Voucher</CardTitle>
          </div>
          <Badge variant={canUse ? "default" : voucher.is_used ? "secondary" : "destructive"}>
            {voucher.is_used ? 'Used' : isExpired ? 'Expired' : 'Active'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-community-green mb-2">
            {getDiscountText()}
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {voucher.service_type} Service Discount
          </p>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Voucher Code</p>
              <p className="font-mono font-bold text-lg tracking-wider">
                {voucher.voucher_code}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyVoucherCode}
              className="ml-2"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {voucher.description && (
          <p className="text-sm text-muted-foreground">
            {voucher.description}
          </p>
        )}

        {voucher.expires_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Expires: {formatDate(voucher.expires_at)}</span>
          </div>
        )}

        {voucher.is_used && voucher.used_at && (
          <div className="text-sm text-muted-foreground">
            Used on: {formatDate(voucher.used_at)}
          </div>
        )}

        {canUse && (
          <Button 
            className="w-full bg-community-green hover:bg-green-600"
            onClick={() => onUseVoucher?.(voucher.id)}
          >
            Use This Voucher
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VoucherCard;