import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClientDossierPanel from './ClientDossierPanel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronDown, Edit, KeyRound, Trash2, UserPlus, X, Check, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

export type ClientRow =
  Database['public']['Functions']['admin_list_clients']['Returns'][number];

type AccountRow = {
  user_id: string;
  display_name: string | null;
  company: string | null;
  advertiser_status: string | null;
  is_agency_member: boolean | null;
  agency_name: string | null;
  agency_discount_percent: number | null;
  user_roles: Array<{ role: string }>;
  [key: string]: unknown;
};

interface Props {
  accountByEmail: Map<string, AccountRow>;
  effectiveAdvertiserStatuses: Record<string, string>;
  onOpenCreateUser: () => void;
  onUpdateRole: (targetUser: AccountRow, newRole: string) => Promise<void> | void;
  onUpdateAdvertiserStatus: (
    targetUser: AccountRow,
    newStatus: string,
  ) => Promise<void> | void;
  onEdit: (targetUser: AccountRow) => void;
  onSetPassword: (targetUser: AccountRow) => void;
  onDelete: (targetUser: AccountRow) => Promise<void> | void;
  refreshSignal: number;
  onAfterMutation: () => void;
}

const PLAN_LABELS: Record<string, string> = {
  fixed: 'Fixed',
  bogof: 'BOGOF',
  leafleting: 'Leafleting',
  subscription: 'Subscription',
};

const STATUS_OPTIONS = ['active', 'lapsed', 'none'];

function formatMoney(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return `£${v.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function statusBadgeClass(status: string) {
  if (status === 'active') return 'bg-green-100 text-green-800';
  if (status === 'lapsed') return 'bg-amber-100 text-amber-800';
  return 'bg-muted text-muted-foreground';
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  formatOption,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  formatOption?: (opt: string) => string;
}) {
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt],
    );
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 justify-between gap-2 min-w-[140px]">
          <span className="truncate">
            {label}
            {selected.length > 0 && (
              <span className="ml-1 text-muted-foreground">({selected.length})</span>
            )}
          </span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder={`Filter ${label.toLowerCase()}…`} />
          <CommandList>
            <CommandEmpty>No options</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <CommandItem key={opt} onSelect={() => toggle(opt)}>
                    <div className="flex items-center gap-2 w-full">
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input'
                        }`}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </div>
                      <span className="flex-1 truncate">
                        {formatOption ? formatOption(opt) : opt}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function ClientsManagement({
  accountByEmail,
  effectiveAdvertiserStatuses,
  onOpenCreateUser,
  onUpdateRole,
  onUpdateAdvertiserStatus,
  onEdit,
  onSetPassword,
  onDelete,
  refreshSignal,
  onAfterMutation,
}: Props) {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sizeFilter, setSizeFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [planFilter, setPlanFilter] = useState<string[]>([]);
  const [confirmedPayment, setConfirmedPayment] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [usedDiscount, setUsedDiscount] = useState(false);

  const [dossierEmail, setDossierEmail] = useState<string | null>(null);
  const [dossierOpen, setDossierOpen] = useState(false);

  const openDossier = (email: string) => {
    setDossierEmail(email);
    setDossierOpen(true);
  };

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_clients');
    if (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load clients', variant: 'destructive' });
      setClients([]);
    } else {
      setClients((data ?? []) as ClientRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  const sizeOptions = useMemo(() => {
    const s = new Set<string>();
    clients.forEach((c) => (c.ad_sizes_used ?? []).forEach((v) => v && s.add(v)));
    return [...s].sort();
  }, [clients]);

  const locationOptions = useMemo(() => {
    const s = new Set<string>();
    clients.forEach((c) => (c.locations_used ?? []).forEach((v) => v && s.add(v)));
    return [...s].sort();
  }, [clients]);

  const planOptions = useMemo(() => {
    const s = new Set<string>();
    clients.forEach((c) => (c.plan_types_used ?? []).forEach((v) => v && s.add(v)));
    return [...s].filter((k) => PLAN_LABELS[k]).sort();
  }, [clients]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (term) {
        const hay = `${c.display_name ?? ''} ${c.company ?? ''} ${c.email ?? ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (statusFilter.length && !statusFilter.includes(c.effective_advertiser_status ?? 'none'))
        return false;
      if (sizeFilter.length && !(c.ad_sizes_used ?? []).some((s) => sizeFilter.includes(s)))
        return false;
      if (
        locationFilter.length &&
        !(c.locations_used ?? []).some((s) => locationFilter.includes(s))
      )
        return false;
      if (planFilter.length && !(c.plan_types_used ?? []).some((s) => planFilter.includes(s)))
        return false;
      if (confirmedPayment && !c.has_confirmed_payment) return false;
      if (acceptedTerms && !c.has_accepted_terms) return false;
      if (usedDiscount && !c.has_used_discount) return false;
      return true;
    });
  }, [
    clients,
    search,
    statusFilter,
    sizeFilter,
    locationFilter,
    planFilter,
    confirmedPayment,
    acceptedTerms,
    usedDiscount,
  ]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter([]);
    setSizeFilter([]);
    setLocationFilter([]);
    setPlanFilter([]);
    setConfirmedPayment(false);
    setAcceptedTerms(false);
    setUsedDiscount(false);
  };

  const hasActiveFilters =
    !!search ||
    statusFilter.length > 0 ||
    sizeFilter.length > 0 ||
    locationFilter.length > 0 ||
    planFilter.length > 0 ||
    confirmedPayment ||
    acceptedTerms ||
    usedDiscount;

  const handleMutation = async (fn: () => Promise<void> | void) => {
    await fn();
    onAfterMutation();
    await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Clients</h2>
          <p className="text-muted-foreground">
            Every client who has interacted with the site — accounts, quotes and cost-calculator
            enquiries — in one directory.
          </p>
        </div>
        <Button onClick={onOpenCreateUser}>
          <UserPlus className="h-4 w-4 mr-2" /> Create User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-background border-b mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search name, company or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 max-w-xs"
              />
              <MultiSelect
                label="Status"
                options={STATUS_OPTIONS}
                selected={statusFilter}
                onChange={setStatusFilter}
                formatOption={(o) => o.charAt(0).toUpperCase() + o.slice(1)}
              />
              <MultiSelect
                label="Advert Size"
                options={sizeOptions}
                selected={sizeFilter}
                onChange={setSizeFilter}
              />
              <MultiSelect
                label="Location"
                options={locationOptions}
                selected={locationFilter}
                onChange={setLocationFilter}
              />
              <MultiSelect
                label="Plan Type"
                options={planOptions}
                selected={planFilter}
                onChange={setPlanFilter}
                formatOption={(o) => PLAN_LABELS[o] ?? o}
              />
              <label className="flex items-center gap-2 text-sm ml-2">
                <Switch checked={confirmedPayment} onCheckedChange={setConfirmedPayment} />
                Confirmed Payment
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={acceptedTerms} onCheckedChange={setAcceptedTerms} />
                Accepted T&amp;Cs
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={usedDiscount} onCheckedChange={setUsedDiscount} />
                Used Discount
              </label>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
              <div className="ml-auto text-sm text-muted-foreground">
                Showing {filtered.length} of {clients.length} clients
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading clients…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {clients.length === 0 ? 'No clients found.' : 'No clients match the current filters.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Advertiser Status</TableHead>
                    <TableHead className="text-right">Quotes</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Confirmed Spend</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const account = accountByEmail.get(c.email);
                    const hasAccount = c.has_account && !!account;
                    const eff =
                      (account && effectiveAdvertiserStatuses[account.user_id]) ||
                      c.effective_advertiser_status ||
                      'none';
                    const role =
                      account?.user_roles && account.user_roles.length > 0
                        ? account.user_roles[0].role
                        : 'user';
                    return (
                      <TableRow key={c.email}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => openDossier(c.email)}
                              className="text-left text-primary hover:underline"
                            >
                              {c.display_name || '—'}
                            </button>
                            {!hasAccount && (
                              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                No account
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{c.company || '—'}</TableCell>
                        <TableCell className="text-sm">{c.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs w-fit capitalize ${statusBadgeClass(eff)}`}
                            >
                              {eff}
                            </span>
                            {hasAccount && account && (
                              <Select
                                value={account.advertiser_status || 'auto'}
                                onValueChange={(val) =>
                                  handleMutation(() => onUpdateAdvertiserStatus(account, val))
                                }
                              >
                                <SelectTrigger className="w-[110px] h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="auto">Auto</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="lapsed">Lapsed</SelectItem>
                                  <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">
                            {(c.quote_requests_count ?? 0) + (c.quotes_count ?? 0)}
                          </div>
                          {(c.quote_requests_count ?? 0) > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {c.quote_requests_count} request
                              {c.quote_requests_count === 1 ? '' : 's'}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">{c.bookings_count ?? 0}</div>
                          {(c.paid_bookings_count ?? 0) > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {c.paid_bookings_count} paid
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatMoney(c.total_confirmed_spend)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(c.last_activity_at)}
                        </TableCell>
                        <TableCell>
                          {hasAccount && account ? (
                            <div className="flex flex-wrap items-center gap-1">
                              <Select
                                value={role}
                                onValueChange={(val) =>
                                  handleMutation(() => onUpdateRole(account, val))
                                }
                              >
                                <SelectTrigger className="w-[90px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(account)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onSetPassword(account)}
                              >
                                <KeyRound className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the account for{' '}
                                      <strong>{account.display_name || c.email}</strong>. All their
                                      bookings, quotes, and data will be removed.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleMutation(() => onDelete(account))}
                                    >
                                      Delete User
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ClientDossierPanel
        email={dossierEmail}
        open={dossierOpen}
        onOpenChange={setDossierOpen}
      />
    </div>
  );
}