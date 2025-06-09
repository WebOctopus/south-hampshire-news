
import { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, MapPin, Clock, Tag, Filter, Search, Grid, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const WhatsOn = () => {
  // State management
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  
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

  // Fetch events with filters
  const fetchEvents = useCallback(async () => {
    try {
      console.log('Fetching events...');
      setLoading(true);
      setError(null);

      let query = supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      console.log('Query built, executing...');

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      // Apply area filter
      if (selectedArea !== 'all') {
        query = query.eq('area', selectedArea);
      }

      // Apply type filter
      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      // Apply date filter
      if (dateFilter) {
        const filterDateStr = dateFilter.toISOString().split('T')[0];
        query = query.eq('date', filterDateStr);
      }

      // Apply date range filter
      if (dateRange.from) {
        const fromDateStr = dateRange.from.toISOString().split('T')[0];
        query = query.gte('date', fromDateStr);
      }
      if (dateRange.to) {
        const toDateStr = dateRange.to.toISOString().split('T')[0];
        query = query.lte('date', toDateStr);
      }

      const { data, error } = await query;
      console.log('Query response:', { data, error, dataLength: data?.length });

      if (error) {
        throw error;
      }

      console.log('Setting events:', data);
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedArea, selectedType, dateFilter, dateRange.from, dateRange.to]);

  // Fetch filter metadata
  const fetchFilterMetadata = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('category, area, type');

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

  // Fetch events when filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Initial load
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
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-community-navy to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-6">
              What's On
            </h1>
            <p className="text-xl lg:text-2xl font-body mb-8 max-w-3xl mx-auto">
              Discover the best events, activities, and entertainment in your local area
            </p>
            <Link to="/add-event">
              <Button 
                size="lg" 
                className="bg-community-green hover:bg-green-600 text-white font-semibold px-8 py-3"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Your Event
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-4">
                Upcoming Events
              </h2>
              <p className="text-gray-600 font-body">
                {loading ? 'Loading events...' : `Don't miss out on these exciting local events (${events.length} found)`}
              </p>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-community-navy" />
              <h3 className="text-lg font-heading font-semibold text-community-navy">Filter Events</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Tag className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Area Filter */}
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="lg:col-span-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Single Date Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* Date Range From */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "PPP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* Date Range To */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory !== 'all' || selectedArea !== 'all' || selectedType !== 'all' || dateFilter || dateRange.from || dateRange.to) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedArea('all');
                    setSelectedType('all');
                    setDateFilter(undefined);
                    setDateRange({ from: undefined, to: undefined });
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* View Toggle and Calendar Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="mr-2 h-4 w-4" />
                Grid View
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Calendar View
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-community-green mx-auto mb-4"></div>
                <h3 className="text-xl font-heading font-semibold text-gray-600 mb-2">
                  Loading Events...
                </h3>
                <p className="text-gray-500">
                  Please wait while we fetch the latest events for you.
                </p>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Calendar className="h-16 w-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold text-red-600 mb-2">
                  Error Loading Events
                </h3>
                <p className="text-gray-500 mb-6">
                  {error}
                </p>
                <Button
                  variant="outline"
                  onClick={() => fetchEvents()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : events.length > 0 ? (
            viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <Card key={event.id} className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                    {/* Event Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-community-green text-white">
                          {event.category}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-white/90 text-community-navy">
                          {event.type}
                        </Badge>
                      </div>
                      {/* Date Badge */}
                      <div className="absolute bottom-3 left-3 bg-white rounded-lg p-2 text-center shadow-md">
                        <div className="text-lg font-bold text-community-navy">
                          {new Date(event.date).getDate()}
                        </div>
                        <div className="text-xs text-gray-600 uppercase">
                          {new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}
                        </div>
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-xl text-community-navy hover:text-community-green transition-colors">
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}, {event.area}</span>
                        </div>
                        <p className="text-gray-700 font-body leading-relaxed line-clamp-3">
                          {event.description}
                        </p>
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Organized by {event.organizer}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Calendar View */
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Events listing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-heading font-semibold text-community-navy mb-4">
                    Events
                  </h3>
                   <div className="grid gap-4">
                     {events.map((event) => (
                      <Card key={event.id} className="p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                            <img 
                              src={event.image} 
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-lg font-heading font-semibold text-community-navy mb-1">
                                  {event.title}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
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
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {event.description}
                                </p>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <Badge className="bg-community-green text-white text-xs">
                                  {event.category}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {event.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            /* No Results */
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold text-gray-600 mb-2">
                  No Events Found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search terms to find more events.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedArea('all');
                    setSelectedType('all');
                    setDateFilter(undefined);
                    setDateRange({ from: undefined, to: undefined });
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
                <h3 className="text-xl font-heading font-bold text-community-navy mb-4">
                  Have an Event to Share?
                </h3>
                <p className="text-gray-600 font-body mb-6">
                  Submit your local event and reach hundreds of community members
                </p>
                <Link to="/add-event">
                  <Button className="w-full bg-community-green hover:bg-green-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhatsOn;
