import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

interface Business {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postcode: string;
  logo_url: string;
  is_verified: boolean;
  featured: boolean;
  business_categories: BusinessCategory;
}

export const useBusinessData = (selectedCategory: string) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('business_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchBusinesses = async () => {
    console.log('Fetching businesses for category:', selectedCategory);
    console.log('About to execute query');
    
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true)
        .order('featured', { ascending: false })
        .order('name');

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      console.log('Executing business query...');
      const { data: businessData, error: businessError } = await query;
      
      console.log('Business query completed:', { 
        dataCount: businessData?.length || 0, 
        error: businessError,
        data: businessData?.slice(0, 2) // Show first 2 items for debugging
      });
      
      if (businessError) {
        console.error('Error fetching businesses:', businessError);
        setLoading(false);
        return;
      }

      // Fetch categories separately
      console.log('Fetching categories...');
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('business_categories')
        .select('*');

      console.log('Categories query completed:', { 
        dataCount: categoriesData?.length || 0, 
        error: categoriesError 
      });

      if (categoriesError) {
        console.error('Error fetching categories for businesses:', categoriesError);
      }

      // Merge business data with category data
      const businessesWithCategories = businessData?.map(business => ({
        ...business,
        business_categories: categoriesData?.find(cat => cat.id === business.category_id) || null
      })) || [];

      console.log('Final businesses with categories:', businessesWithCategories.length);
      console.log('Setting businesses and loading to false');
      setBusinesses(businessesWithCategories);
      setLoading(false);
    } catch (error) {
      console.error('Unexpected error in fetchBusinesses:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBusinesses();
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [selectedCategory]);

  return {
    businesses,
    categories,
    loading
  };
};