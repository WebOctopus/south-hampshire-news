import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

// Default content structure - fallback if no database content exists
export const defaultAdvertisingContent = {
  hero: {
    trustBadge: "South Hampshire's Leading Local Magazine Publisher",
    headline: "Reach 142,000 Affluent Homes",
    subheadline: "Generate brand awareness, create leads, and boost website traffic with South Hampshire's most trusted local magazine network.",
    videoUrl: "https://qajegkbvbpekdggtrupv.supabase.co/storage/v1/object/public/websitevideo/New%20Hero%20Video.mp4",
  },
  stats: [
    { number: "142k", label: "Bi-monthly Circulation" },
    { number: "14", label: "Local Editions" },
    { number: "72%", label: "Repeat Rate" },
    { number: "1,000s", label: "Customers since 2005" },
    { number: "580k", label: "Leaflets/Year" },
  ],
  loveSection: {
    heading: "Love Your Business...",
    subheading: "Invest in Local Advertising to Grow, Expand & Thrive",
    paragraph1: "Discover Magazine is the region's most established and widespread portfolio of local publications available to businesses to generate brand awareness, create leads and boost website traffic from affluent homeowners in South Hampshire.",
    paragraph2: "We started publishing in 2005, and have since grown to become a trusted advertising partner for hundreds of local businesses. Our magazines reach 142,000 homes across 14 editions, covering Winchester, Southampton, Eastleigh, Fareham, and the New Forest.",
    quote: "We've perfected the formula for connecting local businesses with local customers.",
  },
  mediaPack: {
    heading: "Our Media Pack",
    description: "Browse our complete media pack to learn about advertising opportunities",
    embedUrl: "https://indd.adobe.com/embed/0cffeb07-c98f-42bf-9c6b-7661f5c82240?startpage=1&allowFullscreen=false",
  },
  editionsMap: {
    heading: "Interactive Distribution & Circulation Maps",
    description: "Click on a numbered button or area name to view detailed distribution information",
    embedUrl: "https://indd.adobe.com/embed/3a8ebb1d-2f10-4a2a-b847-dd653c134e5a?startpage=1&allowFullscreen=false",
  },
  calculatorSection: {
    badge: "Ready to Get Started?",
    heading: "Get Your Instant Quote & Booking",
    subheading: "Start by selecting your preferred advertising package",
    tagline: "Join hundreds of local businesses who've grown with Discover Magazine",
  },
  enquirySection: {
    phone: "023 8064 5852",
    description: "Our sales team are ready to chat about your advertising goals and find the perfect solution for your business.",
  },
};

export type AdvertisingContent = typeof defaultAdvertisingContent;

interface ContentBlock {
  id: string;
  name: string;
  block_type: string;
  content: Json;
  position: string | null;
  is_active: boolean;
}

// Deep merge function to combine database content with defaults
const deepMerge = (defaults: any, overrides: any): any => {
  if (!overrides) return defaults;
  
  const result = { ...defaults };
  
  for (const key of Object.keys(overrides)) {
    if (
      typeof defaults[key] === 'object' &&
      defaults[key] !== null &&
      !Array.isArray(defaults[key]) &&
      typeof overrides[key] === 'object' &&
      overrides[key] !== null &&
      !Array.isArray(overrides[key])
    ) {
      result[key] = deepMerge(defaults[key], overrides[key]);
    } else if (overrides[key] !== undefined) {
      result[key] = overrides[key];
    }
  }
  
  return result;
};

export const useAdvertisingContent = () => {
  const queryClient = useQueryClient();

  // Fetch advertising content from content_blocks table
  const { data: contentBlock, isLoading, error } = useQuery({
    queryKey: ['advertising-content'],
    queryFn: async (): Promise<ContentBlock | null> => {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('position', 'advertising')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching advertising content:', error);
        throw error;
      }

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Merge database content with defaults
  const content: AdvertisingContent = deepMerge(
    defaultAdvertisingContent,
    contentBlock?.content || {}
  );

  // Mutation to update content
  const updateMutation = useMutation({
    mutationFn: async (newContent: Partial<AdvertisingContent>) => {
      // Merge new content with existing
      const mergedContent = deepMerge(content, newContent);

      if (contentBlock?.id) {
        // Update existing content block
        const { error } = await supabase
          .from('content_blocks')
          .update({
            content: mergedContent as unknown as Json,
            updated_at: new Date().toISOString(),
          })
          .eq('id', contentBlock.id);

        if (error) throw error;
      } else {
        // Create new content block
        const { error } = await supabase
          .from('content_blocks')
          .insert({
            name: 'advertising_page',
            block_type: 'page_content',
            position: 'advertising',
            content: mergedContent as unknown as Json,
            is_active: true,
          });

        if (error) throw error;
      }

      return mergedContent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertising-content'] });
      toast({
        title: "Content saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error saving content:', error);
      toast({
        title: "Error saving content",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Helper function to update a specific field using dot notation path
  const updateField = (path: string, value: string) => {
    const keys = path.split('.');
    const newContent: any = {};
    
    let current = newContent;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    updateMutation.mutate(newContent);
  };

  // Helper to update stats array
  const updateStat = (index: number, field: 'number' | 'label', value: string) => {
    const newStats = [...content.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    updateMutation.mutate({ stats: newStats });
  };

  return {
    content,
    isLoading,
    error,
    updateField,
    updateStat,
    isSaving: updateMutation.isPending,
  };
};
