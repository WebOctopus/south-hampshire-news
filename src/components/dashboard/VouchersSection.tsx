import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VoucherCard from './VoucherCard';
import { User } from '@supabase/supabase-js';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface VouchersSectionProps {
  user: User;
}

const VouchersSection = ({ user }: VouchersSectionProps) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadVouchers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVouchers(data || []);
    } catch (error: any) {
      console.error('Error loading vouchers:', error);
      toast({
        title: "Error Loading Vouchers",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [user]);

  const handleUseVoucher = (voucherId: string) => {
    toast({
      title: "Ready to Use Voucher!",
      description: "Navigate to the leafleting service page and enter your voucher code at checkout.",
    });
  };

  const activeVouchers = vouchers.filter(v => v.is_active && !v.is_used);
  const usedVouchers = vouchers.filter(v => v.is_used);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-community-green" />
            Your Vouchers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (vouchers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-community-green" />
            Your Vouchers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vouchers yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Book a 3+ Repeat Package to earn a 10% leafleting voucher!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {activeVouchers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-community-green" />
              Active Vouchers ({activeVouchers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Use these vouchers when booking leafleting services to get your discount!
              </AlertDescription>
            </Alert>
            <div className="grid gap-4 md:grid-cols-2">
              {activeVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  onUseVoucher={handleUseVoucher}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {usedVouchers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-muted-foreground" />
              Used Vouchers ({usedVouchers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {usedVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VouchersSection;