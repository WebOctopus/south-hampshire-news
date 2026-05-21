import { useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Day = typeof DAYS[number];

export interface DayHours {
  open?: string;
  close?: string;
  closed?: boolean;
}

export type OpeningHoursValue = Partial<Record<Day, DayHours>>;

interface Props {
  value: any;
  onChange: (value: OpeningHoursValue) => void;
}

function parseLegacy(raw: any): OpeningHoursValue {
  const out: OpeningHoursValue = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const day of DAYS) {
    const v = (raw as any)[day];
    if (!v) continue;
    if (typeof v === 'object') {
      out[day] = {
        open: v.open || '',
        close: v.close || '',
        closed: !!v.closed,
      };
      continue;
    }
    if (typeof v === 'string') {
      const s = v.trim();
      if (!s || /^closed$/i.test(s)) {
        out[day] = { closed: true };
        continue;
      }
      const m = s.match(/(\d{1,2}:?\d{0,2})\s*[-–to]+\s*(\d{1,2}:?\d{0,2})/i);
      if (m) {
        const norm = (t: string) => {
          const cleaned = t.includes(':') ? t : t.length <= 2 ? `${t}:00` : `${t.slice(0, -2)}:${t.slice(-2)}`;
          const [h, mm = '00'] = cleaned.split(':');
          return `${h.padStart(2, '0')}:${mm.padStart(2, '0')}`;
        };
        out[day] = { open: norm(m[1]), close: norm(m[2]), closed: false };
      }
    }
  }
  return out;
}

export function OpeningHoursEditor({ value, onChange }: Props) {
  const hours = useMemo<OpeningHoursValue>(() => parseLegacy(value), [value]);

  const setDay = (day: Day, patch: Partial<DayHours>) => {
    const next: OpeningHoursValue = { ...hours, [day]: { ...(hours[day] || {}), ...patch } };
    onChange(next);
  };

  const copyMondayToWeekdays = () => {
    const mon = hours.monday;
    if (!mon) return;
    const next: OpeningHoursValue = { ...hours };
    (['tuesday', 'wednesday', 'thursday', 'friday'] as Day[]).forEach((d) => {
      next[d] = { ...mon };
    });
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={copyMondayToWeekdays}>
          <Copy className="h-3.5 w-3.5 mr-1" /> Copy Mon to Tue–Fri
        </Button>
      </div>
      <div className="space-y-2">
        {DAYS.map((day) => {
          const h = hours[day] || {};
          const closed = !!h.closed;
          return (
            <div
              key={day}
              className="grid grid-cols-[110px_auto_1fr_auto_1fr] items-center gap-2 py-1.5 border-b last:border-0"
            >
              <Label className="capitalize text-sm">{day}</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!closed}
                  onCheckedChange={(checked) => setDay(day, { closed: !checked })}
                  aria-label={`${day} open`}
                />
                <span className="text-xs text-muted-foreground w-12">
                  {closed ? 'Closed' : 'Open'}
                </span>
              </div>
              <Input
                type="time"
                value={h.open || ''}
                disabled={closed}
                onChange={(e) => setDay(day, { open: e.target.value })}
                className="h-9"
              />
              <span className="text-muted-foreground text-sm px-1">to</span>
              <Input
                type="time"
                value={h.close || ''}
                disabled={closed}
                onChange={(e) => setDay(day, { close: e.target.value })}
                className="h-9"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}