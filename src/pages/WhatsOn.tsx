import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Calendar, MapPin, Clock, Tag, Filter, Search, Grid, CalendarDays, Star, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, isWithinInterval } from 'date-fns';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EventCard } from '@/components/EventCard';
import { Event } from '@/hooks/useEvents';
import AuthPromptDialog from '@/components/AuthPromptDialog';
import { useAuth } from '@/contexts/AuthContext';

type QuickFilter = 'all' | 'week' | 'month' | 'next_month';

const WhatsOn = () => {
  const mountedRef = useRef(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Auth dialog state
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  
  // View and date filter state
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  // Filter metadata
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  const handleAddEvent = useCallback(() => {
    if (user) {
      navigate('/add-event');
    } else {
      setShowAuthDialog(true);
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    navigate('/add-event');
  };

  // Handle ?tab=add query param to trigger add event flow
  useEffect(() => {
    if (searchParams.get('tab') === 'add') {
      // Clear the param to prevent re-triggering
      setSearchParams({}, { replace: true });
      handleAddEvent();
    }
  }, [searchParams, setSearchParams, handleAddEvent]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_published', true) // Only show published events
        .gte('date', today) // Only show today and future events
        .order('date', { ascending: true });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedArea !== 'all') {
        query = query.eq('area', selectedArea);
      }

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      if (dateFilter) {
        const filterDateStr = dateFilter.toISOString().split('T')[0];
        query = query.eq('date', filterDateStr);
      }

      if (dateRange.from) {
        const fromDateStr = dateRange.from.toISOString().split('T')[0];
        query = query.gte('date', fromDateStr);
      }
      if (dateRange.to) {
        const toDateStr = dateRange.to.toISOString().split('T')[0];
        query = query.lte('date', toDateStr);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map data to Event type with proper type casting
      const mappedEvents = (data || []).map(event => ({
        ...event,
        links: Array.isArray(event.links) ? event.links : []
      })) as unknown as Event[];

      if (mountedRef.current) {
        setEvents(mappedEvents);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      if (mountedRef.current) {
        setError('Failed to load events. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [searchTerm, selectedCategory, selectedArea, selectedType, dateFilter, dateRange.from, dateRange.to]);

  const fetchFilterMetadata = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('events')
        .select('category, area, type')
        .eq('is_published', true)
        .gte('date', today); // Only get metadata from current/future events

      if (error) throw error;

      if (data) {
        const uniqueCategories = [...new Set(data.map(event => event.category))];
        const uniqueAreas = [...new Set(data.map(event => event.area))];
        const uniqueTypes = [...new Set(data.map(event => event.type))];
        
        setCategories(uniqueCategories);
        setAreas(uniqueAreas);
        setTypes(uniqueTypes);
      }
    } catch (err) {
      console.error('Error fetching filter metadata:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && loading) {
        setLoading(false);
      }
    }, 10000);
    
    return () => clearTimeout(timeoutId);
  }, [fetchEvents]);

  useEffect(() => {
    fetchFilterMetadata();
  }, []);

  // Get featured events
  const featuredEvents = events.filter(e => e.featured);

  // Apply quick filter
  const getFilteredEvents = () => {
    const today = new Date();
    
    if (quickFilter === 'week') {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
      });
    }
    
    if (quickFilter === 'month') {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
      });
    }

    if (quickFilter === 'next_month') {
      const nextMonth = addMonths(today, 1);
      const nextMonthStart = startOfMonth(nextMonth);
      const nextMonthEnd = endOfMonth(nextMonth);
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return isWithinInterval(eventDate, { start: nextMonthStart, end: nextMonthEnd });
      });
    }
    
    return events;
  };

  const filteredEvents = getFilteredEvents();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-6">
              What's On
            </h1>
            <p className="text-xl lg:text-2xl font-body mb-8 max-w-3xl mx-auto opacity-90">
              Discover the best events, activities, and entertainment in your local area
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="font-semibold px-8 py-3"
                onClick={handleAddEvent}
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Your Event
              </Button>
              <Link to="/whats-on/archive">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="font-semibold px-8 py-3 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Archive className="mr-2 h-5 w-5" />
                  View Past Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">
                Featured Events
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-heading font-bold text-foreground mb-2">
                Upcoming Events
              </h2>
              <p className="text-muted-foreground font-body">
                {loading ? 'Loading events...' : `${filteredEvents.length} events found`}
              </p>
            </div>
            
            {/* Quick Filter Pills */}
            <div className="flex gap-2">
              <Button
                variant={quickFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuickFilter('all')}
              >
                All Events
              </Button>
              <Button
                variant={quickFilter === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuickFilter('week')}
              >
                This Week
              </Button>
              <Button
                variant={quickFilter === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuickFilter('month')}
              >
                This Month
              </Button>
              <Button
                variant={quickFilter === 'next_month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuickFilter('next_month')}
              >
                Next Month
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-card rounded-lg shadow-sm border mb-8">
            {/* Mobile Search */}
            <div className="p-4 border-b md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Mobile Accordion Filters */}
            <div className="md:hidden">
              <Accordion type="single" collapsible>
                <AccordionItem value="filters" className="border-none">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-primary" />
                      <span className="text-base font-heading font-semibold">
                        More Filters
                      </span>
                      {(selectedCategory !== 'all' || selectedArea !== 'all' || selectedType !== 'all') && (
                        <Badge variant="secondary" className="ml-2 text-xs">Active</Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="h-12">
                            <Tag className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Area</label>
                        <Select value={selectedArea} onValueChange={setSelectedArea}>
                          <SelectTrigger className="h-12">
                            <MapPin className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="All Areas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Areas</SelectItem>
                            {areas.map((area) => (
                              <SelectItem key={area} value={area}>{area}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Type</label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger className="h-12">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {types.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {(searchTerm || selectedCategory !== 'all' || selectedArea !== 'all' || selectedType !== 'all') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('all');
                            setSelectedArea('all');
                            setSelectedType('all');
                            setQuickFilter('all');
                          }}
                          className="w-full"
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:block p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-heading font-semibold">Filter Events</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Tag className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger>
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(searchTerm || selectedCategory !== 'all' || selectedArea !== 'all' || selectedType !== 'all') && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedArea('all');
                      setSelectedType('all');
                      setQuickFilter('all');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-end items-center mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="mr-2 h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                List
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-xl font-heading font-semibold text-muted-foreground mb-2">
                  Loading Events...
                </h3>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Calendar className="h-16 w-16 text-destructive/30 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold text-destructive mb-2">
                  Error Loading Events
                </h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button variant="outline" onClick={() => fetchEvents()}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredEvents.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="block">
                    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                          {event.image ? (
                            <img 
                              src={event.image} 
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="text-lg font-heading font-semibold mb-1 hover:text-primary transition-colors">
                                {event.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center gap-1">
                                  <CalendarDays className="h-4 w-4" />
                                  {formatDate(event.date)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {event.time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.area}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {event.excerpt || event.description}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <Badge variant="secondary" className="text-xs">
                                {event.category}
                              </Badge>
                              {event.featured && (
                                <Badge className="bg-yellow-500 hover:bg-yellow-500 text-yellow-950 text-xs">
                                  <Star className="h-3 w-3 mr-1 fill-current" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold text-muted-foreground mb-2">
                  No Events Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms to find more events.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedArea('all');
                    setSelectedType('all');
                    setQuickFilter('all');
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <h3 className="text-xl font-heading font-bold mb-4">
                  Have an Event to Share?
                </h3>
                <p className="text-muted-foreground font-body mb-6">
                  Submit your local event and reach hundreds of community members
                </p>
                <Button className="w-full" onClick={handleAddEvent}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

      <AuthPromptDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
        redirectPath="/add-event"
      />
    </div>
  );
};

export default WhatsOn;
