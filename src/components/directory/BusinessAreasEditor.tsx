import { useCallback, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ChevronsUpDown, Loader2 } from 'lucide-react';

interface AreaRow {
  area_code: number;
  internal_name: string;
}

interface Props {
  businessId?: string | null;
}

export function BusinessAreasEditor({ businessId }: Props) {
  const { toast } = useToast();
  const [areas, setAreas] = useState<AreaRow[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('directory_areas')
        .select('area_code, internal_name')
        .eq('is_active', true)
        .order('sort_order');
      if (data) setAreas(data as AreaRow[]);
    };
    load();
  }, []);

  const loadSelected = useCallback(async () => {
    if (!businessId) {
      setSelected([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('business_areas')
      .select('area_code')
      .eq('business_id', businessId);
    setSelected(((data as any[]) || []).map((r) => r.area_code as number));
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadSelected();
  }, [loadSelected]);

  const toggle = async (areaCode: number, checked: boolean) => {
    if (!businessId) return;
    const previous = selected;
    setSelected(checked ? [...selected, areaCode] : selected.filter((c) => c !== areaCode));
    const { error } = checked
      ? await supabase.from('business_areas').insert({ business_id: businessId, area_code: areaCode })
      : await supabase
          .from('business_areas')
          .delete()
          .eq('business_id', businessId)
          .eq('area_code', areaCode);
    if (error) {
      setSelected(previous);
      toast({ title: 'Could not update areas', description: error.message, variant: 'destructive' });
    }
  };

  if (!businessId) {
    return (
      <div className="space-y-2">
        <Label>Area</Label>
        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          Save the listing first to assign areas.
        </p>
      </div>
    );
  }

  const selectedAreas = areas.filter((a) => selected.includes(a.area_code));

  return (
    <div className="space-y-2">
      <Label>Area</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between font-normal">
            <span className="truncate">
              {loading
                ? 'Loading…'
                : selectedAreas.length === 0
                  ? 'Select areas'
                  : `${selectedAreas.length} area${selectedAreas.length === 1 ? '' : 's'} selected`}
            </span>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin opacity-50" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <ScrollArea className="max-h-64">
            <div className="p-2 space-y-1">
              {areas.map((area) => (
                <label
                  key={area.area_code}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(area.area_code)}
                    onCheckedChange={(v) => toggle(area.area_code, v === true)}
                  />
                  <span>{area.internal_name}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      {selectedAreas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedAreas.map((a) => (
            <Badge key={a.area_code} variant="secondary" className="font-normal">
              {a.internal_name}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Internal only — the public listing shows town and postcode, never an area name or number.
      </p>
    </div>
  );
}