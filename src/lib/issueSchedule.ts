import { format, parse, isAfter, isBefore, startOfMonth, addMonths } from 'date-fns';

export interface IssueOption {
  value: string;
  label: string;
  month: string;
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