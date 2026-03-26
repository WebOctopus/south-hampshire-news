import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays, Megaphone, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, addMonths, startOfMonth, isSameMonth, parse } from 'date-fns';

interface ScheduleEntry {
  month: Date;
  bookingId: string;
  bookingTitle: string;
  pricingModel: string;
  areaNames: string[];
  adSizeName: string;
  paymentStatus: string;
}

const PAID_STATUSES = ['paid', 'subscription_active', 'mandate_active'];

export default function CampaignScheduleTab() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [adSizes, setAdSizes] = useState<any[]>([]);
  const [pricingAreas, setPricingAreas] = useState<any[]>([]);
  const [leafletAreas, setLeafletAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewStart, setViewStart] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [bookingsRes, adSizesRes, pricingRes, leafletRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('*, booking_artwork!inner(id)')
          .eq('user_id', user.id)
          .in('payment_status', PAID_STATUSES),
        supabase.from('ad_sizes').select('id, name').eq('is_active', true),
        supabase.from('pricing_areas').select('id, name').eq('is_active', true),
        supabase.from('leaflet_areas').select('id, name, schedule').eq('is_active', true),
      ]);
      setBookings(bookingsRes.data || []);
      setAdSizes(adSizesRes.data || []);
      setPricingAreas(pricingRes.data || []);
      setLeafletAreas(leafletRes.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const areaMap = useMemo(() => {
    const m: Record<string, string> = {};
    pricingAreas.forEach(a => { m[a.id] = a.name; });
    leafletAreas.forEach(a => { m[a.id] = a.name; });
    return m;
  }, [pricingAreas, leafletAreas]);

  const adSizeMap = useMemo(() => {
    const m: Record<string, string> = {};
    adSizes.forEach(a => { m[a.id] = a.name; });
    return m;
  }, [adSizes]);

  const scheduleEntries = useMemo(() => {
    const entries: ScheduleEntry[] = [];

    bookings.forEach(booking => {
      const selections = booking.selections as any;
      const months = selections?.months as Record<string, string[]> | undefined;
      const areaIds = (booking.selected_area_ids || []) as string[];
      const areaNames = areaIds.map(id => areaMap[id] || 'Unknown Area');
      const adSizeName = booking.ad_size_id ? (adSizeMap[booking.ad_size_id] || 'Ad') : '';
      const title = booking.title || booking.company || 'Booking';

      if (months && Object.keys(months).length > 0) {
        // Magazine bookings: months is { areaId: ["2026-06", "2026-08"] }
        const allMonthStrs = new Set<string>();
        Object.values(months).forEach(arr => {
          if (Array.isArray(arr)) arr.forEach(m => allMonthStrs.add(m));
        });
        allMonthStrs.forEach(ms => {
          // Parse YYYY-MM
          const parts = ms.split('-');
          if (parts.length >= 2) {
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
            entries.push({
              month: d,
              bookingId: booking.id,
              bookingTitle: title,
              pricingModel: booking.pricing_model,
              areaNames,
              adSizeName,
              paymentStatus: booking.payment_status,
            });
          }
        });
      } else if (booking.distribution_start_date) {
        // Leafleting or fallback: derive months from start date + duration
        const start = new Date(booking.distribution_start_date);
        const count = booking.duration_multiplier || 1;
        for (let i = 0; i < count; i++) {
          const m = addMonths(startOfMonth(start), i * 2); // bimonthly
          entries.push({
            month: m,
            bookingId: booking.id,
            bookingTitle: title,
            pricingModel: booking.pricing_model,
            areaNames,
            adSizeName,
            paymentStatus: booking.payment_status,
          });
        }
      }
    });

    return entries;
  }, [bookings, areaMap, adSizeMap]);

  const viewMonths = useMemo(() => {
    const months: Date[] = [];
    for (let i = 0; i < 12; i++) {
      months.push(addMonths(viewStart, i));
    }
    return months;
  }, [viewStart]);

  const getEntriesForMonth = (month: Date) =>
    scheduleEntries.filter(e => isSameMonth(e.month, month));

  const isLeaflet = (model: string) =>
    model?.toLowerCase().includes('leaflet');

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading your schedule...
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            My Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium">No scheduled campaigns yet</p>
            <p className="text-sm mt-1">
              Once you have a paid booking with artwork uploaded, your advertising schedule will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            My Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewStart(prev => addMonths(prev, -6))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(viewStart, 'MMM yyyy')} – {format(addMonths(viewStart, 11), 'MMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewStart(prev => addMonths(prev, 6))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {viewMonths.map((month, i) => {
            const entries = getEntriesForMonth(month);
            const isCurrentMonth = isSameMonth(month, new Date());

            return (
              <div
                key={i}
                className={`rounded-lg border p-3 min-h-[120px] transition-colors ${
                  isCurrentMonth
                    ? 'border-primary bg-primary/5'
                    : entries.length > 0
                    ? 'border-accent bg-accent/30'
                    : 'border-border bg-muted/20'
                }`}
              >
                <p className={`text-xs font-semibold mb-2 ${
                  isCurrentMonth ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {format(month, 'MMM yyyy')}
                </p>

                {entries.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No campaigns</p>
                ) : (
                  <div className="space-y-1.5">
                    {entries.map((entry, j) => (
                      <div
                        key={`${entry.bookingId}-${j}`}
                        className={`rounded p-1.5 text-[10px] leading-tight ${
                          isLeaflet(entry.pricingModel)
                            ? 'bg-secondary/60 text-secondary-foreground'
                            : 'bg-primary/15 text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          {isLeaflet(entry.pricingModel) ? (
                            <FileText className="h-2.5 w-2.5 shrink-0" />
                          ) : (
                            <Megaphone className="h-2.5 w-2.5 shrink-0" />
                          )}
                          <span className="font-medium truncate">
                            {entry.bookingTitle}
                          </span>
                        </div>
                        {entry.adSizeName && (
                          <p className="truncate opacity-80">{entry.adSizeName}</p>
                        )}
                        <p className="truncate opacity-70">
                          {entry.areaNames.slice(0, 2).join(', ')}
                          {entry.areaNames.length > 2 && ` +${entry.areaNames.length - 2}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/15 border border-primary/30" />
            <span>Magazine Ad</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-secondary/60 border border-secondary" />
            <span>Leaflet Distribution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-primary" />
            <span>Current Month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
