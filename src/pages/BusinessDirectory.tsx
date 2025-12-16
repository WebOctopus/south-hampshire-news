import { useCallback, useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import BusinessCard from '../components/BusinessCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  category_id: string;
  email?: string; // Optional for public users
  phone?: string; // Optional for public users
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postcode: string;
  logo_url: string;
  featured_image_url: string;
  images: string[];
  is_verified: boolean;
  featured: boolean;
  owner_id?: string; // Optional for public users
  biz_type?: string;
  business_categories?: BusinessCategory;
}

const BusinessDirectory = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState(false);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from('business_categories').select('*').order('name');
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    setCategories(data || []);
  }, []);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      console.log('[BusinessDirectory] fetching businesses...');

      const { data, error } = await supabase.rpc('get_public_businesses', {
        category_filter: selectedCategory !== 'all' ? selectedCategory : null,
        search_term: searchTerm || null,
        limit_count: 100,
        offset_count: 0,
      });

      console.log('[BusinessDirectory] result', { count: data?.length, error });

      if (error) {
        console.error('Error fetching businesses:', error);
        setError(true);
        setBusinesses([]);
        return;
      }

      const transformedData = data?.map((business: any) => ({
        ...business,
        business_categories: business.business_categories || { name: '', icon: '' },
      })) || [];

      setBusinesses(transformedData);
    } catch (err) {
      console.error('Error in fetchBusinesses:', err);
      setError(true);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const filteredBusinesses = businesses;

  const CategoryCard = ({ category }: { category: BusinessCategory }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => setSelectedCategory(category.id)}
    >
      <CardContent className="p-4 md:p-6 text-center">
        <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 flex items-center justify-center bg-community-green/10 rounded-full">
          <div className="text-community-green text-xl md:text-2xl">📍</div>
        </div>
        <h3 className="font-semibold text-base md:text-lg mb-2">{category.name}</h3>
        <p className="text-xs md:text-sm text-gray-600">{category.description}</p>
      </CardContent>
    </Card>
  );


  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-community-navy to-community-green text-white py-8 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 md:mb-6">
              Business Directory
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-3xl mx-auto px-4">
              Discover local businesses across SO & PO postcodes. 
              Support your community and find the services you need.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto space-y-4 md:space-y-0 md:flex md:gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search businesses, services..."
                  className="pl-10 h-12 text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-12 text-black">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {selectedCategory === 'all' && (
          <section className="py-8 md:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-8 md:mb-12">
                Browse by Category
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Business Listings Section */}
        <section className="py-8 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-heading font-bold">
                {selectedCategory === 'all' ? 'Featured Businesses' : 
                 categories.find(c => c.id === selectedCategory)?.name || 'Businesses'}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                <Filter size={16} />
                <span>{filteredBusinesses.length} businesses found</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-community-green"></div>
                <p className="mt-4 text-gray-600">Loading businesses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">Failed to load businesses. Please try again.</p>
                <Button 
                  onClick={fetchBusinesses}
                  className="bg-community-green hover:bg-green-600"
                >
                  Retry
                </Button>
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No businesses found matching your criteria.</p>
                <Button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                  className="mt-4 bg-community-green hover:bg-green-600"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-community-green text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 md:mb-6">
              List Your Business
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Join our directory and connect with local customers in your area. 
              Boost your visibility and grow your business.
            </p>
            <Button 
              size="lg"
              className="bg-white text-community-green hover:bg-gray-100 px-6 md:px-8 py-3 text-base md:text-lg font-medium"
            >
              Add Your Business
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessDirectory;