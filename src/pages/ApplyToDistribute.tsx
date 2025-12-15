import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, MapPin, Clock, DollarSign, Users } from 'lucide-react';

const ApplyToDistribute = () => {
  const perks = [
    { icon: DollarSign, title: "Competitive Pay", description: "Earn £9.18 per 100 magazines delivered, plus other bonuses and top ups" },
    { icon: Clock, title: "Flexible Hours", description: "Work around your schedule as long as they are delivered within 7 days" },
    { icon: MapPin, title: "Local Routes", description: "Deliver in your neighborhood or preferred areas" },
    { icon: Users, title: "Great Team", description: "Join a supportive community of distributors" },
  ];

  const payRates = [
    { 
      title: "Base Pay", 
      rate: "£9.18 per 100 Magazines",
      description: "Standard delivery rate"
    },
    { 
      title: "Extra for Leaflet Inserts", 
      rate: "£0.75 per 100 Leaflets",
      description: "Additional payment for leaflet distribution"
    },
    { 
      title: "Early Delivery Bonus", 
      rate: "10% of your base pay",
      description: "If 100% delivered in 5 days"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-community-navy to-community-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Join Our Distribution Team
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Become part of our community network and help local businesses reach their customers while earning competitive pay.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Age Requirement Notice */}
        <div className="mb-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-amber-800">Age Requirement</h3>
              <p className="text-amber-700 mt-1">
                You must be 13 years or older to apply for a distribution position. Parental consent required for applicants under 18.
              </p>
            </div>
          </div>
        </div>

        {/* Perks Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-center mb-8">Why Join Our Team?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-community-green/10 rounded-lg flex items-center justify-center mb-4">
                    <perk.icon className="h-6 w-6 text-community-green" />
                  </div>
                  <CardTitle className="text-lg">{perk.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{perk.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pay Rates Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-center mb-8">Pay Rates</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {payRates.map((rate, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{rate.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-community-green">{rate.rate}</p>
                    <p className="text-sm text-gray-600">{rate.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What's Involved Section */}
        <section className="mb-12">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">What's Involved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 mb-4">
                  As a magazine distributor, you'll be responsible for delivering our community magazines to households in your assigned area. Here's what you need to know:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Collect magazines from designated collection points</li>
                  <li>• Deliver to every household in your assigned route</li>
                  <li>• Complete deliveries within 7 days of collection</li>
                  <li>• Handle magazines with care to ensure quality delivery</li>
                  <li>• Report any issues or problems to your area coordinator</li>
                  <li>• Maintain accurate delivery records</li>
                  <li>• Follow health and safety guidelines at all times</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  This is a great opportunity to earn money while getting exercise and helping connect your local community with important information and local business promotions.
                </p>
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  size="lg" 
                  className="bg-community-green hover:bg-community-green/90"
                  onClick={() => {
                    window.open('https://roundcontrol.co.uk/discover-magazines-ltd/join-waiting-list', '_blank');
                  }}
                >
                  Join Waiting List
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ApplyToDistribute;