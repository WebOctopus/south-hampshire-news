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
      try {
        console.log('useAgencyDiscount: Starting to check session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('useAgencyDiscount session error:', sessionError);
          return { agencyDiscountPercent: 0, isAgencyMember: false };
        }
        
        if (!session?.user) {
          console.log('useAgencyDiscount: No session/user found, returning default');
          return { agencyDiscountPercent: 0, isAgencyMember: false };
        }

        console.log('useAgencyDiscount: Found user, querying profile for:', session.user.email);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('agency_discount_percent, is_agency_member, discount_type')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.warn('useAgencyDiscount profile error:', error);
          return { agencyDiscountPercent: 0, isAgencyMember: false };
        }

        console.log('useAgencyDiscount: Profile data:', profile);
        const percent = profile?.agency_discount_percent || 0;
        const isAgency = !!(profile && (profile.is_agency_member || profile.discount_type === 'agency'));
        const result = { agencyDiscountPercent: isAgency && percent > 0 ? percent : 0, isAgencyMember: isAgency };
        console.log('useAgencyDiscount: Final result:', result);
        return result;
      } catch (error) {
        console.error('useAgencyDiscount: Unexpected error:', error);
        return { agencyDiscountPercent: 0, isAgencyMember: false };
      }
    },
    staleTime: 60_000,
    retry: false, // Disable retries to prevent auth loops
  });
}
