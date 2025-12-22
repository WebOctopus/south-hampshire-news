import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { parseISO, format } from 'date-fns';

interface ScheduleEntry {
  copy_deadline?: string;
  copyDeadline?: string;
  print_deadline?: string;
  printDeadline?: string;
  year?: string | number;
}

// Parse various date formats from schedule data
const parseDateString = (dateStr: string, yearHint?: string | number): Date | null => {
  if (!dateStr || dateStr.toLowerCase() === 'tbc') return null;
  
  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return parseISO(dateStr);
  }
  
  // Try DD.MM.YYYY format
  const fullMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (fullMatch) {
    const [, day, month, year] = fullMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Try DD.MM or DD.M format with year hint
  const shortMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})$/);
  if (shortMatch && yearHint) {
    const [, day, month] = shortMatch;
    const year = typeof yearHint === 'string' ? parseInt(yearHint) : yearHint;
    if (!isNaN(year)) {
      return new Date(year, parseInt(month) - 1, parseInt(day));
    }
  }
  
  return null;
};

export function useNextDeadline() {
  return useQuery({
    queryKey: ['next_deadline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_areas')
        .select('name, schedule')
        .eq('is_active', true);
      
      if (error) {
        console.error('[useNextDeadline] Error fetching areas:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('[useNextDeadline] No pricing areas found');
        return null;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let earliestFuture: { date: Date; areaName: string } | null = null;

      for (const area of data) {
        const schedule = area.schedule as ScheduleEntry[] | null;
        if (!schedule || !Array.isArray(schedule)) continue;

        for (const entry of schedule) {
          // Prefer copy_deadline (ISO format first, then camelCase)
          const deadlineStr = 
            entry.copy_deadline || 
            entry.copyDeadline ||
            entry.print_deadline || 
            entry.printDeadline;

          if (!deadlineStr || typeof deadlineStr !== 'string') continue;

          const parsed = parseDateString(deadlineStr, entry.year);
          if (!parsed) continue;

          if (parsed >= today) {
            if (!earliestFuture || parsed < earliestFuture.date) {
              earliestFuture = { date: parsed, areaName: area.name };
            }
          }
        }
      }

      if (earliestFuture) {
        console.log('[useNextDeadline] Found:', earliestFuture.areaName, earliestFuture.date.toISOString());
        return {
          date: earliestFuture.date,
          formatted: format(earliestFuture.date, 'do MMMM yyyy'),
          areaName: earliestFuture.areaName,
        };
      }

      console.log('[useNextDeadline] No future deadline found');
      return null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
