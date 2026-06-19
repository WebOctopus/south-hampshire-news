import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ReportRow {
  id: string | null;
  code: string | null;
  discount_type: string | null;
  discount_value: number | null;
  is_active: boolean | null;
  valid_from: string | null;
  valid_until: string | null;
  times_used: number | null;
  total_booking_value: number | null;
  total_discount_given: number | null;
  last_used_at: string | null;
}

const typeLabel: Record<string, string> = {
  percentage: 'Percentage',
  fixed_amount: 'Fixed amount',
  free_item: 'Free item',
};

function getStatus(row: ReportRow): 'expired' | 'active' | 'inactive' {
  if (row.valid_until && new Date(row.valid_until) < new Date()) return 'expired';
  return row.is_active ? 'active' : 'inactive';
}

function formatCurrency(n: number | null | undefined): string {
  return `£${Number(n ?? 0).toFixed(2)}`;
}

export default function DiscountCodesReporting() {
  const { toast } = useToast();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('discount_code_report')
        .select('*')
        .order('times_used', { ascending: false });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        setRows((data || []) as ReportRow[]);
      }
      setLoading(false);
    })();
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Discount Codes Reporting
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Times Used</TableHead>
                <TableHead className="text-right">Total Booking Value (£)</TableHead>
                <TableHead className="text-right">Total Discount Given (£)</TableHead>
                <TableHead>Last Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const status = getStatus(row);
                return (
                  <TableRow key={row.id ?? row.code ?? Math.random().toString()}>
                    <TableCell className="font-mono font-semibold">{row.code ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {row.discount_type ? typeLabel[row.discount_type] ?? row.discount_type : '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === 'active'
                            ? 'default'
                            : status === 'expired'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {status === 'active' ? 'Active' : status === 'expired' ? 'Expired' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{row.times_used ?? 0}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.total_booking_value)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.total_discount_given)}</TableCell>
                    <TableCell className="text-sm">
                      {row.last_used_at ? format(new Date(row.last_used_at), 'd MMM yyyy') : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}