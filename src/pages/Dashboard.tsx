import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { User } from '@supabase/supabase-js';
import { Edit } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [images, setImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  
  const hasExistingBusiness = businesses.length > 0;
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

  const loadBusinesses = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('businesses')
      .select(`
        *,
        business_categories (
          name
        )
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setBusinesses(data);
    }
  };

  useEffect(() => {
    if (user) {
      loadBusinesses();
    }
  }, [user]);

  // Set default tab based on whether user has existing business
  useEffect(() => {
    if (hasExistingBusiness && !editingBusiness) {
      setActiveTab('listings');
    }
  }, [hasExistingBusiness, editingBusiness]);

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
      if (editingBusiness) {
        // Update existing business
        const { error } = await supabase
          .from('businesses')
          .update({
            ...formData,
            images,
            featured_image_url: featuredImage
          })
          .eq('id', editingBusiness.id);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Your business listing has been updated successfully."
        });

        setEditingBusiness(null);
        setActiveTab('listings');
      } else {
        // Create new business
        const { error } = await supabase
          .from('businesses')
          .insert([{
            ...formData,
            owner_id: user.id,
            is_active: true,
            images,
            featured_image_url: featuredImage
          }]);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Your business listing has been created successfully."
        });
      }

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
      setImages([]);
      setFeaturedImage('');

      loadBusinesses();

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

  const handleEdit = (business: any) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name || '',
      description: business.description || '',
      category_id: business.category_id || '',
      email: business.email || '',
      phone: business.phone || '',
      website: business.website || '',
      address_line1: business.address_line1 || '',
      address_line2: business.address_line2 || '',
      city: business.city || '',
      postcode: business.postcode || ''
    });
    setImages(business.images || []);
    setFeaturedImage(business.featured_image_url || '');
    setActiveTab('create');
  };

  const handleCancelEdit = () => {
    setEditingBusiness(null);
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
    setImages([]);
    setFeaturedImage('');
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="create" 
                disabled={hasExistingBusiness && !editingBusiness}
              >
                {editingBusiness ? 'Edit Listing' : 'Create New Listing'}
              </TabsTrigger>
              <TabsTrigger value="listings">Your Listings ({businesses.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingBusiness ? 'Edit Business Listing' : 'Create New Business Listing'}
                  </CardTitle>
                  {editingBusiness && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        size="sm"
                      >
                        Cancel Edit
                      </Button>
                    </div>
                  )}
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

                    <ImageUpload 
                      images={images}
                      featuredImage={featuredImage}
                      onImagesChange={setImages}
                      onFeaturedImageChange={setFeaturedImage}
                      userId={user?.id || ''}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-community-green hover:bg-green-600"
                      disabled={submitting || !formData.name}
                    >
                      {submitting 
                        ? (editingBusiness ? 'Updating Listing...' : 'Creating Listing...') 
                        : (editingBusiness ? 'Update Business Listing' : 'Create Business Listing')
                      }
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings">
              <Card>
                <CardHeader>
                  <CardTitle>Your Business Listings</CardTitle>
                  {hasExistingBusiness && (
                    <p className="text-sm text-gray-600">
                      You can only have one business listing per account. To add a different business, please edit your existing listing.
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {businesses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>You haven't created any business listings yet.</p>
                      <p className="mt-2">Click on "Create New Listing" to get started.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {businesses.map((business) => (
                            <TableRow key={business.id}>
                              <TableCell className="font-medium">{business.name}</TableCell>
                              <TableCell>
                                {business.business_categories?.name || 'No category'}
                              </TableCell>
                              <TableCell>
                                {business.city ? `${business.city}${business.postcode ? ', ' + business.postcode : ''}` : 'No location'}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  business.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {business.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(business)}
                                  className="flex items-center gap-2"
                                >
                                  <Edit size={14} />
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;