import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentOption {
  id: string;
  option_type: string;
  display_name: string;
  description?: string;
  discount_percentage: number;
  minimum_payments?: number;
  additional_fee_percentage: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const usePaymentOptions = () => {
  return useQuery({
    queryKey: ['payment-options'],
    queryFn: async (): Promise<PaymentOption[]> => {
      const { data, error } = await supabase
        .from('payment_options')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};