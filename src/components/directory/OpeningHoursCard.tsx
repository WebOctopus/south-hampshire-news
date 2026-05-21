import { Clock } from 'lucide-react';
import { isOpenNow } from '@/lib/businessIcon';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function formatHours(value: any): string {
  if (!value) return 'Closed';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value.closed) return 'Closed';
    if (value.open && value.close) return `${value.open} – ${value.close}`;
  }
  return 'Closed';
}

export function OpeningHoursCard({ openingHours }: { openingHours: any }) {
  if (!openingHours) return null;
  const today = DAYS[(new Date().getDay() + 6) % 7];
  const open = isOpenNow(openingHours);
  return (
    <div className="bg-card border border-community-teal/25 rounded-xl p-5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1px] text-muted-foreground mb-3">
        <Clock className="h-3.5 w-3.5 text-community-teal" /> Opening hours
      </div>
      <div className="text-sm">
          {DAYS.map((day) => {
            const isToday = day === today;
            return (
              <div
                key={day}
                className={`flex justify-between py-1.5 border-b border-community-teal/15 last:border-0 ${
                  isToday ? 'font-medium text-foreground' : ''
                }`}
              >
                <span className="capitalize text-muted-foreground">{day}</span>
                <span className="text-foreground/80">
                  {formatHours(openingHours[day])}
                  {isToday && open && (
                    <span className="ml-2 text-community-teal font-medium">· Open now</span>
                  )}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}