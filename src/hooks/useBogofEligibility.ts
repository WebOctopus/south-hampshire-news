import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BogofEligibilityResult {
  isEligible: boolean;
  reason?: string;
  message?: string;
  warnings?: string[];
  existingBooking?: any;
}

// Simple hash function for IP address (client-side)
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get device fingerprint (simplified version)
function getDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width,
    screen.height,
    screen.colorDepth
  ];
  return btoa(components.join('|'));
}

async function getClientIpHash(): Promise<string | null> {
  try {
    // Use a free IP detection service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    if (data.ip) {
      return await hashString(data.ip);
    }
  } catch (error) {
    console.warn('Could not get IP address for fraud detection:', error);
  }
  return null;
}

export const useBogofEligibility = (email?: string, phone?: string) => {
  return useQuery<BogofEligibilityResult>({
    queryKey: ['bogof-eligibility', email, phone],
    queryFn: async () => {
      try {
        // Get client-side fraud detection data
        const ipHash = await getClientIpHash();
        const deviceFingerprint = getDeviceFingerprint();

        console.log('Checking BOGOF eligibility...', { email, phone, hasIpHash: !!ipHash });

        const { data, error } = await supabase.functions.invoke('validate-bogof-eligibility', {
          body: {
            email,
            phone,
            ipAddressHash: ipHash,
            deviceFingerprint
          }
        });

        if (error) {
          console.error('Error checking BOGOF eligibility:', error);
          // Fail open - allow if check fails
          return {
            isEligible: true,
            warnings: ['Could not verify eligibility. Please contact support if you have questions.']
          };
        }

        console.log('BOGOF eligibility result:', data);
        return data as BogofEligibilityResult;

      } catch (error) {
        console.error('Error in BOGOF eligibility check:', error);
        // Fail open - allow if check fails
        return {
          isEligible: true,
          warnings: ['Could not verify eligibility. Please contact support if you have questions.']
        };
      }
    },
    enabled: !!email || !!phone, // Only run if we have email or phone
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false // Don't retry failed checks
  });
};

// Export fraud detection utilities for use in booking creation
export async function getFraudDetectionData() {
  const ipHash = await getClientIpHash();
  const deviceFingerprint = getDeviceFingerprint();
  return { ipHash, deviceFingerprint };
}
