import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  FileSearch,
  ShoppingCart,
  CreditCard,
  ShieldCheck,
  Mail,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';

interface Duration {
  id?: string | null;
  name?: string | null;
  type?: string | null;
}

interface Booking {
  id: string;
  pricing_model: string | null;
  ad_size: string | null;
  duration: Duration | null;
  locations: string[] | null;
  bogof_paid: string[] | null;
  bogof_free: string[] | null;
  starting_issue: string | null;
  final_total: number | null;
  discount_code: string | null;
  terms_accepted_at: string | null;
  status: string | null;
  payment_status: string | null;
  confirmed: boolean | null;
  invoice_number: string | null;
  created_at: string | null;
}

interface Quote {
  id: string;
  pricing_model: string | null;
  ad_size: string | null;
  duration: Duration | null;
  locations: string[] | null;
  starting_issue: string | null;
  final_total: number | null;
  discount_code: string | null;
  terms_viewed_at: string | null;
  status: string | null;
  created_at: string | null;
}

interface QuoteRequest {
  id: string;
  pricing_model: string | null;
  ad_size: string | null;
  duration: Duration | null;
  locations: string[] | null;
  starting_issue: string | null;
  final_total: number | null;
  status: string | null;
  created_at: string | null;
}

interface Payment {
  source: string | null;
  kind: string | null;
  status: string | null;
  amount: number | null;
  date: string | null;
}

interface ActivityItem {
  type: string;
  label: string;
  at: string | null;
  status?: string | null;
}

interface ClientDossier {
  contact: {
    display_name: string | null;
    company: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  account: {
    advertiser_status_setting: string | null;
    effective_advertiser_status: string | null;
    agency_name: string | null;
    agency_discount_percent: number | null;
    discount_type: string | null;
  } | null;
  quote_requests: QuoteRequest[] | null;
  quotes: Quote[] | null;
  bookings: Booking[] | null;
  payments: Payment[] | null;
  activity: ActivityItem[] | null;
}

interface Props {
  email: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatGBP(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return `£${Number(n).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function statusBadgeClass(status: string) {
  if (status === 'active') return 'bg-green-100 text-green-800 hover:bg-green-100';
  if (status === 'lapsed') return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
  return 'bg-muted text-muted-foreground hover:bg-muted';
}

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  form_fill: FileText,
  quote_created: FileSearch,
  booking_created: ShoppingCart,
  payment_confirmed: CreditCard,
  terms_accepted: ShieldCheck,
  email: Mail,
};

function Chips({ values }: { values: string[] | null | undefined }) {
  const list = values ?? [];
  if (list.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {list.map((v, i) => (
        <span
          key={`${v}-${i}`}
          className="px-2 py-0.5 rounded-full bg-muted text-xs"
        >
          {v}
        </span>
      ))}
    </div>
  );
}

function PlanLine({
  pricing_model,
  duration,
}: {
  pricing_model: string | null;
  duration: Duration | null;
}) {
  const model = pricing_model ?? '—';
  if (!duration) {
    return <span className="font-medium capitalize">{model}</span>;
  }
  const typeLabel =
    duration.type === 'subscription'
      ? 'Subscription'
      : duration.type
        ? 'Fixed term'
        : null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-medium capitalize">{model}</span>
      {duration.name && (
        <span className="text-muted-foreground">· {duration.name}</span>
      )}
      {typeLabel && (
        <Badge variant="secondary" className="text-[10px]">
          {typeLabel}
        </Badge>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default function ClientDossierPanel({ email, open, onOpenChange }: Props) {
  const [data, setData] = useState<ClientDossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    const { data: raw, error: err } = await supabase.rpc('admin_get_client', {
      p_email: email,
    });
    if (err) {
      console.error(err);
      setError(err.message || 'Failed to load client');
      setData(null);
    } else {
      setData((raw as unknown) as ClientDossier);
    }
    setLoading(false);
  }, [email]);

  useEffect(() => {
    if (open && email) load();
    if (!open) {
      setData(null);
      setError(null);
    }
  }, [open, email, load]);

  const contact = data?.contact ?? null;
  const account = data?.account ?? null;
  const bookings = data?.bookings ?? [];
  const quotes = data?.quotes ?? [];
  const quoteRequests = data?.quote_requests ?? [];
  const payments = data?.payments ?? [];
  const activity = data?.activity ?? [];
  const eff = account?.effective_advertiser_status ?? 'none';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {contact?.display_name || contact?.email || email || 'Client dossier'}
          </SheetTitle>
          <SheetDescription>Read-only view of the client's journey.</SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 border border-destructive/40 bg-destructive/5 text-destructive rounded-md p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium">Could not load client</div>
              <div className="text-sm opacity-90">{error}</div>
              <Button variant="outline" size="sm" className="mt-3" onClick={load}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <div className="mt-6 space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`capitalize ${statusBadgeClass(eff)}`}>{eff}</Badge>
                {contact?.company && (
                  <span className="text-sm text-muted-foreground">{contact.company}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {contact?.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-primary hover:underline"
                  >
                    {contact.email}
                  </a>
                )}
                {contact?.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-primary hover:underline"
                  >
                    {contact.phone}
                  </a>
                )}
              </div>
              {account && (
                <Card>
                  <CardContent className="grid grid-cols-2 gap-3 pt-4 text-sm">
                    <Field label="Status setting">
                      <span className="capitalize">
                        {account.advertiser_status_setting ?? 'auto'}
                      </span>
                    </Field>
                    <Field label="Effective">
                      <span className="capitalize">
                        {account.effective_advertiser_status ?? 'none'}
                      </span>
                    </Field>
                    <Field label="Agency">{account.agency_name ?? '—'}</Field>
                    <Field label="Agency discount">
                      {account.agency_discount_percent != null
                        ? `${account.agency_discount_percent}%`
                        : '—'}
                    </Field>
                    <Field label="Discount type">{account.discount_type ?? '—'}</Field>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            {/* Bookings */}
            <section className="space-y-3">
              <h3 className="font-semibold">Bookings ({bookings.length})</h3>
              {bookings.length === 0 && (
                <div className="text-sm text-muted-foreground">No bookings yet.</div>
              )}
              {bookings.map((b) => {
                const confirmed = b.confirmed === true;
                return (
                  <Card key={b.id}>
                    <div
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide flex items-center justify-between rounded-t-lg ${
                        confirmed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <span>{confirmed ? 'Payment confirmed' : 'Awaiting payment'}</span>
                      {b.payment_status && (
                        <span className="font-normal capitalize opacity-80">
                          {b.payment_status}
                        </span>
                      )}
                    </div>
                    <CardContent className="grid grid-cols-2 gap-3 pt-4">
                      <Field label="Plan">
                        <PlanLine
                          pricing_model={b.pricing_model}
                          duration={b.duration}
                        />
                      </Field>
                      <Field label="Ad size">{b.ad_size ?? '—'}</Field>
                      <div className="col-span-2">
                        <Field label="Locations">
                          <Chips values={b.locations} />
                        </Field>
                      </div>
                      {b.pricing_model === 'bogof' && (
                        <>
                          <div className="col-span-2">
                            <Field label="Paid areas">
                              <Chips values={b.bogof_paid} />
                            </Field>
                          </div>
                          <div className="col-span-2">
                            <Field label="Free areas">
                              <Chips values={b.bogof_free} />
                            </Field>
                          </div>
                        </>
                      )}
                      <Field label="Starting issue">{b.starting_issue ?? '—'}</Field>
                      <Field label="Total">{formatGBP(b.final_total)}</Field>
                      {b.discount_code && (
                        <Field label="Discount code">{b.discount_code}</Field>
                      )}
                      <Field label="T&Cs">
                        {b.terms_accepted_at ? (
                          <span className="text-green-700">
                            Accepted {formatDate(b.terms_accepted_at)}
                          </span>
                        ) : (
                          <span className="text-red-700">Not accepted</span>
                        )}
                      </Field>
                      <Field label="Status">
                        <span className="capitalize">{b.status ?? '—'}</span>
                      </Field>
                      {b.invoice_number && (
                        <Field label="Invoice">{b.invoice_number}</Field>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            <Separator />

            {/* Quotes & form-fills */}
            <section className="space-y-3">
              <h3 className="font-semibold">
                Quotes ({quotes.length}) &amp; form-fills ({quoteRequests.length})
              </h3>
              {quotes.length === 0 && quoteRequests.length === 0 && (
                <div className="text-sm text-muted-foreground">No quotes.</div>
              )}
              {quotes.map((q) => (
                <Card key={`q-${q.id}`} className="bg-muted/40">
                  <CardContent className="grid grid-cols-2 gap-3 pt-4 text-sm">
                    <div className="col-span-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                      Quote · {formatDate(q.created_at)}
                    </div>
                    <Field label="Plan">
                      <PlanLine pricing_model={q.pricing_model} duration={q.duration} />
                    </Field>
                    <Field label="Ad size">{q.ad_size ?? '—'}</Field>
                    <div className="col-span-2">
                      <Field label="Locations">
                        <Chips values={q.locations} />
                      </Field>
                    </div>
                    <Field label="Starting issue">{q.starting_issue ?? '—'}</Field>
                    <Field label="Total">{formatGBP(q.final_total)}</Field>
                    {q.discount_code && (
                      <Field label="Discount code">{q.discount_code}</Field>
                    )}
                    {q.terms_viewed_at && (
                      <Field label="T&Cs viewed">{formatDate(q.terms_viewed_at)}</Field>
                    )}
                    <Field label="Status">
                      <span className="capitalize">{q.status ?? '—'}</span>
                    </Field>
                  </CardContent>
                </Card>
              ))}
              {quoteRequests.map((r) => (
                <Card key={`r-${r.id}`} className="bg-muted/40">
                  <CardContent className="grid grid-cols-2 gap-3 pt-4 text-sm">
                    <div className="col-span-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                      Form fill · {formatDate(r.created_at)}
                    </div>
                    <Field label="Plan">
                      <PlanLine pricing_model={r.pricing_model} duration={r.duration} />
                    </Field>
                    <Field label="Ad size">{r.ad_size ?? '—'}</Field>
                    <div className="col-span-2">
                      <Field label="Locations">
                        <Chips values={r.locations} />
                      </Field>
                    </div>
                    <Field label="Starting issue">{r.starting_issue ?? '—'}</Field>
                    <Field label="Total">{formatGBP(r.final_total)}</Field>
                    <Field label="Status">
                      <span className="capitalize">{r.status ?? '—'}</span>
                    </Field>
                  </CardContent>
                </Card>
              ))}
            </section>

            <Separator />

            {/* Payments */}
            <section className="space-y-3">
              <h3 className="font-semibold">Payments ({payments.length})</h3>
              {payments.length === 0 ? (
                <div className="text-sm text-muted-foreground">No payments.</div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="text-left px-3 py-2">Source</th>
                        <th className="text-left px-3 py-2">Kind</th>
                        <th className="text-left px-3 py-2">Status</th>
                        <th className="text-right px-3 py-2">Amount</th>
                        <th className="text-left px-3 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2 capitalize">{p.source ?? '—'}</td>
                          <td className="px-3 py-2 capitalize">{p.kind ?? '—'}</td>
                          <td className="px-3 py-2 capitalize">{p.status ?? '—'}</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatGBP(p.amount)}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {formatDate(p.date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <Separator />

            {/* Activity */}
            <section className="space-y-3">
              <h3 className="font-semibold">Activity ({activity.length})</h3>
              {activity.length === 0 ? (
                <div className="text-sm text-muted-foreground">No activity.</div>
              ) : (
                <ol className="space-y-2">
                  {[...activity].reverse().map((a, i) => {
                    const Icon = ACTIVITY_ICONS[a.type] ?? FileText;
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-3 border rounded-md px-3 py-2"
                      >
                        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm flex items-center gap-2 flex-wrap">
                            <span>{a.label}</span>
                            {a.type === 'email' && a.status && (
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {a.status}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(a.at)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}