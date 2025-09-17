import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AgencyDiscountResult {
  agencyDiscountPercent: number;
  isAgencyMember: boolean;
}

export function useAgencyDiscount() {
  return useQuery<AgencyDiscountResult>({
    queryKey: ['agency-discount'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { agencyDiscountPercent: 0, isAgencyMember: false };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('agency_discount_percent, is_agency_member, discount_type')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.warn('useAgencyDiscount profile error', error);
        return { agencyDiscountPercent: 0, isAgencyMember: false };
      }

      const percent = profile?.agency_discount_percent || 0;
      const isAgency = !!(profile && (profile.is_agency_member || profile.discount_type === 'agency'));
      return { agencyDiscountPercent: isAgency && percent > 0 ? percent : 0, isAgencyMember: isAgency };
    },
    staleTime: 60_000,
  });
}
