

## Plan: Smart Month Filtering Using Print Deadline Dates

### Problem

Currently, the "When Would You Like Your Advertising to Start?" section shows outdated months (like January 2026) even though those deadlines have already passed. This happens in multiple places:

1. **`issueSchedule.ts`** - Has hardcoded month options (January, February, March 2026) that never update
2. **`AreaAndScheduleStep.tsx`** - Fixed Term and BOGOF schedule sections don't filter by deadline dates
3. **`DurationScheduleStep.tsx`** - Already has some deadline filtering but uses `copy_deadline`, not `print_deadline`

### Solution

Make the system smart by checking the **print deadline** (`print_deadline` field) for each month. If today's date is past the print deadline, that month is no longer available and should be hidden.

---

### Implementation Details

#### 1. Create a Shared Deadline Utility Function

Add a reusable function to parse and check deadline dates:

```typescript
// In src/lib/issueSchedule.ts

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
```

#### 2. Update `getAreaGroupedSchedules` Function

Replace the hardcoded months with dynamic filtering based on print deadlines:

**Before:**
```typescript
const scheduleOptions: IssueOption[] = [
  { value: '2026-01', label: 'January 2026', month: '2026-01' },
  { value: '2026-02', label: 'February 2026', month: '2026-02' },
  { value: '2026-03', label: 'March 2026', month: '2026-03' },
  { value: 'later', label: 'Later—please call...', month: 'later' }
];
```

**After:**
```typescript
// Filter months where print deadline hasn't passed
const availableMonths = sortedMonths.filter(monthStr => {
  const monthSchedule = areas[0].schedule.find(
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
```

#### 3. Update `AreaAndScheduleStep.tsx` - Fixed Term Section

Add deadline filtering to the Fixed Term schedule section (around line 462):

**Before:**
```typescript
const availableMonths = area.schedule || [];
```

**After:**
```typescript
import { isMonthAvailable } from '@/lib/issueSchedule';

// Filter out months where print deadline has passed
const allMonths = area.schedule || [];
const availableMonths = allMonths.filter(isMonthAvailable);
```

#### 4. Update `AreaAndScheduleStep.tsx` - BOGOF Section

Add deadline filtering to the BOGOF start date selection (around line 277-296):

**Before:**
```typescript
const futureMonths = sortedMonths.filter(month => {
  const [year, monthNum] = month.split('-').map(Number);
  const monthDate = new Date(year, monthNum - 1);
  return monthDate >= new Date(today.getFullYear(), today.getMonth());
});
```

**After:**
```typescript
// Filter using print deadline instead of just month comparison
const futureMonths = sortedMonths.filter(month => {
  // Find the schedule entry for this month from any area
  const monthSchedule = allAreas
    .flatMap(area => area.schedule)
    .find((s: any) => s.month === month);
  
  return monthSchedule ? isMonthAvailable(monthSchedule) : false;
});
```

#### 5. Update `DurationScheduleStep.tsx` - Use Print Deadline

Update the existing deadline filtering to prefer `print_deadline` (around line 340):

**Before:**
```typescript
const deadlineStr = monthData.copy_deadline || monthData.copyDeadline;
```

**After:**
```typescript
// Prefer print_deadline as the cutoff
const deadlineStr = 
  monthData.print_deadline || 
  monthData.printDeadline || 
  monthData.copy_deadline || 
  monthData.copyDeadline;
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/lib/issueSchedule.ts` | Add `parseDeadlineDate()` and `isMonthAvailable()` utilities; update `getAreaGroupedSchedules()` to use dynamic filtering |
| `src/components/AreaAndScheduleStep.tsx` | Import utilities; filter Fixed Term months by deadline; filter BOGOF months by deadline |
| `src/components/DurationScheduleStep.tsx` | Update deadline preference to use `print_deadline` first |

---

### Expected Behavior

1. **Today: February 6, 2026**
2. **January 2026 print deadline: January 21, 2026** → Already passed → **Not shown**
3. **February 2026 print deadline: February 21, 2026** → Still available → **Shown as first option**
4. System automatically shows the next 3 available months based on real deadline dates

---

### Edge Cases Handled

- Missing deadline dates → Month is shown (fails open)
- TBC deadline → Month is shown
- Various date formats supported (ISO, DD.MM.YYYY, DD.MM with year hint)
- Both ISO format (`print_deadline`) and legacy format (`printDeadline`) supported

