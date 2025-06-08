
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const WhatsOn = () => {
  // Mock events data - this would come from your backend
  const [events] = useState([
    {
      id: 1,
      title: 'Fareham Food Festival',
      date: '2024-07-15',
      time: '10:00',
      location: 'Fareham Town Centre',
      description: 'A celebration of local food and drink with over 50 stalls featuring the best of Hampshire cuisine.',
      organizer: 'Fareham Council',
      category: 'Food & Drink'
    },
    {
      id: 2,
      title: 'Portsmouth Historic Dockyard Summer Fair',
      date: '2024-07-20',
      time: '11:00',
      location: 'Historic Dockyard Portsmouth',
      description: 'Family fun day with historical demonstrations, craft stalls, and maritime activities.',
      organizer: 'Portsmouth Historic Dockyard',
      category: 'Family'
    },
    {
      id: 3,
      title: 'Gosport Folk Music Evening',
      date: '2024-07-25',
      time: '19:30',
      location: 'Gosport Arts Centre',
      description: 'An intimate evening of traditional folk music featuring local and touring musicians.',
      organizer: 'Gosport Arts Centre',
      category: 'Music'
    }
  ]);

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
                Don't miss out on these exciting local events
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card key={event.id} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="mb-2">
                      {event.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-community-navy">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <strong>Date:</strong> {formatDate(event.date)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Time:</strong> {event.time}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Location:</strong> {event.location}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Organizer:</strong> {event.organizer}
                    </div>
                    <p className="text-gray-700 font-body leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
