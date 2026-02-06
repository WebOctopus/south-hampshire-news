import { format, parse, isAfter, isBefore, startOfMonth, addMonths } from 'date-fns';

export interface IssueOption {
  value: string;
  label: string;
  month: string;
}

export interface AreaGroupSchedule {
  areas: any[];
  areaNames: string;
  scheduleOptions: IssueOption[];
}

/**
 * Parse various deadline date formats from schedule data
 */
export function parseDeadlineDate(
  deadlineStr: string | undefined, 
  yearHint?: string | number
): Date | null {
  if (!deadlineStr || deadlineStr.toLowerCase() === 'tbc') return null;
  
  // Try ISO format (YYYY-MM-DD) - preferred
  if (/^\d{4}-\d{2}-\d{2}$/.test(deadlineStr)) {
    return new Date(deadlineStr);
  }
  
  // Try DD.MM.YYYY format
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(deadlineStr)) {
    const [day, month, year] = deadlineStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Try DD.MM format with year hint
  if (/^\d{1,2}\.\d{1,2}$/.test(deadlineStr) && yearHint) {
    const [day, month] = deadlineStr.split('.');
    const year = typeof yearHint === 'string' ? parseInt(yearHint) : yearHint;
    if (!isNaN(year)) {
      return new Date(year, parseInt(month) - 1, parseInt(day));
    }
  }
  
  return null;
}

/**
 * Check if a month is still available based on print deadline
 * Returns true if the print deadline is today or in the future
 */
export function isMonthAvailable(monthData: any): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Prefer print_deadline, fallback to copy_deadline
  const deadlineStr = 
    monthData.print_deadline || 
    monthData.printDeadline || 
    monthData.copy_deadline || 
    monthData.copyDeadline;
  
  if (!deadlineStr) return true; // No deadline = show it
  
  const deadlineDate = parseDeadlineDate(deadlineStr, monthData.year);
  if (!deadlineDate) return true; // Couldn't parse = show it
  
  return deadlineDate >= today;
}

/**
 * Get the next available issue based on current date and area schedules
 */
export function getNextAvailableIssue(areaSchedules: any[]): IssueOption | null {
  if (!areaSchedules || areaSchedules.length === 0) {
    return null;
  }

  const currentDate = new Date();
  const currentMonth = startOfMonth(currentDate);

  // Get all unique months from all area schedules
  const allMonths = new Set<string>();
  areaSchedules.forEach(area => {
    if (area.schedule) {
      area.schedule.forEach((monthData: any) => {
        allMonths.add(monthData.month);
      });
    }
  });

  // Sort months chronologically
  const sortedMonths = Array.from(allMonths).sort();

  // Find the next available month
  for (const monthStr of sortedMonths) {
    try {
      // Parse month string (assuming format like "2024-01")
      const monthDate = parse(monthStr, 'yyyy-MM', new Date());
      
      // If this month is current month or in the future, it's available
      if (!isBefore(monthDate, currentMonth)) {
        return {
          value: 'next_available',
          label: 'Next Available Issue',
          month: monthStr
        };
      }
    } catch (error) {
      console.error('Error parsing month:', monthStr, error);
    }
  }

  return null;
}

/**
 * Get the starting month for the next issue after the next available one
 */
export function getStartingMonthToNextIssue(areaSchedules: any[]): IssueOption | null {
  if (!areaSchedules || areaSchedules.length === 0) {
    return null;
  }

  const nextAvailable = getNextAvailableIssue(areaSchedules);
  if (!nextAvailable) {
    return null;
  }

  // Get all unique months from all area schedules
  const allMonths = new Set<string>();
  areaSchedules.forEach(area => {
    if (area.schedule) {
      area.schedule.forEach((monthData: any) => {
        allMonths.add(monthData.month);
      });
    }
  });

  // Sort months chronologically
  const sortedMonths = Array.from(allMonths).sort();
  
  // Find the next month after the next available issue
  const nextAvailableIndex = sortedMonths.indexOf(nextAvailable.month);
  if (nextAvailableIndex >= 0 && nextAvailableIndex < sortedMonths.length - 1) {
    const nextMonth = sortedMonths[nextAvailableIndex + 1];
    return {
      value: 'starting_month_next',
      label: formatMonthForDisplay(nextMonth),
      month: nextMonth
    };
  }

  return null;
}

/**
 * Format month string for display
 */
export function formatMonthForDisplay(monthStr: string): string {
  try {
    const monthDate = parse(monthStr, 'yyyy-MM', new Date());
    return format(monthDate, 'MMMM yyyy');
  } catch (error) {
    console.error('Error formatting month:', monthStr, error);
    return monthStr;
  }
}

/**
 * Get all available issue options for a given set of area schedules
 * Returns up to 6 future months as starting options, grouped by which areas publish in each month
 */
export function getAvailableIssueOptions(areaSchedules: any[]): IssueOption[] {
  if (!areaSchedules || areaSchedules.length === 0) {
    return [];
  }

  const currentDate = new Date();
  const currentMonth = startOfMonth(currentDate);

  // Build a map of months to areas that publish in that month
  const monthToAreas = new Map<string, any[]>();
  
  areaSchedules.forEach(area => {
    if (area.schedule) {
      area.schedule.forEach((monthData: any) => {
        const monthStr = monthData.month;
        if (!monthToAreas.has(monthStr)) {
          monthToAreas.set(monthStr, []);
        }
        monthToAreas.get(monthStr)!.push(area);
      });
    }
  });

  // Sort months chronologically and create options
  const sortedMonths = Array.from(monthToAreas.keys()).sort();
  const options: IssueOption[] = [];
  let addedCount = 0;
  const maxOptions = 6;

  for (const monthStr of sortedMonths) {
    if (addedCount >= maxOptions) break;

    try {
      // Parse month string (assuming format like "2024-01")
      const monthDate = parse(monthStr, 'yyyy-MM', new Date());
      
      // If this month is current month or in the future, add it as an option
      if (!isBefore(monthDate, currentMonth)) {
        const displayMonth = formatMonthForDisplay(monthStr);
        const areasInMonth = monthToAreas.get(monthStr) || [];
        const areaNames = areasInMonth.map(area => area.name).join(', ');
        
        options.push({
          value: monthStr,
          label: addedCount === 0 
            ? `Next Available Issue - ${displayMonth} (${areaNames})` 
            : `${displayMonth} (${areaNames})`,
          month: monthStr
        });
        addedCount++;
      }
    } catch (error) {
      console.error('Error parsing month:', monthStr, error);
    }
  }

  return options;
}

/**
 * Group areas by their schedules and return available starting months for each group
 * Returns fixed options: Next Available Issues, January 2026, February 2026, March 2026, and Later option
 */
export function getAreaGroupedSchedules(areaSchedules: any[]): AreaGroupSchedule[] {
  if (!areaSchedules || areaSchedules.length === 0) {
    return [];
  }

  const currentDate = new Date();
  const currentMonth = startOfMonth(currentDate);

  // Group areas by their schedule (as JSON string for comparison)
  const scheduleGroups = new Map<string, any[]>();
  
  areaSchedules.forEach(area => {
    if (area.schedule) {
      const scheduleKey = JSON.stringify(area.schedule.map((m: any) => m.month).sort());
      if (!scheduleGroups.has(scheduleKey)) {
        scheduleGroups.set(scheduleKey, []);
      }
      scheduleGroups.get(scheduleKey)!.push(area);
    }
  });

  // Build the result with fixed starting options
  const result: AreaGroupSchedule[] = [];

  scheduleGroups.forEach((areas) => {
    // Get unique months from this group's schedule
    const monthsSet = new Set<string>();
    areas.forEach(area => {
      if (area.schedule) {
        area.schedule.forEach((monthData: any) => {
          monthsSet.add(monthData.month);
        });
      }
    });

    // Sort months and find the next available one
    const sortedMonths = Array.from(monthsSet).sort();
    let nextAvailableMonth = '';
    
    for (const monthStr of sortedMonths) {
      try {
        const monthDate = parse(monthStr, 'yyyy-MM', new Date());
        if (!isBefore(monthDate, currentMonth)) {
          nextAvailableMonth = monthStr;
          break;
        }
      } catch (error) {
        console.error('Error parsing month:', monthStr, error);
      }
    }

    // Filter months where print deadline hasn't passed
    const availableMonths = sortedMonths.filter(monthStr => {
      const monthSchedule = areas[0]?.schedule?.find(
        (s: any) => s.month === monthStr
      );
      return monthSchedule ? isMonthAvailable(monthSchedule) : true;
    });

    // Build options from first 3 available months + "Later" option
    const scheduleOptions: IssueOption[] = availableMonths
      .slice(0, 3)
      .map(monthStr => ({
        value: monthStr,
        label: formatMonthForDisplay(monthStr),
        month: monthStr
      }));

    scheduleOptions.push({
      value: 'later',
      label: 'Later—please call 023 8026 6388',
      month: 'later'
    });

    const areaNames = areas.map(area => area.name).join(', ');
    result.push({
      areas,
      areaNames,
      scheduleOptions
    });
  });

  return result;
}