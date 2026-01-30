import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Clock, MapPin, Truck } from "lucide-react";
import DiscoverFormsHub from "@/components/forms/DiscoverFormsHub";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-community-yellow/20 via-white to-community-green/20">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-community-navy mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 font-body max-w-2xl mx-auto">
            Get in touch with our friendly team. We're here to help with all your enquiries.
          </p>
        </div>
      </section>

      {/* Two Column Layout */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Forms Hub - First on mobile, Second on desktop */}
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl font-heading font-bold text-community-navy mb-6">
                Discover Forms Hub
              </h2>
              <DiscoverFormsHub />
            </div>

            {/* Contact Details - Second on mobile, First on desktop */}
            <div className="order-2 lg:order-1">
              <Card className="border-community-green/20 shadow-lg h-fit">
                <CardHeader className="bg-gradient-to-r from-community-green/10 to-community-yellow/10 pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl text-community-navy">
                    <Phone className="h-6 w-6 text-community-green" />
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Phone & Hours Row */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-community-navy mb-2">Main Number</h3>
                      <p className="text-2xl font-mono text-community-green font-bold mb-3">023 8026 6388</p>
                      
                      <div className="space-y-1.5 text-sm text-gray-700 bg-community-green/5 p-3 rounded-lg">
                        <p className="font-semibold text-community-navy mb-2">Phone Menu:</p>
                        <p>Press <span className="font-mono font-bold text-community-navy">1</span> for advertising sales</p>
                        <p>Press <span className="font-mono font-bold text-community-navy">2</span> for accounts</p>
                        <p>Press <span className="font-mono font-bold text-community-navy">3</span> for design & production</p>
                        <p>Press <span className="font-mono font-bold text-community-navy">4</span> for distributor enquiries</p>
                        <p className="pt-1 italic text-gray-500">Hold for Reception</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-community-navy mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Phone Line Hours
                      </h3>
                      <p className="text-gray-700">Mon-Fri: 8am - 8pm</p>
                      <p className="text-gray-700 mb-4">Sat & Sun: 9am - 5pm</p>
                      
                      <h3 className="text-lg font-semibold text-community-navy mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Office Address
                      </h3>
                      <p className="text-gray-700">30 Leigh Road</p>
                      <p className="text-gray-700 mb-1">Eastleigh SO50 9DT</p>
                      <p className="text-sm text-gray-600">Mon-Fri: 9am-5pm (Fri 4pm)</p>
                      <p className="text-sm text-community-green font-semibold">Visitors welcome!</p>
                    </div>
                  </div>
                  
                  {/* Depot/Deliveries */}
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-community-navy mb-2 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Depot/Deliveries
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Car park at rear via Toynbee Road — 
                      <a 
                        href="https://what3words.com/flip.envy.player" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-community-green hover:text-community-green/80 underline ml-1"
                      >
                        what3words: flip.envy.player
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
