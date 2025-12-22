import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Story {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  area: string;
  featured_image_url: string | null;
  author_name: string | null;
  author_id: string | null;
  is_published: boolean;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryFormData {
  title: string;
  excerpt?: string;
  content: string;
  category: string;
  area: string;
  featured_image_url?: string;
  author_name?: string;
  is_published?: boolean;
  featured?: boolean;
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStories = async (publishedOnly = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      setStories((data || []) as Story[]);
    } catch (error: any) {
      console.error('Error fetching stories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (storyData: StoryFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData = {
        ...storyData,
        author_id: user?.id
      };
      
      const { data, error } = await supabase
        .from('stories')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Story created successfully'
      });

      return data;
    } catch (error: any) {
      console.error('Error creating story:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create story',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateStory = async (id: string, storyData: Partial<StoryFormData>) => {
    try {
      const updateData = {
        ...storyData,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('stories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Story updated successfully'
      });

      return data;
    } catch (error: any) {
      console.error('Error updating story:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update story',
        variant: 'destructive'
      });
      return null;
    }
  };

  const deleteStory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Story deleted successfully'
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting story:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete story',
        variant: 'destructive'
      });
      return false;
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const publishedAt = !currentStatus ? new Date().toISOString() : null;
    return updateStory(id, { 
      is_published: !currentStatus,
      // We need to handle published_at separately since it's not in StoryFormData
    });
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    return updateStory(id, { featured: !currentStatus });
  };

  const bulkCreateStories = async (storiesData: StoryFormData[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData = storiesData.map(story => ({
        ...story,
        author_id: user?.id,
        is_published: story.is_published ?? false,
        featured: story.featured ?? false
      }));
      
      const { data, error } = await supabase
        .from('stories')
        .insert(insertData)
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${data.length} stories imported successfully`
      });

      return data;
    } catch (error: any) {
      console.error('Error bulk creating stories:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to import stories',
        variant: 'destructive'
      });
      return null;
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    loading,
    fetchStories,
    createStory,
    updateStory,
    deleteStory,
    togglePublished,
    toggleFeatured,
    bulkCreateStories
  };
}

export const STORY_CATEGORIES = [
  'Community',
  'Business',
  'Events',
  'Education',
  'Transport',
  'People',
  'Health',
  'Environment',
  'Arts & Culture',
  'Sports',
  'Other'
];

export const STORY_AREAS = [
  'SOUTHAMPTON SUBURBS',
  "CHANDLER'S FORD & NORTH BADDESLEY",
  'EASTLEIGH & VILLAGES',
  'HEDGE END & SURROUNDS',
  'LOCKS HEATH & SURROUNDS',
  'FAREHAM & SURROUNDS',
  "WICKHAM & BISHOP'S WALTHAM",
  'WINCHESTER & VILLAGES',
  'ROMSEY & TEST VALLEY',
  'WATERSIDE & TOTTON',
  'NEW FOREST TO LYMINGTON'
];
