import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Users, MapPin } from 'lucide-react';

export default function SuccessStories() {
  const stories = [
    {
      business: "The Local Bistro",
      area: "Southampton City Centre",
      industry: "Restaurant",
      result: "40% increase in bookings",
      detail: "Reached 12,000 homes and saw immediate impact on weekend reservations",
      rating: 5,
      quote: "The response was incredible! Our phone hasn't stopped ringing since the ads went out."
    },
    {
      business: "FitLife Gym",
      area: "Eastleigh & Chandler's Ford",
      industry: "Fitness",
      result: "60 new memberships",
      detail: "BOGOF campaign generated £18,000 in new membership revenue",
      rating: 5,
      quote: "Best marketing investment we've ever made. The ROI speaks for itself."
    },
    {
      business: "Green Thumb Landscaping", 
      area: "New Forest Areas",
      industry: "Landscaping",
      result: "25 new projects booked",
      detail: "Spring campaign led to their busiest season ever",
      rating: 5,
      quote: "We're completely booked through summer thanks to this campaign."
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          Success Stories from Your Area
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          See how businesses like yours are thriving with local advertising
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stories.map((story, index) => (
            <div key={index} className="border-l-4 border-l-green-500 pl-4 pb-4 border-b border-border last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-lg">{story.business}</h4>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {story.area}
                    </span>
                    <Badge variant="outline">{story.industry}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-1">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-green-600 font-bold flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {story.result}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{story.detail}</p>
              <blockquote className="text-sm italic text-primary border-l-2 border-l-primary pl-3">
                "{story.quote}"
              </blockquote>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">Join 247+ Local Businesses</span>
          </div>
          <p className="text-sm text-blue-700">
            You're in good company! Over 247 businesses in your area are already using our 
            advertising platform to grow their customer base.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}