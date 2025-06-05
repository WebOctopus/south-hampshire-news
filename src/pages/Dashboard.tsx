import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { User } from '@supabase/supabase-js';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postcode: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    const loadCategories = async () => {
      const { data } = await supabase
        .from('business_categories')
        .select('*')
        .order('name');
      
      if (data) {
        setCategories(data);
      }
    };

    checkAuth();
    loadCategories();
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('businesses')
        .insert([{
          ...formData,
          owner_id: user.id,
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your business listing has been created successfully."
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        category_id: '',
        email: '',
        phone: '',
        website: '',
        address_line1: '',
        address_line2: '',
        city: '',
        postcode: ''
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold mb-4">
              Business Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Create and manage your business listings here.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Business Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Business Name *
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your business..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="business@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="01234 567890"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium mb-1">
                      Website
                    </label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.yourbusiness.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address</h3>
                  
                  <div>
                    <label htmlFor="address_line1" className="block text-sm font-medium mb-1">
                      Address Line 1
                    </label>
                    <Input
                      id="address_line1"
                      value={formData.address_line1}
                      onChange={(e) => handleInputChange('address_line1', e.target.value)}
                      placeholder="123 High Street"
                    />
                  </div>

                  <div>
                    <label htmlFor="address_line2" className="block text-sm font-medium mb-1">
                      Address Line 2
                    </label>
                    <Input
                      id="address_line2"
                      value={formData.address_line2}
                      onChange={(e) => handleInputChange('address_line2', e.target.value)}
                      placeholder="Suite 100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="London"
                      />
                    </div>

                    <div>
                      <label htmlFor="postcode" className="block text-sm font-medium mb-1">
                        Postcode
                      </label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                        placeholder="SW1A 1AA"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-community-green hover:bg-green-600"
                  disabled={submitting || !formData.name}
                >
                  {submitting ? 'Creating Listing...' : 'Create Business Listing'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;