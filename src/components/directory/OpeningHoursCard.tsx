import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Clock className="h-4 w-4" /> Opening hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5 text-sm">
          {DAYS.map((day) => {
            const isToday = day === today;
            return (
              <div key={day} className={`flex justify-between ${isToday ? 'font-semibold' : ''}`}>
                <span className="capitalize">{day}</span>
                <span className="text-muted-foreground">
                  {formatHours(openingHours[day])}
                  {isToday && open && <span className="ml-2 text-community-green">· Open now</span>}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}