import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Edit, Plus, Trash2, Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

type DiscountType = 'percentage' | 'fixed_amount' | 'free_item';

interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number | null;
  free_item_text: string | null;
  applies_to_subscription: boolean;
  applies_to_fixed_term: boolean;
  applies_to_leaflets: boolean;
  single_use_per_email: boolean;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

interface FormState {
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string;
  free_item_text: string;
  applies_to_subscription: boolean;
  applies_to_fixed_term: boolean;
  applies_to_leaflets: boolean;
  single_use_per_email: boolean;
  valid_from: Date | null;
  valid_until: Date | null;
  is_active: boolean;
}

const emptyForm = (): FormState => ({
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  free_item_text: '',
  applies_to_subscription: true,
  applies_to_fixed_term: true,
  applies_to_leaflets: true,
  single_use_per_email: false,
  valid_from: null,
  valid_until: null,
  is_active: true,
});

const typeLabel: Record<DiscountType, string> = {
  percentage: 'Percentage',
  fixed_amount: 'Fixed amount',
  free_item: 'Free item',
};

function getStatus(row: DiscountCode): 'expired' | 'active' | 'inactive' {
  if (row.valid_until && new Date(row.valid_until) < new Date()) return 'expired';
  return row.is_active ? 'active' : 'inactive';
}

function formatValue(row: DiscountCode): string {
  if (row.discount_type === 'percentage') return `${row.discount_value ?? 0}%`;
  if (row.discount_type === 'fixed_amount') return `£${Number(row.discount_value ?? 0).toFixed(2)}`;
  return row.free_item_text || '—';
}

function formatValidity(row: DiscountCode): string {
  const from = row.valid_from ? format(new Date(row.valid_from), 'd MMM yyyy') : '—';
  const to = row.valid_until ? format(new Date(row.valid_until), 'd MMM yyyy') : '—';
  return `${from} – ${to}`;
}

export default function DiscountCodesManagement() {
  const { toast } = useToast();
  const [rows, setRows] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DiscountCode | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setRows((data || []) as DiscountCode[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: DiscountCode) => {
    setEditing(row);
    setForm({
      code: row.code,
      description: row.description ?? '',
      discount_type: row.discount_type,
      discount_value: row.discount_value != null ? String(row.discount_value) : '',
      free_item_text: row.free_item_text ?? '',
      applies_to_subscription: row.applies_to_subscription,
      applies_to_fixed_term: row.applies_to_fixed_term,
      applies_to_leaflets: row.applies_to_leaflets,
      single_use_per_email: row.single_use_per_email,
      valid_from: row.valid_from ? new Date(row.valid_from) : null,
      valid_until: row.valid_until ? new Date(row.valid_until) : null,
      is_active: row.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const code = form.code.trim().toUpperCase();
    if (!code) {
      toast({ title: 'Code is required', variant: 'destructive' });
      return;
    }
    if (form.discount_type === 'free_item' && !form.free_item_text.trim()) {
      toast({ title: 'Free item text is required', variant: 'destructive' });
      return;
    }
    if (form.discount_type !== 'free_item') {
      const n = Number(form.discount_value);
      if (!form.discount_value || Number.isNaN(n) || n < 0) {
        toast({ title: 'Enter a valid value', variant: 'destructive' });
        return;
      }
      if (form.discount_type === 'percentage' && n > 100) {
        toast({ title: 'Percentage must be 0–100', variant: 'destructive' });
        return;
      }
    }
    if (!form.applies_to_subscription && !form.applies_to_fixed_term && !form.applies_to_leaflets) {
      toast({ title: 'Select at least one product', variant: 'destructive' });
      return;
    }

    const payload = {
      code,
      description: form.description.trim() || null,
      discount_type: form.discount_type,
      discount_value: form.discount_type === 'free_item' ? 0 : Number(form.discount_value),
      free_item_text: form.discount_type === 'free_item' ? form.free_item_text.trim() : null,
      applies_to_subscription: form.applies_to_subscription,
      applies_to_fixed_term: form.applies_to_fixed_term,
      applies_to_leaflets: form.applies_to_leaflets,
      single_use_per_email: form.single_use_per_email,
      valid_from: form.valid_from ? form.valid_from.toISOString() : null,
      valid_until: form.valid_until ? form.valid_until.toISOString() : null,
      is_active: form.is_active,
    };

    setSubmitting(true);
    const { error } = editing
      ? await supabase.from('discount_codes').update(payload).eq('id', editing.id)
      : await supabase.from('discount_codes').insert(payload);
    setSubmitting(false);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: editing ? 'Discount code updated' : 'Discount code created' });
    setDialogOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('discount_codes').delete().eq('id', deleteTarget.id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Discount code deleted' });
      load();
    }
    setDeleteTarget(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Discount Codes
        </CardTitle>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New discount code
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No discount codes yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const status = getStatus(row);
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono font-semibold">{row.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{typeLabel[row.discount_type]}</Badge>
                    </TableCell>
                    <TableCell>{formatValue(row)}</TableCell>
                    <TableCell className="text-sm">{formatValidity(row)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === 'active' ? 'default' : status === 'expired' ? 'destructive' : 'secondary'
                        }
                      >
                        {status === 'active' ? 'Active' : status === 'expired' ? 'Expired' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit discount code' : 'New discount code'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER25"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deal type</Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(v: DiscountType) => setForm({ ...form, discount_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed amount</SelectItem>
                    <SelectItem value="free_item">Free item</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.discount_type !== 'free_item' && (
                <div className="space-y-2">
                  <Label htmlFor="value">
                    Value {form.discount_type === 'percentage' ? '(%)' : '(£)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    min={0}
                    max={form.discount_type === 'percentage' ? 100 : undefined}
                    step={form.discount_type === 'percentage' ? 1 : 0.01}
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  />
                </div>
              )}
            </div>

            {form.discount_type === 'free_item' && (
              <div className="space-y-2">
                <Label htmlFor="free_item_text">Free item text</Label>
                <Input
                  id="free_item_text"
                  value={form.free_item_text}
                  onChange={(e) => setForm({ ...form, free_item_text: e.target.value })}
                  placeholder="Free 1/8 page upgrade"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Applies to</Label>
              <div className="flex flex-col gap-2">
                {(
                  [
                    ['applies_to_subscription', '3+ Subscription'],
                    ['applies_to_fixed_term', 'Fixed-term (Pay As You Go)'],
                    ['applies_to_leaflets', 'Leaflet Distribution'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form[key]}
                      onCheckedChange={(v) => setForm({ ...form, [key]: !!v })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="single_use">Single use per email</Label>
                <p className="text-xs text-muted-foreground">Each email may redeem once.</p>
              </div>
              <Switch
                id="single_use"
                checked={form.single_use_per_email}
                onCheckedChange={(v) => setForm({ ...form, single_use_per_email: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DateField
                label="Valid from"
                value={form.valid_from}
                onChange={(d) => setForm({ ...form, valid_from: d })}
              />
              <DateField
                label="Valid until"
                value={form.valid_until}
                onChange={(d) => setForm({ ...form, valid_until: d })}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create code'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete discount code?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `Code "${deleteTarget.code}" will be permanently removed.` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | null;
  onChange: (d: Date | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('flex-1 justify-start text-left font-normal', !value && 'text-muted-foreground')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              onSelect={(d) => onChange(d ?? null)}
              initialFocus
              className={cn('p-3 pointer-events-auto')}
            />
          </PopoverContent>
        </Popover>
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
