import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface CreateMandateParams {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  customerAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postcode: string;
  };
}

interface CreatePaymentParams {
  bookingId: string;
  mandateId: string;
  paymentType: 'one-off' | 'subscription';
  amount: number;
  paymentOptionId: string;
}

export const useGoCardless = () => {
  const { toast } = useToast();

  const createMandate = useMutation({
    mutationFn: async (params: CreateMandateParams) => {
      const { data, error } = await supabase.functions.invoke('create-gocardless-mandate', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      console.error('Error creating mandate:', error);
      toast({
        title: 'Payment Setup Failed',
        description: error.message || 'Failed to set up Direct Debit. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const createPayment = useMutation({
    mutationFn: async (params: CreatePaymentParams) => {
      const { data, error } = await supabase.functions.invoke('create-gocardless-payment', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      console.error('Error creating payment:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to create payment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const completeRedirectFlow = async (redirectFlowId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('complete-gocardless-redirect', {
        body: { redirectFlowId },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error completing redirect flow:', error);
      toast({
        title: 'Payment Setup Failed',
        description: error.message || 'Failed to complete payment setup.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    createMandate,
    createPayment,
    completeRedirectFlow,
  };
};
