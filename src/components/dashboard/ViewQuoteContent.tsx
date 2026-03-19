import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/pricingCalculator';
import { useAreas, useAdSizes } from '@/hooks/usePricingData';
import { MapPin, Gift, Calendar } from 'lucide-react';

interface ViewQuoteContentProps {
  quote: any;
}

const getPricingModelLabel = (model: string) => {
  switch (model) {
    case 'bogof': return '3+ Repeat Package for New Advertisers';
    case 'fixed': case 'fixed_term': return 'Pay As You Go';
    case 'leafleting': return 'Leaflet Distribution';
    default: return model;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Active';
    case 'approved': return 'Approved';
    case 'pending': return 'Pending';
    default: return 'Saved Quote';
  }
};

export default function ViewQuoteContent({ quote }: ViewQuoteContentProps) {
  const { data: areas = [] } = useAreas();
  const { data: adSizes = [] } = useAdSizes();

  const isBogof = quote.pricing_model === 'bogof';
  const adSize = adSizes.find((s: any) => s.id === quote.ad_size_id);
  
  const paidAreas = areas.filter((a: any) => quote.bogof_paid_area_ids?.includes(a.id));
  const freeAreas = areas.filter((a: any) => quote.bogof_free_area_ids?.includes(a.id));
  const selectedAreas = areas.filter((a: any) => quote.selected_area_ids?.includes(a.id));

  const selections = quote.selections as any;
  const monthsByArea: Record<string, string[]> = selections?.months || {};

  // Fallback: derive distribution months from distribution_start_date + duration_multiplier
  const deriveFallbackMonths = (): string[] => {
    if (!quote.distribution_start_date) return [];
    const issueCount = quote.duration_multiplier || 1;
    const startDate = new Date(quote.distribution_start_date);
    const months: string[] = [];
    for (let i = 0; i < issueCount; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + (i * 2)); // bimonthly
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months;
  };

  const hasMonthsData = Object.keys(monthsByArea).length > 0;
  const fallbackMonths = !hasMonthsData ? deriveFallbackMonths() : [];

  const formatMonthLabel = (monthStr: string, area: any) => {
    // Try to find a delivery date from the area's schedule
    const schedule = area.schedule as any[] | undefined;
    if (schedule) {
      const entry = schedule.find((s: any) => s.month === monthStr);
      if (entry?.deliveryDate || entry?.delivery_date) {
        const d = new Date(entry.deliveryDate || entry.delivery_date);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }
    }
    // Fallback: format YYYY-MM as "Mon YYYY"
    const [y, m] = monthStr.split('-');
    if (y && m) {
      const d = new Date(Number(y), Number(m) - 1);
      return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    }
    return monthStr;
  };

  const AreaCard = ({ area, isFree = false }: { area: any; isFree?: boolean }) => {
    const areaMonths = hasMonthsData ? (monthsByArea[area.id] || []) : fallbackMonths;
    const displayMonths = isBogof ? areaMonths.slice(0, 3) : areaMonths;
    const formattedDates = displayMonths.map(m => formatMonthLabel(m, area));

    return (
      <div className={`p-3 rounded-lg border ${isFree ? 'border-emerald-200 bg-emerald-50/50' : 'border-border bg-muted/30'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isFree ? <Gift className="h-4 w-4 text-emerald-600" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
            <span className="font-medium">{area.name}</span>
            {isFree && <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 bg-emerald-50">FREE</Badge>}
          </div>
        </div>
        <div className="mt-1 ml-6 text-sm text-muted-foreground">
          <span>{(area.circulation || 0).toLocaleString()} circulation</span>
          {area.postcodes && <span className="ml-2">· {typeof area.postcodes === 'string' ? area.postcodes : Array.isArray(area.postcodes) ? area.postcodes.join(', ') : ''}</span>}
        </div>
        {formattedDates.length > 0 && (
          <div className="mt-1 ml-6 text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDates.join(', ')}</span>
          </div>
        )}
      </div>
    );
  };

  const hasAreas = paidAreas.length > 0 || freeAreas.length > 0 || selectedAreas.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Campaign Type</Label>
          <p>{getPricingModelLabel(quote.pricing_model)}</p>
        </div>
        <div>
          <Label>Status</Label>
          <p>{getStatusLabel(quote.status)}</p>
        </div>
      </div>
      {adSize && (
        <div>
          <Label>Ad Size</Label>
          <p>{adSize.name} <span className="text-sm text-muted-foreground">({adSize.dimensions})</span></p>
        </div>
      )}
      {quote.pricing_model === 'fixed' || quote.pricing_model === 'fixed_term' ? (
        <div>
          <Label>Price</Label>
          <p className="font-semibold text-lg">{formatPrice(quote.final_total || 0)} + VAT</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Monthly Price</Label>
            <p className="font-semibold text-lg">{formatPrice(quote.monthly_price || 0)} + VAT</p>
          </div>
          <div>
            <Label>Final Total</Label>
            <p className="font-semibold text-lg">{formatPrice(quote.final_total || 0)} + VAT</p>
          </div>
        </div>
      )}
      {quote.total_circulation > 0 && (
        <div>
          <Label>Total Circulation</Label>
          <p>{(quote.total_circulation || 0).toLocaleString()}</p>
        </div>
      )}
      {quote.distribution_start_date && (
        <div>
          <Label>Distribution Start Date</Label>
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {new Date(quote.distribution_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Area Selection Section */}
      {hasAreas && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Area Selection {isBogof && '(Buy 1 Get 1 Free)'}
          </h4>
          
          {isBogof ? (
            <div className="space-y-4">
              {paidAreas.length > 0 && (
                <div>
                  <Label className="text-sm mb-2 block">Paid Areas</Label>
                  <div className="space-y-2">
                    {paidAreas.map((area: any) => (
                      <AreaCard key={area.id} area={area} />
                    ))}
                  </div>
                </div>
              )}
              {freeAreas.length > 0 && (
                <div>
                  <Label className="text-sm mb-2 block">FREE Bonus Areas</Label>
                  <div className="space-y-2">
                    {freeAreas.map((area: any) => (
                      <AreaCard key={area.id} area={area} isFree />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {selectedAreas.map((area: any) => (
                <AreaCard key={area.id} area={area} />
              ))}
            </div>
          )}
        </div>
      )}

      {quote.contact_name && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Contact Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <p>{quote.contact_name}</p>
            </div>
            {quote.email && (
              <div>
                <Label>Email</Label>
                <p>{quote.email}</p>
              </div>
            )}
            {quote.phone && (
              <div>
                <Label>Phone</Label>
                <p>{quote.phone}</p>
              </div>
            )}
            {quote.company && (
              <div>
                <Label>Company</Label>
                <p>{quote.company}</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="border-t pt-4 text-sm text-muted-foreground">
        <p>Created: {new Date(quote.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  );
}
