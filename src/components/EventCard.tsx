import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import { Event } from '@/hooks/useEvents';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
      weekday: date.toLocaleDateString('en-GB', { weekday: 'short' })
    };
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const dateInfo = formatDate(event.date);

  return (
    <Link to={`/events/${event.id}`} className="group block">
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50">
        <div className="relative">
          {/* Image */}
          <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
            {event.image ? (
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="h-16 w-16 text-primary/30" />
              </div>
            )}
          </div>
          
          {/* Date Badge */}
          <div className="absolute top-3 left-3 bg-background rounded-lg shadow-md p-2 text-center min-w-[60px]">
            <p className="text-xs font-medium text-primary">{dateInfo.month}</p>
            <p className="text-2xl font-bold leading-none">{dateInfo.day}</p>
            <p className="text-xs text-muted-foreground">{dateInfo.weekday}</p>
          </div>

          {/* Featured Badge */}
          {event.featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-yellow-500 hover:bg-yellow-500 text-yellow-950">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Category */}
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {event.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {event.type}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          {/* Excerpt */}
          {(event.excerpt || event.description) && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {event.excerpt || event.description}
            </p>
          )}

          {/* Time & Location */}
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {formatTime(event.time)}
                {event.end_time && ` - ${formatTime(event.end_time)}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.location}, {event.area}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
