import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  ExternalLink, 
  ArrowLeft, 
  Share2,
  Ticket,
  Star
} from 'lucide-react';
import { Event, EventLink } from '@/hooks/useEvents';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .eq('is_published', true)
          .single();

        if (error) throw error;

        const mappedEvent: Event = {
          ...data,
          links: Array.isArray(data.links) ? (data.links as unknown as EventLink[]) : []
        };

        setEvent(mappedEvent);

        // Fetch related events
        const { data: related } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .eq('category', data.category)
          .neq('id', id)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .limit(3);

        if (related) {
          setRelatedEvents(related.map(e => ({
            ...e,
            links: Array.isArray(e.links) ? (e.links as unknown as EventLink[]) : []
          })));
        }
      } catch (error: any) {
        console.error('Error fetching event:', error);
        toast({
          title: 'Error',
          description: 'Event not found',
          variant: 'destructive'
        });
        navigate('/whats-on');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate, toast]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.excerpt || event?.description || '',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Event link copied to clipboard'
      });
    }
  };

  const generateCalendarLink = () => {
    if (!event) return '';
    
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = event.end_time 
      ? new Date(`${event.date}T${event.end_time}`)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatDateForCal = (date: Date) => 
      date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDateForCal(startDate)}/${formatDateForCal(endDate)}&location=${encodeURIComponent(event.location)}&details=${encodeURIComponent(event.excerpt || event.description || '')}`;
    
    return calendarUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-64 w-full rounded-xl mb-6" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative">
          {event.image ? (
            <div className="h-64 md:h-96 w-full">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>
          ) : (
            <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 to-primary/10" />
          )}
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/whats-on')}
            className="mb-4 bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardContent className="p-6 md:p-8">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge>{event.category}</Badge>
                    <Badge variant="outline">{event.type}</Badge>
                    {event.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>

                  {/* Date & Time */}
                  <div className="flex flex-wrap gap-4 mb-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>
                        {formatTime(event.time)}
                        {event.end_time && ` - ${formatTime(event.end_time)}`}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 mb-6 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{event.location}</p>
                      <p>{event.area}{event.postcode && `, ${event.postcode}`}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose prose-sm max-w-none">
                    {event.full_description ? (
                      <div className="whitespace-pre-wrap">{event.full_description}</div>
                    ) : event.description ? (
                      <div className="whitespace-pre-wrap">{event.description}</div>
                    ) : event.excerpt ? (
                      <p>{event.excerpt}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No description available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">More {event.category} Events</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedEvents.map((relEvent) => (
                      <Link 
                        key={relEvent.id} 
                        to={`/events/${relEvent.id}`}
                        className="group"
                      >
                        <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
                          {relEvent.image && (
                            <div className="h-32 overflow-hidden">
                              <img 
                                src={relEvent.image} 
                                alt={relEvent.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                          )}
                          <CardContent className="p-4">
                            <p className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {relEvent.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(relEvent.date).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Action Buttons */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  {event.ticket_url && (
                    <Button className="w-full" asChild>
                      <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                        <Ticket className="h-4 w-4 mr-2" />
                        Book Tickets
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full" asChild>
                    <a href={generateCalendarLink()} target="_blank" rel="noopener noreferrer">
                      <Calendar className="h-4 w-4 mr-2" />
                      Add to Calendar
                    </a>
                  </Button>

                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Event
                  </Button>
                </CardContent>
              </Card>

              {/* Organizer & Contact */}
              {(event.organizer || event.contact_email || event.contact_phone) && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold">Contact Information</h3>
                    
                    {event.organizer && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{event.organizer}</span>
                      </div>
                    )}
                    
                    {event.contact_email && (
                      <a 
                        href={`mailto:${event.contact_email}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        <span>{event.contact_email}</span>
                      </a>
                    )}
                    
                    {event.contact_phone && (
                      <a 
                        href={`tel:${event.contact_phone}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        <span>{event.contact_phone}</span>
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Additional Links */}
              {event.links && event.links.length > 0 && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold">Links</h3>
                    {event.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-16" />
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;
