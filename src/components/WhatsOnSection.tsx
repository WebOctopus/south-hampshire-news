import { useState } from 'react';
import { Calendar, MapPin, Plus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Community Garden Workshop',
    excerpt: 'Learn sustainable gardening techniques and connect with fellow green thumbs in our monthly workshop.',
    date: '2024-07-15',
    time: '10:00 AM',
    location: 'Community Center',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
    category: 'Workshop'
  },
  {
    id: '2',
    title: 'Local Art Exhibition',
    excerpt: 'Showcase of talented local artists featuring paintings, sculptures, and mixed media installations.',
    date: '2024-07-20',
    time: '6:00 PM',
    location: 'Art Gallery',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400',
    category: 'Arts'
  },
  {
    id: '3',
    title: 'Summer Music Festival',
    excerpt: 'Enjoy live performances from local bands and musicians in this outdoor summer celebration.',
    date: '2024-08-05',
    time: '2:00 PM',
    location: 'Central Park',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    category: 'Music'
  },
  {
    id: '4',
    title: 'Cooking Class: Italian Cuisine',
    excerpt: 'Master the art of authentic Italian cooking with our experienced chef in this hands-on class.',
    date: '2024-08-12',
    time: '7:00 PM',
    location: 'Culinary School',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
    category: 'Food'
  },
  {
    id: '5',
    title: 'Charity Fun Run',
    excerpt: 'Join us for a 5K fun run to raise funds for local children\'s charities. All fitness levels welcome.',
    date: '2024-08-18',
    time: '8:00 AM',
    location: 'Town Square',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400',
    category: 'Sports'
  },
  {
    id: '6',
    title: 'Book Club Meeting',
    excerpt: 'Monthly discussion of our current book selection. This month: "The Seven Husbands of Evelyn Hugo".',
    date: '2024-08-25',
    time: '7:30 PM',
    location: 'Public Library',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    category: 'Literature'
  }
];

const months = [
  'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WhatsOnSection = () => {
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [postcode, setPostcode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: ''
    }
  });

  const eventsPerPage = 4;
  const totalPages = Math.ceil(mockEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const displayedEvents = mockEvents.slice(startIndex, startIndex + eventsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    return { day, month };
  };

  const onSubmit = (data: any) => {
    toast({
      title: "Event Submitted!",
      description: "Your event has been submitted for review and will be published soon.",
    });
    form.reset();
    setIsModalOpen(false);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
            What's On
          </h2>
          <p className="text-xl text-gray-600 font-body max-w-3xl mx-auto">
            Discover exciting events, workshops, and activities happening in your community
          </p>
        </div>

        {/* Filters and Add Event Button */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Enter postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="pl-10 w-full sm:w-48"
              />
            </div>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-community-green hover:bg-community-green/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Your Event</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your event" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Event location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="arts">Arts</SelectItem>
                              <SelectItem value="music">Music</SelectItem>
                              <SelectItem value="food">Food</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="literature">Literature</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Submit Event
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {displayedEvents.map((event) => {
            const { day, month } = formatDate(event.date);
            return (
              <Card key={event.id} className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-white rounded-lg p-2 text-center shadow-md">
                    <div className="text-2xl font-bold text-community-navy">{day}</div>
                    <div className="text-sm text-gray-600 uppercase">{month}</div>
                  </div>
                  <div className="absolute top-4 right-4 bg-community-green text-white px-2 py-1 rounded-full text-xs">
                    {event.category}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-heading font-semibold text-community-navy mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 font-body mb-4 line-clamp-2">
                    {event.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink 
                  href="#" 
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
};

export default WhatsOnSection;