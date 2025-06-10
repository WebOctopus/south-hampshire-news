import { useState, useEffect } from 'react';
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
  email: string;
  phone: string;
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
  business_categories: BusinessCategory;
}

const BusinessDirectory = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchCategories();
    fetchBusinesses();
  }, []);

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
    let query = supabase
      .from('businesses')
      .select(`
        *,
        business_categories (
          id,
          name,
          description,
          icon,
          slug
        )
      `)
      .eq('is_active', true)
      .order('featured', { ascending: false })
      .order('name');

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching businesses:', error);
    } else {
      setBusinesses(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBusinesses();
  }, [selectedCategory]);

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.postcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CategoryCard = ({ category }: { category: BusinessCategory }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => setSelectedCategory(category.id)}
    >
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-community-green/10 rounded-full">
          <div className="text-community-green text-2xl">📍</div>
        </div>
        <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
        <p className="text-sm text-gray-600">{category.description}</p>
      </CardContent>
    </Card>
  );


  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-community-navy to-community-green text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-6">
              Business Directory
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Discover local businesses across SO & PO postcodes. 
              Support your community and find the services you need.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search businesses, services, or locations..."
                  className="pl-10 h-12 text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 h-12 text-black">
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
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-heading font-bold text-center mb-12">
                Browse by Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Business Listings Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-heading font-bold">
                {selectedCategory === 'all' ? 'Featured Businesses' : 
                 categories.find(c => c.id === selectedCategory)?.name || 'Businesses'}
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Filter size={16} />
                <span>{filteredBusinesses.length} businesses found</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-community-green"></div>
                <p className="mt-4 text-gray-600">Loading businesses...</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-community-green text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-heading font-bold mb-6">
              List Your Business
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join our directory and connect with local customers in your area. 
              Boost your visibility and grow your business.
            </p>
            <Button 
              size="lg"
              className="bg-white text-community-green hover:bg-gray-100 px-8 py-3 text-lg font-medium"
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