import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { User } from '@supabase/supabase-js';
import { Edit, Calendar, Trash2, Phone, ChevronDown, ChevronUp, Eye, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPrice } from '@/lib/pricingCalculator';
import { format } from 'date-fns';
import EditQuoteForm from '@/components/EditQuoteForm';
import PasswordSetupDialog from '@/components/PasswordSetupDialog';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import QuoteConversionCard from '@/components/dashboard/QuoteConversionCard';
import SuccessStories from '@/components/dashboard/SuccessStories';
import UrgencyAlerts from '@/components/dashboard/UrgencyAlerts';
import ROICalculator from '@/components/dashboard/ROICalculator';
import CampaignTimeline from '@/components/dashboard/CampaignTimeline';
import DeleteQuoteDialog from '@/components/dashboard/DeleteQuoteDialog';
import BookingCard from '@/components/dashboard/BookingCard';
import { BookingDetailsDialog } from '@/components/dashboard/BookingDetailsDialog';
import VouchersSection from '@/components/dashboard/VouchersSection';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import CreateBookingForm from '@/components/dashboard/CreateBookingForm';

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
  const [quoteToDelete, setQuoteToDelete] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [voucherCount, setVoucherCount] = useState(0);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [quotesExpanded, setQuotesExpanded] = useState(true);
  
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

  // Check for returning BOGOF customer flag
  useEffect(() => {
    const isReturningBogof = localStorage.getItem('returningBogofCustomer');
    if (isReturningBogof === 'true') {
      toast({
        title: "Welcome back!",
        description: "We've saved your interest in the 3+ Repeat Package. Since you've used this offer before, our team will contact you within 24 hours with exclusive returning customer rates.",
        duration: 8000,
      });
      localStorage.removeItem('returningBogofCustomer');
    }
  }, [toast]);

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

  const loadBookings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      setBookings(data);
    }
  };

  const loadVoucherCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('vouchers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);
    setVoucherCount(count || 0);
  };

  const checkAndUpdateFirstLogin = async () => {
    if (!user) return;
    
    // Fetch user profile to check if first login
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_first_login')
      .eq('user_id', user.id)
      .single();
    
    if (profile?.is_first_login) {
      setIsFirstLogin(true);
      
      // Update the profile to mark as no longer first login
      await supabase
        .from('profiles')
        .update({ is_first_login: false })
        .eq('user_id', user.id);
    } else {
      setIsFirstLogin(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBusinesses();
      loadEvents();
      loadQuotes();
      loadBookings();
      loadVoucherCount();
      checkAndUpdateFirstLogin();
      
      // Check if user came from calculator and set appropriate tab
      const isNewUserFromCalculator = localStorage.getItem('newUserFromCalculator');
      const justSavedQuote = localStorage.getItem('justSavedQuote');
      const justCreatedBooking = localStorage.getItem('justCreatedBooking');
      const showVoucherNotification = localStorage.getItem('showVoucherNotification');
      
      if (isNewUserFromCalculator === 'true' || justSavedQuote === 'true') {
        setActiveTab('quotes');
        localStorage.removeItem('newUserFromCalculator');
        localStorage.removeItem('justSavedQuote');
        
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
      
      if (justCreatedBooking === 'true') {
        setActiveTab('bookings');
        localStorage.removeItem('justCreatedBooking');
        
        // Reload voucher count after booking creation in case a voucher was generated
        setTimeout(() => {
          loadVoucherCount();
        }, 1000);
      }

      if (showVoucherNotification === 'true') {
        setActiveTab('bookings');
        localStorage.removeItem('showVoucherNotification');
        
        setTimeout(() => {
          toast({
            title: "Bonus Voucher Earned! 🎉",
            description: "You've received a 10% leafleting service voucher! Check your booking below to redeem it.",
            duration: 8000,
          });
          loadVoucherCount();
        }, 1500);
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
        
        const isNewUserFromCalculator = localStorage.getItem('newUserFromCalculator');
        if (isNewUserFromCalculator === 'true') {
          localStorage.removeItem('newUserFromCalculator');
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
    setDeletingQuoteId(quoteId);
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Quote deleted successfully.' });
      await loadQuotes();
      setQuoteToDelete(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeletingQuoteId(null);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setDeletingBookingId(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking Deleted",
        description: "Your booking has been removed successfully.",
      });

      await loadBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeletingBookingId(null);
    }
  };

  const handleDeleteQuoteClick = (quote: any) => {
    setQuoteToDelete(quote);
  };

  const handleBookNow = async (quote: any) => {
    if (!user) return;

    setSubmitting(true);
    try {
      // Create booking from quote data
      const bookingData = {
        user_id: user.id,
        contact_name: quote.contact_name,
        email: quote.email,
        company: quote.company,
        phone: quote.phone,
        title: quote.title,
        pricing_model: quote.pricing_model,
        ad_size_id: quote.ad_size_id,
        duration_id: quote.duration_id,
        selected_area_ids: quote.selected_area_ids || [],
        bogof_paid_area_ids: quote.bogof_paid_area_ids || [],
        bogof_free_area_ids: quote.bogof_free_area_ids || [],
        monthly_price: quote.monthly_price,
        subtotal: quote.subtotal,
        final_total: quote.final_total,
        duration_multiplier: quote.duration_multiplier,
        total_circulation: quote.total_circulation,
        volume_discount_percent: quote.volume_discount_percent,
        duration_discount_percent: quote.duration_discount_percent,
        pricing_breakdown: quote.pricing_breakdown,
        selections: quote.selections,
        status: 'pending',
        notes: quote.notes,
        webhook_payload: {}
      };

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (bookingError) throw bookingError;

      // Delete the quote after successfully creating the booking
      const { error: deleteError } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quote.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Booking Created!",
        description: "Your campaign has been booked successfully. We'll be in touch soon!",
      });

      // Reload both quotes and bookings, then switch to bookings tab
      await Promise.all([loadQuotes(), loadBookings()]);
      setActiveTab('bookings');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
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

  const renderCreateBusinessForm = () => (
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
            className="w-full"
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
  );

  const renderBusinessListings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Your Business Listings</CardTitle>
        {hasExistingBusiness && (
          <p className="text-sm text-muted-foreground">
            You can only have one business listing per account. To add a different business, please edit your existing listing.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {businesses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
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
                          ? 'bg-success/10 text-success' 
                          : 'bg-destructive/10 text-destructive'
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
  );

  const renderCreateEventForm = () => (
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
                placeholder="Area/Region"
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
                placeholder="SW1A 1AA"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-category" className="block text-sm font-medium mb-1">
                Category
              </label>
              <Input
                id="event-category"
                value={eventFormData.category}
                onChange={(e) => handleEventInputChange('category', e.target.value)}
                placeholder="e.g., Concert, Workshop, Festival"
              />
            </div>

            <div>
              <label htmlFor="event-type" className="block text-sm font-medium mb-1">
                Event Type
              </label>
              <Select 
                value={eventFormData.type} 
                onValueChange={(value) => handleEventInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public Event</SelectItem>
                  <SelectItem value="private">Private Event</SelectItem>
                  <SelectItem value="ticketed">Ticketed Event</SelectItem>
                  <SelectItem value="free">Free Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={submitting || !eventFormData.title || !eventFormData.date || !eventFormData.time || !eventFormData.location || !eventFormData.area}
          >
            {submitting 
              ? (editingEvent ? 'Updating Event...' : 'Creating Event...') 
              : (editingEvent ? 'Update Event' : 'Create Event')
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderEventListings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Your Events</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
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
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      {event.date && new Date(event.date).toLocaleDateString()}
                      {event.time && ` at ${event.time}`}
                    </TableCell>
                    <TableCell>
                      {event.location}
                      {event.area && `, ${event.area}`}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{event.type || 'Not specified'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                          className="flex items-center gap-1"
                        >
                          <Edit size={12} />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 size={12} />
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
  );

  const renderSavedQuotesDropdown = () => {
    const getStatusBadge = (quote: any) => {
      if (quote.status === 'bogof_return_interest') {
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Awaiting Contact</Badge>;
      }
      if (quote.status === 'draft') {
        return <Badge variant="outline">Draft</Badge>;
      }
      if (quote.status === 'active' || quote.status === 'approved') {
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      }
      return <Badge variant="secondary">{quote.status}</Badge>;
    };

    return (
      <Card className="p-6">
        <Collapsible open={quotesExpanded} onOpenChange={setQuotesExpanded}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Your Saved Quotes</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {quotesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>

          {quotes.length > 0 && quotes[0]?.status === 'bogof_return_interest' && (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Returning Customer Quote Saved</strong><br />
                This quote was saved because you've previously used our 3+ Repeat Package offer. Our team will contact you within 24 hours with exclusive returning customer rates!
              </AlertDescription>
            </Alert>
          )}

          <CollapsibleContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Date Created</th>
                    <th className="text-left p-4 font-semibold">Campaign Type</th>
                    <th className="text-left p-4 font-semibold">Total Cost</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        {format(new Date(quote.created_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="capitalize">
                            {quote.pricing_model === 'bogof' ? 'Bogof' : 
                             quote.pricing_model === 'fixed_term' ? 'Fixed Term' : 
                             quote.pricing_model === 'leafleting' ? 'Leafleting' : 
                             quote.pricing_model}
                          </span>
                          {getStatusBadge(quote)}
                        </div>
                      </td>
                      <td className="p-4 font-semibold">
                        £{quote.final_total?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingQuote(quote)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingQuote(quote)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteQuoteClick(quote.id)}
                            disabled={deletingQuoteId === quote.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  const renderQuotes = () => (
    <div className="space-y-6">
      {renderSavedQuotesDropdown()}
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Latest Quote</h3>
        <QuoteConversionCard 
          quote={quotes[0] || null}
          onEdit={setEditingQuote}
          onView={setViewingQuote}
          onDelete={handleDeleteQuoteClick}
          onBookNow={handleBookNow}
          isDeleting={deletingQuoteId === quotes[0]?.id}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Your ROI Calculator</h3>
        <ROICalculator 
          totalCirculation={quotes[0]?.total_circulation || 50000}
          totalInvestment={quotes[0]?.final_total || 1000}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Saved Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.some(q => q.status === 'bogof_return_interest') && (
            <Alert className="mb-4 border-amber-300 bg-amber-50">
              <AlertDescription className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Phone className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-medium text-amber-900 mb-1">
                    Returning Customer Quote Saved
                  </p>
                  <p className="text-sm text-amber-800">
                    This quote was saved because you've previously used our 3+ Repeat Package offer. 
                    Our team will contact you within 24 hours with exclusive returning customer rates!
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
          {quotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>You don't have any saved quotes yet.</p>
              <p className="mt-2">Visit our advertising calculator to create your first quote!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Campaign Type</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        {new Date(quote.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        {quote.pricing_model?.replace('_', ' ') || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {quote.status === 'bogof_return_interest' ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            Awaiting Contact
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            Ready to Book
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(quote.final_total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingQuote(quote)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingQuote(quote)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteQuoteClick(quote)}
                          >
                            <Trash2 className="w-4 h-4" />
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
      
      <div className="space-y-6">
        <CampaignTimeline quote={quotes[0] || null} />
        <SuccessStories />
      </div>
    </div>
  );

  const renderBookings = () => {
    // Preview mode disabled - bookings are now live
    const PREVIEW_AS_PAID = false;
    
    const unpaidBookings = PREVIEW_AS_PAID 
      ? [] 
      : bookings.filter(b => !b.payment_status || b.payment_status === 'pending');
    
    return (
      <div className="space-y-6">
        {/* Payment Required Banner */}
        {unpaidBookings.length > 0 && (
          <div className="relative overflow-hidden rounded-lg border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-6 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-amber-400/20 animate-pulse" />
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-900 mb-2">
                  Payment Required for {unpaidBookings.length} Booking{unpaidBookings.length > 1 ? 's' : ''}
                </h3>
                <p className="text-amber-800 mb-4">
                  Complete your payment to secure your advertising campaign and start reaching your audience. Click on any unpaid booking below to choose your payment option.
                </p>
                <div className="flex flex-wrap gap-2">
                  {unpaidBookings.map((booking) => (
                    <Button
                      key={booking.id}
                      variant="outline"
                      size="sm"
                      className="bg-white/80 hover:bg-white border-amber-300 text-amber-900 font-medium"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setBookingDetailsOpen(true);
                      }}
                    >
                      Pay {booking.title}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You don't have any bookings yet.</p>
                <p className="mt-2">Book an advertising campaign to see it here!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onDelete={() => handleDeleteBooking(booking.id)}
                    isDeleting={deletingBookingId === booking.id}
                    onViewDetails={(booking) => {
                      setSelectedBooking(booking);
                      setBookingDetailsOpen(true);
                    }}
                    onNavigateToVouchers={() => setActiveTab('vouchers')}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProfileSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="profile-email">Email</Label>
            <Input 
              id="profile-email" 
              type="email" 
              value={user?.email || ''} 
              disabled 
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="profile-id">User ID</Label>
            <Input 
              id="profile-id" 
              value={user?.id || ''} 
              disabled 
              className="bg-muted text-xs"
            />
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Account Actions</h4>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Update Email Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex w-full">
        <DashboardSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          businessCount={businesses.length}
          eventCount={events.length}
          quoteCount={quotes.length}
          bookingCount={bookings.length}
          voucherCount={voucherCount}
          editingBusiness={editingBusiness}
          editingEvent={editingEvent}
        />
        
        <SidebarInset className="flex-1 min-w-0">
          <DashboardHeader 
            user={user} 
            onProfileClick={() => setActiveTab('profile')}
          />
          
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
              <WelcomeHeader 
                user={user} 
                quotes={quotes} 
                bookings={bookings} 
                isFirstLogin={isFirstLogin}
                onBookNowClick={() => setActiveTab('bookings')}
              />
              
              {activeTab === 'create-booking' && user && (
                <CreateBookingForm
                  user={user}
                  onBookingCreated={() => {
                    loadBookings();
                    setActiveTab('bookings');
                  }}
                  onQuoteSaved={() => {
                    loadQuotes();
                    setActiveTab('quotes');
                  }}
                />
              )}
              {activeTab === 'create' && renderCreateBusinessForm()}
              {activeTab === 'listings' && renderBusinessListings()}
              {activeTab === 'create-event' && renderCreateEventForm()}
              {activeTab === 'events' && renderEventListings()}
              {activeTab === 'quotes' && renderQuotes()}
              {activeTab === 'bookings' && renderBookings()}
              {activeTab === 'vouchers' && user && <VouchersSection user={user} />}
              {activeTab === 'profile' && renderProfileSettings()}
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Navigation and Footer moved outside sidebar layout */}
      <div className="hidden">
        <Navigation />
        <Footer />
      </div>

      <Dialog open={!!viewingQuote} onOpenChange={() => setViewingQuote(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
            <DialogDescription>
              Created on {viewingQuote && new Date(viewingQuote.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          {viewingQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Campaign Type</Label>
                  <p className="capitalize">{viewingQuote.campaign_type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label>Total Cost</Label>
                  <p className="font-semibold text-lg">{formatPrice(viewingQuote.total_cost)}</p>
                </div>
              </div>
              {viewingQuote.advert_size && (
                <div>
                  <Label>Advert Size</Label>
                  <p>{viewingQuote.advert_size}</p>
                </div>
              )}
              {viewingQuote.locations && viewingQuote.locations.length > 0 && (
                <div>
                  <Label>Locations</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {viewingQuote.locations.map((location: any, index: number) => (
                      <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                        {location.name || location}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {viewingQuote.quantity && (
                <div>
                  <Label>Quantity</Label>
                  <p>{viewingQuote.quantity.toLocaleString()}</p>
                </div>
              )}
              {viewingQuote.contact_name && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p>{viewingQuote.contact_name}</p>
                    </div>
                    {viewingQuote.contact_email && (
                      <div>
                        <Label>Email</Label>
                        <p>{viewingQuote.contact_email}</p>
                      </div>
                    )}
                    {viewingQuote.contact_phone && (
                      <div>
                        <Label>Phone</Label>
                        <p>{viewingQuote.contact_phone}</p>
                      </div>
                    )}
                    {viewingQuote.company_name && (
                      <div>
                        <Label>Company</Label>
                        <p>{viewingQuote.company_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingQuote} onOpenChange={() => setEditingQuote(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
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
                    title: 'Quote Updated',
                    description: 'Your quote has been updated successfully.'
                  });
                  
                  setEditingQuote(null);
                  loadQuotes();
                } catch (error: any) {
                  toast({
                    title: 'Error',
                    description: error.message,
                    variant: 'destructive'
                  });
                }
              }}
              onCancel={() => setEditingQuote(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteQuoteDialog
        open={!!quoteToDelete}
        onClose={() => setQuoteToDelete(null)}
        onConfirm={() => quoteToDelete && handleDeleteQuote(quoteToDelete.id)}
        quote={quoteToDelete}
        isDeleting={deletingQuoteId === quoteToDelete?.id}
      />

      <PasswordSetupDialog
        open={showPasswordSetup}
        onClose={() => setShowPasswordSetup(false)}
      />

      <ChangePasswordDialog
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <BookingDetailsDialog
        booking={selectedBooking}
        open={bookingDetailsOpen}
        onOpenChange={setBookingDetailsOpen}
      />
    </SidebarProvider>
  );
};

export default Dashboard;