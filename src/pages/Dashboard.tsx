import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { User } from '@supabase/supabase-js';
import { Edit, Calendar, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPrice } from '@/lib/pricingCalculator';
import EditQuoteForm from '@/components/EditQuoteForm';
import PasswordSetupDialog from '@/components/PasswordSetupDialog';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import QuoteConversionCard from '@/components/dashboard/QuoteConversionCard';
import SuccessStories from '@/components/dashboard/SuccessStories';
import UrgencyAlerts from '@/components/dashboard/UrgencyAlerts';
import ROICalculator from '@/components/dashboard/ROICalculator';
import CampaignTimeline from '@/components/dashboard/CampaignTimeline';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [viewingQuote, setViewingQuote] = useState<any | null>(null);
  const [editingQuote, setEditingQuote] = useState<any | null>(null);
  const [deletingQuoteId, setDeletingQuoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  
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

  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    area: '',
    postcode: '',
    organizer: '',
    category: '',
    type: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }
        setUser(session.user);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
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

  const loadEvents = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    if (data) {
      setEvents(data);
    }
  };

  const loadQuotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      setQuotes(data);
    }
  };

  useEffect(() => {
    if (user) {
      loadBusinesses();
      loadEvents();
      loadQuotes();
      
      // Check if user came from calculator and set appropriate tab
      const isNewUserFromCalculator = localStorage.getItem('newUserFromCalculator');
      const justSavedQuote = localStorage.getItem('justSavedQuote');
      
      if (isNewUserFromCalculator === 'true' || justSavedQuote === 'true') {
        setActiveTab('quotes');
        // Clean up the flags
        localStorage.removeItem('newUserFromCalculator');
        localStorage.removeItem('justSavedQuote');
        
        // Show additional welcome message for new users
        if (isNewUserFromCalculator === 'true') {
          setTimeout(() => {
            toast({
              title: "Welcome to Your Dashboard!",
              description: "Your quote has been saved below. You can create business listings and events here too.",
              duration: 5000,
            });
          }, 2000);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    const savePending = async () => {
      if (!user) return;
      const pending = localStorage.getItem('pendingQuote');
      if (!pending) return;
      try {
        const parsed = JSON.parse(pending);
        const payload = { ...parsed, user_id: user.id } as any;
        const { error } = await supabase.from('quotes').insert(payload);
        if (error) throw error;
        toast({ title: 'Quote saved', description: 'We saved your quote to your dashboard.' });
        localStorage.removeItem('pendingQuote');
        await loadQuotes();
        setActiveTab('quotes');
        
        // Check if this is a new user from the calculator
        const isNewUserFromCalculator = localStorage.getItem('newUserFromCalculator');
        if (isNewUserFromCalculator === 'true') {
          localStorage.removeItem('newUserFromCalculator');
          // Small delay to let the quote save toast show first
          setTimeout(() => {
            setShowPasswordSetup(true);
          }, 1500);
        }
      } catch (e: any) {
        console.error('Pending quote save failed', e);
      }
    };
    savePending();
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

  const handleEventInputChange = (field: string, value: string) => {
    setEventFormData(prev => ({
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
          .update(formData)
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
            is_active: true
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
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventFormData)
          .eq('id', editingEvent.id);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Your event has been updated successfully."
        });

        setEditingEvent(null);
        setActiveTab('events');
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([{
            ...eventFormData,
            user_id: user.id
          }]);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Your event has been created successfully."
        });
      }

      // Reset form
      setEventFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        area: '',
        postcode: '',
        organizer: '',
        category: '',
        type: ''
      });

      loadEvents();

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

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setEventFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      area: event.area || '',
      postcode: event.postcode || '',
      organizer: event.organizer || '',
      category: event.category || '',
      type: event.type || ''
    });
    setActiveTab('create-event');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Event deleted successfully."
      });

      loadEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    setDeletingQuoteId(quoteId);
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Quote deleted successfully.' });
      await loadQuotes();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeletingQuoteId(null);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <WelcomeHeader user={user} quotes={quotes} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger 
                value="create" 
                disabled={hasExistingBusiness && !editingBusiness}
              >
                {editingBusiness ? 'Edit Listing' : 'Create New Listing'}
              </TabsTrigger>
              <TabsTrigger value="listings">Your Listings ({businesses.length})</TabsTrigger>
              <TabsTrigger value="create-event">
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </TabsTrigger>
              <TabsTrigger value="events">Your Events ({events.length})</TabsTrigger>
              <TabsTrigger value="quotes">Saved Quotes ({quotes.length})</TabsTrigger>
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

            <TabsContent value="create-event">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </CardTitle>
                  {editingEvent && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingEvent(null);
                          setEventFormData({
                            title: '',
                            description: '',
                            date: '',
                            time: '',
                            location: '',
                            area: '',
                            postcode: '',
                            organizer: '',
                            category: '',
                            type: ''
                          });
                        }}
                        size="sm"
                      >
                        Cancel Edit
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEventSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="event-title" className="block text-sm font-medium mb-1">
                          Event Title *
                        </label>
                        <Input
                          id="event-title"
                          value={eventFormData.title}
                          onChange={(e) => handleEventInputChange('title', e.target.value)}
                          required
                          placeholder="Enter event title"
                        />
                      </div>

                      <div>
                        <label htmlFor="event-organizer" className="block text-sm font-medium mb-1">
                          Organizer
                        </label>
                        <Input
                          id="event-organizer"
                          value={eventFormData.organizer}
                          onChange={(e) => handleEventInputChange('organizer', e.target.value)}
                          placeholder="Event organizer"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="event-description" className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <Textarea
                        id="event-description"
                        value={eventFormData.description}
                        onChange={(e) => handleEventInputChange('description', e.target.value)}
                        placeholder="Describe your event..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="event-date" className="block text-sm font-medium mb-1">
                          Date *
                        </label>
                        <Input
                          id="event-date"
                          type="date"
                          value={eventFormData.date}
                          onChange={(e) => handleEventInputChange('date', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="event-time" className="block text-sm font-medium mb-1">
                          Time *
                        </label>
                        <Input
                          id="event-time"
                          type="time"
                          value={eventFormData.time}
                          onChange={(e) => handleEventInputChange('time', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="event-location" className="block text-sm font-medium mb-1">
                          Location *
                        </label>
                        <Input
                          id="event-location"
                          value={eventFormData.location}
                          onChange={(e) => handleEventInputChange('location', e.target.value)}
                          required
                          placeholder="Event venue"
                        />
                      </div>

                      <div>
                        <label htmlFor="event-area" className="block text-sm font-medium mb-1">
                          Area *
                        </label>
                        <Input
                          id="event-area"
                          value={eventFormData.area}
                          onChange={(e) => handleEventInputChange('area', e.target.value)}
                          required
                          placeholder="City/Town"
                        />
                      </div>

                      <div>
                        <label htmlFor="event-postcode" className="block text-sm font-medium mb-1">
                          Postcode
                        </label>
                        <Input
                          id="event-postcode"
                          value={eventFormData.postcode}
                          onChange={(e) => handleEventInputChange('postcode', e.target.value)}
                          placeholder="PO1 2AB"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="event-category" className="block text-sm font-medium mb-1">
                          Category *
                        </label>
                        <Select value={eventFormData.category} onValueChange={(value) => handleEventInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
                            <SelectItem value="Community Activities">Community Activities</SelectItem>
                            <SelectItem value="Food & Drink">Food & Drink</SelectItem>
                            <SelectItem value="Music & Concerts">Music & Concerts</SelectItem>
                            <SelectItem value="Theatre & Shows">Theatre & Shows</SelectItem>
                            <SelectItem value="Sports & Fitness">Sports & Fitness</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label htmlFor="event-type" className="block text-sm font-medium mb-1">
                          Type *
                        </label>
                        <Select value={eventFormData.type} onValueChange={(value) => handleEventInputChange('type', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Festival">Festival</SelectItem>
                            <SelectItem value="Workshop">Workshop</SelectItem>
                            <SelectItem value="Concert">Concert</SelectItem>
                            <SelectItem value="Theatre">Theatre</SelectItem>
                            <SelectItem value="Exhibition">Exhibition</SelectItem>
                            <SelectItem value="Comedy">Comedy</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Film">Film</SelectItem>
                            <SelectItem value="Market">Market</SelectItem>
                            <SelectItem value="Conference">Conference</SelectItem>
                            <SelectItem value="Meetup">Meetup</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-community-green hover:bg-green-600"
                      disabled={submitting || !eventFormData.title || !eventFormData.date || !eventFormData.time || !eventFormData.location || !eventFormData.area || !eventFormData.category || !eventFormData.type}
                    >
                      {submitting 
                        ? (editingEvent ? 'Updating Event...' : 'Creating Event...') 
                        : (editingEvent ? 'Update Event' : 'Create Event')
                      }
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={20} />
                    Your Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                      <p>You haven't created any events yet.</p>
                      <p className="mt-2">Click on "Create Event" to get started.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event Title</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {events.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell className="font-medium">{event.title}</TableCell>
                              <TableCell>
                                {new Date(event.date).toLocaleDateString()} at {event.time}
                              </TableCell>
                              <TableCell>
                                {event.location}, {event.area}
                              </TableCell>
                              <TableCell>{event.category}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditEvent(event)}
                                    className="flex items-center gap-1"
                                  >
                                    <Edit size={14} />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </Button>
                                </div>
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

            <TabsContent value="quotes">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Quotes Column */}
                <div className="lg:col-span-2 space-y-6">
                  {quotes.length > 0 ? (
                    <>
                      <div className="grid gap-6">
                        {quotes.map((quote) => (
                          <QuoteConversionCard 
                            key={quote.id}
                            quote={quote}
                            onEdit={setEditingQuote}
                            onView={setViewingQuote}
                            onDelete={handleDeleteQuote}
                            isDeleting={deletingQuoteId === quote.id}
                          />
                        ))}
                      </div>
                      
                      {/* ROI Calculator for all quotes */}
                      <ROICalculator 
                        totalCirculation={quotes.reduce((sum, q) => sum + (q.total_circulation || 0), 0)}
                        totalInvestment={quotes.reduce((sum, q) => sum + (q.final_total || 0), 0)}
                      />
                    </>
                  ) : (
                    <Card className="text-center py-12">
                      <CardContent>
                        <div className="mb-4">
                          <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Saved Quotes Yet</h3>
                          <p className="text-gray-500 mb-6">
                            Ready to reach thousands of local customers? Create your first advertising quote!
                          </p>
                        </div>
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
                          onClick={() => navigate('/advertising')}
                        >
                          Create Your First Quote
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar with conversion elements */}
                <div className="space-y-6">
                  <UrgencyAlerts />
                  <SuccessStories />
                  {quotes.length > 0 && quotes[0] && (
                    <CampaignTimeline quote={quotes[0]} />
                  )}
                </div>
              </div>

      {/* Quote Details Dialog */}
      <Dialog open={!!viewingQuote} onOpenChange={() => setViewingQuote(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Campaign Quote Details</DialogTitle>
            <DialogDescription>
              Complete overview of your advertising campaign
            </DialogDescription>
          </DialogHeader>
          
          {viewingQuote && (
            <div className="space-y-6">
              {/* Header Stats */}
              <div className="grid grid-cols-4 gap-4 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{formatPrice(viewingQuote.final_total)}</p>
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{(viewingQuote.total_circulation || 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Homes Reached</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{viewingQuote.selected_area_ids?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Areas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{formatPrice((viewingQuote.final_total || 0) / (viewingQuote.total_circulation || 1))}</p>
                  <p className="text-sm text-muted-foreground">Cost per Home</p>
                </div>
              </div>

              {/* Campaign & Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Campaign Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Campaign Title</p>
                      <p className="font-medium">{viewingQuote.title || 'Advertising Campaign'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pricing Model</p>
                      <p className="font-medium capitalize">{viewingQuote.pricing_model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{viewingQuote.duration_multiplier || 1} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Investment</p>
                      <p className="font-medium text-primary">{formatPrice(viewingQuote.monthly_price)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Name</p>
                      <p className="font-medium">{viewingQuote.contact_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{viewingQuote.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{viewingQuote.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{viewingQuote.company || 'Not provided'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline */}
              <CampaignTimeline quote={viewingQuote} />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => setEditingQuote(viewingQuote)}
                  className="flex-1"
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Quote
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  Book This Campaign
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setViewingQuote(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Quote Dialog */}
      <Dialog open={!!editingQuote} onOpenChange={() => setEditingQuote(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
            <DialogDescription>
              Update your quote details and pricing
            </DialogDescription>
          </DialogHeader>
          
          {editingQuote && (
            <EditQuoteForm
              quote={editingQuote}
              onSave={async (updatedQuote) => {
                try {
                  const { error } = await supabase
                    .from('quotes')
                    .update(updatedQuote)
                    .eq('id', editingQuote.id);
                  
                  if (error) throw error;
                  
                  toast({
                    title: "Success!",
                    description: "Quote updated successfully."
                  });
                  
                  setEditingQuote(null);
                  await loadQuotes();
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                  });
                }
              }}
              onCancel={() => setEditingQuote(null)}
            />
          )}
        </DialogContent>
      </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      
      {/* Password Setup Dialog */}
      <PasswordSetupDialog 
        open={showPasswordSetup} 
        onClose={() => setShowPasswordSetup(false)}
      />
    </div>
  );
};

export default Dashboard;