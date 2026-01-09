import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompetitionCategory {
  id: string;
  name: string;
  label: string;
  color_class: string;
  created_at: string;
  updated_at: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  prize: string;
  category: string;
  image_url: string | null;
  end_date: string;
  entry_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompetitionEntry {
  id: string;
  competition_id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  agreed_to_terms: boolean;
  created_at: string;
}

export function useCompetitions(includeInactive: boolean = false) {
  return useQuery({
    queryKey: ['competitions', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('competitions')
        .select('*')
        .order('end_date', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Competition[];
    },
  });
}

export function useCompetitionEntries(competitionId: string) {
  return useQuery({
    queryKey: ['competition-entries', competitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_entries')
        .select('*')
        .eq('competition_id', competitionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CompetitionEntry[];
    },
    enabled: !!competitionId,
  });
}

export function useCompetitionMutations() {
  const queryClient = useQueryClient();

  const createCompetition = useMutation({
    mutationFn: async (competition: Omit<Competition, 'id' | 'created_at' | 'updated_at' | 'entry_count'>) => {
      const { data, error } = await supabase
        .from('competitions')
        .insert(competition)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      toast.success('Competition created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create competition: ' + error.message);
    },
  });

  const updateCompetition = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Competition> & { id: string }) => {
      const { data, error } = await supabase
        .from('competitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      toast.success('Competition updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update competition: ' + error.message);
    },
  });

  const deleteCompetition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('competitions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      toast.success('Competition deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete competition: ' + error.message);
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('competitions')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      toast.success(`Competition ${data.is_active ? 'activated' : 'deactivated'}`);
    },
    onError: (error) => {
      toast.error('Failed to update competition: ' + error.message);
    },
  });

  return { createCompetition, updateCompetition, deleteCompetition, toggleActive };
}

export function useCreateCompetitionEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<CompetitionEntry, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('competition_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      toast.success('Entry submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit entry: ' + error.message);
    },
  });
}

export function useCompetitionCategories() {
  return useQuery({
    queryKey: ['competition-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as CompetitionCategory[];
    },
  });
}

export function useCreateCompetitionCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: { name: string; label: string; color_class?: string }) => {
      const { data, error } = await supabase
        .from('competition_categories')
        .insert({
          name: category.name,
          label: category.label,
          color_class: category.color_class || 'bg-gray-100 text-gray-800',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competition-categories'] });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create category: ' + error.message);
    },
  });
}
