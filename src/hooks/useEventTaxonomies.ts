import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TaxonomyItem {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

function useTaxonomy(tableName: 'event_categories' | 'event_types') {
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetch = useCallback(async (activeOnly = true) => {
    try {
      setLoading(true);
      let query = supabase
        .from(tableName)
        .select('*')
        .order('sort_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems((data as TaxonomyItem[]) || []);
    } catch (error: any) {
      console.error(`Error fetching ${tableName}:`, error);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  const create = async (name: string) => {
    try {
      const maxOrder = items.reduce((max, i) => Math.max(max, i.sort_order), -1);
      const { error } = await supabase
        .from(tableName)
        .insert({ name, sort_order: maxOrder + 1 } as any);
      if (error) throw error;
      toast({ title: 'Created', description: `"${name}" added successfully` });
      await fetch(false);
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
  };

  const update = async (id: string, updates: Partial<Pick<TaxonomyItem, 'name' | 'is_active' | 'sort_order'>>) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
      await fetch(false);
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Item removed successfully' });
      await fetch(false);
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
  };

  const moveUp = async (index: number) => {
    if (index <= 0) return;
    const current = items[index];
    const above = items[index - 1];
    await Promise.all([
      update(current.id, { sort_order: above.sort_order }),
      update(above.id, { sort_order: current.sort_order }),
    ]);
  };

  const moveDown = async (index: number) => {
    if (index >= items.length - 1) return;
    const current = items[index];
    const below = items[index + 1];
    await Promise.all([
      update(current.id, { sort_order: below.sort_order }),
      update(below.id, { sort_order: current.sort_order }),
    ]);
  };

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { items, loading, fetch, create, update, remove, moveUp, moveDown };
}

export function useEventCategories(activeOnly = true) {
  const taxonomy = useTaxonomy('event_categories');

  useEffect(() => {
    taxonomy.fetch(activeOnly);
  }, [activeOnly]);

  return taxonomy;
}

export function useEventTypes(activeOnly = true) {
  const taxonomy = useTaxonomy('event_types');

  useEffect(() => {
    taxonomy.fetch(activeOnly);
  }, [activeOnly]);

  return taxonomy;
}
