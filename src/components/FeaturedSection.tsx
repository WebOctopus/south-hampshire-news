import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Trophy, Users } from 'lucide-react';

const FeaturedSection = () => {
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-community-green" />,
      title: "Local Events",
      description: "Discover what's happening in your community - from farmers markets to concerts and festivals.",
      link: "#events"
    },
    {
      icon: <Trophy className="h-8 w-8 text-community-green" />,
      title: "Weekly Competitions",
      description: "Win amazing prizes from local businesses and experience the best our community has to offer.",
      link: "#competitions"
    },
    {
      icon: <Users className="h-8 w-8 text-community-green" />,
      title: "Community Stories",
      description: "Read inspiring stories about your neighbors and local heroes making a difference every day.",
      link: "#stories"
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-4">
            What Makes Us Special
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
            We're more than a magazine - we're the heartbeat of our community, 
            connecting neighbors and supporting local businesses.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-heading font-semibold text-community-navy">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 font-body mb-4">
                  {feature.description}
                </p>
                <a 
                  href={feature.link}
                  className="text-community-green font-medium hover:text-green-600 transition-colors"
                >
                  Learn More →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;