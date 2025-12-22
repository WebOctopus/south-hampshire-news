import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventLink {
  label: string;
  url: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  excerpt: string | null;
  full_description: string | null;
  date: string;
  time: string;
  end_time: string | null;
  location: string;
  area: string;
  postcode: string | null;
  category: string;
  type: string;
  image: string | null;
  organizer: string | null;
  links: EventLink[];
  ticket_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_published: boolean;
  featured: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  excerpt?: string;
  full_description?: string;
  date: string;
  time: string;
  end_time?: string;
  location: string;
  area: string;
  postcode?: string;
  category: string;
  type: string;
  image?: string;
  organizer?: string;
  links?: EventLink[];
  ticket_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_published?: boolean;
  featured?: boolean;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async (publishedOnly = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedEvents: Event[] = (data || []).map(event => ({
        ...event,
        links: Array.isArray(event.links) ? (event.links as unknown as EventLink[]) : []
      }));

      setEvents(mappedEvents);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: EventFormData) => {
    try {
      const insertData = {
        ...eventData,
        links: eventData.links || []
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert([insertData] as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event created successfully'
      });

      return data;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<EventFormData>) => {
    try {
      const updateData = {
        ...eventData,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('events')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event updated successfully'
      });

      return data;
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update event',
        variant: 'destructive'
      });
      return null;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event deleted successfully'
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete event',
        variant: 'destructive'
      });
      return false;
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    return updateEvent(id, { is_published: !currentStatus });
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    return updateEvent(id, { featured: !currentStatus });
  };

  const bulkCreateEvents = async (eventsData: EventFormData[]) => {
    try {
      const insertData = eventsData.map(event => ({
        ...event,
        links: event.links || [],
        is_published: event.is_published ?? false,
        featured: event.featured ?? false
      }));
      
      const { data, error } = await supabase
        .from('events')
        .insert(insertData as any)
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${data.length} events imported successfully`
      });

      return data;
    } catch (error: any) {
      console.error('Error bulk creating events:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to import events',
        variant: 'destructive'
      });
      return null;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    togglePublished,
    toggleFeatured,
    bulkCreateEvents
  };
}

export const EVENT_CATEGORIES = [
  'Community',
  'Music',
  'Arts & Culture',
  'Sports',
  'Food & Drink',
  'Family',
  'Business',
  'Education',
  'Health & Wellness',
  'Charity',
  'Other'
];

export const EVENT_TYPES = [
  'Festival',
  'Workshop',
  'Concert',
  'Exhibition',
  'Market',
  'Performance',
  'Talk/Lecture',
  'Networking',
  'Sports Event',
  'Fair',
  'Party',
  'Class',
  'Other'
];
