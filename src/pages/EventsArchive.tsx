import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Tag, Filter, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EventCard } from '@/components/EventCard';
import { Event } from '@/hooks/useEvents';

const EventsArchive = () => {
  const mountedRef = useRef(true);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Filter metadata
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

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
        .eq('is_published', true)
        .lt('date', today) // Only show past events
        .order('date', { ascending: sortOrder === 'oldest' });

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

      const { data, error } = await query;

      if (error) throw error;

      const mappedEvents = (data || []).map(event => ({
        ...event,
        links: Array.isArray(event.links) ? event.links : []
      })) as unknown as Event[];

      if (mountedRef.current) {
        setEvents(mappedEvents);
      }
    } catch (err) {
      console.error('Error fetching past events:', err);
      if (mountedRef.current) {
        setError('Failed to load past events. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load past events. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [searchTerm, selectedCategory, selectedArea, selectedType, sortOrder]);

  const fetchFilterMetadata = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('events')
        .select('category, area, type')
        .eq('is_published', true)
        .lt('date', today); // Only get metadata from past events

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
      <section className="bg-gradient-to-r from-muted to-muted/80 text-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link to="/whats-on" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Upcoming Events</span>
            </Link>
            <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-6">
              Events Archive
            </h1>
            <p className="text-xl lg:text-2xl font-body mb-4 max-w-3xl mx-auto text-muted-foreground">
              Browse past events from our community
            </p>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-heading font-bold text-foreground mb-2">
                Past Events
              </h2>
              <p className="text-muted-foreground font-body">
                {loading ? 'Loading events...' : `${events.length} past events found`}
              </p>
            </div>
            
            {/* Sort Order */}
            <div className="flex gap-2">
              <Button
                variant={sortOrder === 'newest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('newest')}
              >
                Most Recent
              </Button>
              <Button
                variant={sortOrder === 'oldest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('oldest')}
              >
                Oldest First
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
                  placeholder="Search past events..."
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
                <h3 className="text-lg font-heading font-semibold">Filter Past Events</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search past events..."
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
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedArea('all');
                      setSelectedType('all');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-lg shadow-sm border animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg inline-block mb-4">
                {error}
              </div>
              <div>
                <Button onClick={() => fetchEvents()}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {/* No Events Found */}
          {!loading && !error && events.length === 0 && (
            <div className="text-center py-16 bg-muted/30 rounded-lg">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                No Past Events Found
              </h3>
              <p className="text-muted-foreground font-body mb-6 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'all' || selectedArea !== 'all' || selectedType !== 'all'
                  ? "Try adjusting your filters to find what you're looking for."
                  : "There are no past events in the archive yet."}
              </p>
              {(searchTerm || selectedCategory !== 'all' || selectedArea !== 'all' || selectedType !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedArea('all');
                    setSelectedType('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventsArchive;
