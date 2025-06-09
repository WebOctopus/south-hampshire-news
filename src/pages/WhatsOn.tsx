
import { useState, useEffect } from 'react';
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

const WhatsOn = () => {
  // Enhanced mock events data with diverse categories
  const [allEvents] = useState([
    {
      id: 1,
      title: 'Fareham Food Festival',
      date: '2024-07-15',
      time: '10:00',
      location: 'Fareham Town Centre',
      area: 'Fareham',
      postcode: 'PO16',
      description: 'A celebration of local food and drink with over 50 stalls featuring the best of Hampshire cuisine.',
      organizer: 'Fareham Council',
      category: 'Food & Drink',
      type: 'Festival',
      image: '/lovable-uploads/39aad051-fc81-4d48-8360-29e479c12edb.png'
    },
    {
      id: 2,
      title: 'Hamlet at New Theatre Royal',
      date: '2024-07-18',
      time: '19:30',
      location: 'New Theatre Royal Portsmouth',
      area: 'Portsmouth',
      postcode: 'PO1',
      description: 'Shakespeare\'s greatest tragedy performed by the Royal Shakespeare Company.',
      organizer: 'New Theatre Royal',
      category: 'Theatre & Shows',
      type: 'Theatre',
      image: '/lovable-uploads/0cb5406a-eaee-4828-af68-e345305abd9e.png'
    },
    {
      id: 3,
      title: 'Community Garden Workshop',
      date: '2024-07-20',
      time: '14:00',
      location: 'Southsea Common',
      area: 'Southsea',
      postcode: 'PO5',
      description: 'Learn sustainable gardening techniques and help maintain our community garden.',
      organizer: 'Southsea Green Group',
      category: 'Community Activities',
      type: 'Workshop',
      image: '/lovable-uploads/25b8b054-62d4-42b8-858b-d8c91da6dc93.png'
    },
    {
      id: 4,
      title: 'Portsmouth Symphony Orchestra',
      date: '2024-07-22',
      time: '20:00',
      location: 'Portsmouth Guildhall',
      area: 'Portsmouth',
      postcode: 'PO1',
      description: 'Classical music evening featuring works by Mozart and Beethoven.',
      organizer: 'Portsmouth Guildhall',
      category: 'Music & Concerts',
      type: 'Concert',
      image: '/lovable-uploads/3457943e-ae98-43c0-b6cb-556d1d936472.png'
    },
    {
      id: 5,
      title: 'Local Artists Exhibition',
      date: '2024-07-25',
      time: '11:00',
      location: 'Aspex Gallery Portsmouth',
      area: 'Portsmouth',
      postcode: 'PO1',
      description: 'Showcase of contemporary art from local Hampshire artists.',
      organizer: 'Aspex Gallery',
      category: 'Arts & Culture',
      type: 'Exhibition',
      image: '/lovable-uploads/3734fd45-4163-4f5c-b495-06604192d54c.png'
    },
    {
      id: 6,
      title: 'Comedy Night at The Wedgewood Rooms',
      date: '2024-07-27',
      time: '20:00',
      location: 'The Wedgewood Rooms',
      area: 'Portsmouth',
      postcode: 'PO1',
      description: 'Stand-up comedy featuring touring comedians and local talent.',
      organizer: 'The Wedgewood Rooms',
      category: 'Theatre & Shows',
      type: 'Comedy',
      image: '/lovable-uploads/3bf54723-bde1-45e5-ba7d-fa1c6a9a1a1a.png'
    },
    {
      id: 7,
      title: 'Charity Fun Run',
      date: '2024-07-28',
      time: '09:00',
      location: 'Gosport Millennium Bridge',
      area: 'Gosport',
      postcode: 'PO12',
      description: '5K charity run to raise funds for local children\'s hospice.',
      organizer: 'Gosport Runners Club',
      category: 'Community Activities',
      type: 'Sports',
      image: '/lovable-uploads/5c775c6a-2d81-439b-871e-56243f2f1686.png'
    },
    {
      id: 8,
      title: 'Summer Film Festival',
      date: '2024-08-02',
      time: '19:00',
      location: 'Showcase Cinema Portsmouth',
      area: 'Portsmouth',
      postcode: 'PO6',
      description: 'Week-long festival featuring independent and classic films.',
      organizer: 'Portsmouth Film Society',
      category: 'Theatre & Shows',
      type: 'Film',
      image: '/lovable-uploads/5d7d823c-c298-48e4-81ca-f206cfb9e6f9.png'
    }
  ]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [filteredEvents, setFilteredEvents] = useState(allEvents);
  
  // View and date filter state
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  // Filter events based on search and filter criteria
  useEffect(() => {
    let filtered = allEvents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Area filter
    if (selectedArea !== 'all') {
      filtered = filtered.filter(event => event.area === selectedArea);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    // Date filter
    if (dateFilter) {
      const filterDateStr = dateFilter.toISOString().split('T')[0];
      filtered = filtered.filter(event => event.date === filterDateStr);
    }

    // Date range filter
    if (dateRange.from) {
      const fromDateStr = dateRange.from.toISOString().split('T')[0];
      filtered = filtered.filter(event => event.date >= fromDateStr);
    }
    if (dateRange.to) {
      const toDateStr = dateRange.to.toISOString().split('T')[0];
      filtered = filtered.filter(event => event.date <= toDateStr);
    }

    setFilteredEvents(filtered);
  }, [searchTerm, selectedCategory, selectedArea, selectedType, dateFilter, dateRange, allEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get unique values for filters
  const categories = [...new Set(allEvents.map(event => event.category))];
  const areas = [...new Set(allEvents.map(event => event.area))];
  const types = [...new Set(allEvents.map(event => event.type))];

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
                Don't miss out on these exciting local events ({filteredEvents.length} found)
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

          {/* Events Display - Grid or Calendar View */}
          {filteredEvents.length > 0 ? (
            viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event) => (
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
                <div className="flex justify-center mb-6">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={(date) => {
                      setDateFilter(date);
                      // Clear date range when selecting single date
                      setDateRange({ from: undefined, to: undefined });
                    }}
                    className="p-3 pointer-events-auto"
                    components={{
                      Day: ({ date, ...props }) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const dayEvents = filteredEvents.filter(event => event.date === dateStr);
                        const hasEvents = dayEvents.length > 0;
                        const isSelected = dateFilter && dateFilter.toISOString().split('T')[0] === dateStr;
                        
                        return (
                          <div className="relative">
                            <button
                              {...props}
                              onClick={() => {
                                setDateFilter(date);
                                setDateRange({ from: undefined, to: undefined });
                              }}
                              className={`relative h-9 w-9 p-0 font-normal transition-colors ${
                                isSelected 
                                  ? 'bg-community-green text-white font-semibold' 
                                  : hasEvents 
                                    ? 'bg-community-green/20 text-community-navy font-semibold hover:bg-community-green/30' 
                                    : 'hover:bg-gray-100'
                              }`}
                            >
                              {date.getDate()}
                              {hasEvents && !isSelected && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-community-green rounded-full"></div>
                              )}
                            </button>
                          </div>
                        );
                      }
                    }}
                  />
                </div>
                
                {/* Events for selected/current month */}
                <div className="space-y-4">
                  <h3 className="text-lg font-heading font-semibold text-community-navy mb-4">
                    Events This Month
                  </h3>
                  <div className="grid gap-4">
                    {filteredEvents.map((event) => (
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
