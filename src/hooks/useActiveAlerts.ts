import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Alert {
  id: string;
  title: string;
  message: string;
  alert_type: 'deadline' | 'premium_slot';
  is_active: boolean;
  priority: number;
  badge_text: string | null;
  badge_color: string;
  expires_at: string | null;
}

export const useActiveAlerts = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: async (): Promise<Alert[]> => {
      console.log('useActiveAlerts: Fetching alerts via RPC...');
      const { data, error } = await supabase.rpc('get_active_alerts');
      
      if (error) {
        console.error('useActiveAlerts: Error fetching alerts:', error);
        throw error;
      }
      
      console.log('useActiveAlerts: Successfully fetched alerts:', data);
      return (data || []).map(item => ({
        ...item,
        alert_type: item.alert_type as 'deadline' | 'premium_slot'
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Set up real-time subscription for alerts
  useEffect(() => {
    console.log('useActiveAlerts: Setting up real-time subscription...');
    
    // Generate unique channel name to avoid conflicts
    const channelName = `alerts-changes-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          console.log('useActiveAlerts: Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['alerts', 'active'] });
        }
      )
      .subscribe();

    return () => {
      console.log('useActiveAlerts: Cleaning up real-time subscription...');
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};