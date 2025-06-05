import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Megaphone, Target } from 'lucide-react';

const BusinessSection = () => {
  const services = [
    {
      icon: <Megaphone className="h-6 w-6 text-white" />,
      title: "Display Advertising",
      description: "Eye-catching ads that reach thousands of local readers every month",
      price: "From £150/month"
    },
    {
      icon: <MapPin className="h-6 w-6 text-white" />,
      title: "Leaflet Distribution", 
      description: "Direct-to-door delivery across South Hampshire postcodes",
      price: "From £45/1000 homes"
    },
    {
      icon: <Target className="h-6 w-6 text-white" />,
      title: "Targeted Campaigns",
      description: "Reach specific demographics and neighborhoods that matter to your business",
      price: "Custom pricing"
    }
  ];

  return (
    <section id="advertising" className="py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-4">
            Grow Your Business Locally
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
            Connect with customers who live, work, and shop in your area. 
            Our proven marketing solutions deliver real results for local businesses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="space-y-6">
              {services.map((service, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-community-green p-2 rounded-lg">
                        {service.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading font-semibold text-community-navy">
                          {service.title}
                        </CardTitle>
                        <p className="text-community-green font-medium text-sm">
                          {service.price}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 font-body">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-heading font-bold text-community-navy mb-6">
              Ready to Get Started?
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-community-green rounded-full mr-3"></span>
                <span className="font-body">Free design consultation included</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-community-green rounded-full mr-3"></span>
                <span className="font-body">Track your campaign performance</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-community-green rounded-full mr-3"></span>
                <span className="font-body">No long-term contracts required</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="bg-community-green hover:bg-green-600 text-white px-6 py-3 font-medium rounded-lg flex-1"
              >
                Get Quote
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-community-navy text-community-navy hover:bg-community-navy hover:text-white px-6 py-3 font-medium rounded-lg flex-1"
              >
                View Packages
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessSection;