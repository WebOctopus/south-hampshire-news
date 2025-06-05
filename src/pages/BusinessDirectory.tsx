import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BusinessCard from '@/components/BusinessCard';
import { useToast } from '@/hooks/use-toast';

interface BusinessCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Business {
  id: string;
  name: string;
  description: string;
  category_id: string;
  email: string;
  phone: string;
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postcode: string;
  logo_url: string;
  images: string[];
  business_categories: {
    name: string;
    icon: string;
  };
}

const BusinessDirectory = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchBusinesses();
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [selectedCategory, searchTerm]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('businesses')
        .select(`
          *,
          business_categories (
            name,
            icon
          )
        `)
        .eq('is_active', true);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,postcode.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast({
        title: "Error",
        description: "Failed to load businesses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
            Local Business Directory
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing local businesses in your area. Support your community and find exactly what you're looking for.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search businesses, services, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === '' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('')}
            >
              All Categories
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {loading ? 'Loading...' : `${businesses.length} businesses found`}
          </h2>
        </div>

        {/* Business Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No businesses found matching your criteria.</p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BusinessDirectory;