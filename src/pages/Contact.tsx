import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Clock, MapPin, Mail, Building2, Users, Palette } from "lucide-react";

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

      {/* Contact Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Switchboard */}
          <div className="mb-12">
            <Card className="border-community-green/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-community-green/10 to-community-yellow/10">
                <CardTitle className="flex items-center gap-3 text-2xl text-community-navy">
                  <Phone className="h-6 w-6 text-community-green" />
                  Switchboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-community-navy mb-2">Main Number</h3>
                    <p className="text-lg font-mono text-community-green font-bold">023 8026 6388</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-community-navy mb-2 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Opening Hours
                    </h3>
                    <p className="text-gray-700">Mon-Fri: 8am - 8pm</p>
                    <p className="text-gray-700">Sat & Sun: 9am - 5pm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advertising Enquiries */}
          <div className="mb-12">
            <Card className="border-community-yellow/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-community-yellow/10 to-community-green/10">
                <CardTitle className="flex items-center gap-3 text-2xl text-community-navy">
                  <Building2 className="h-6 w-6 text-community-yellow" />
                  Advertising Enquiries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-lg text-community-navy mb-6 font-semibold">
                  Where is your business based?
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-community-green/5 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-community-navy mb-3">Lisa Orchard</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Areas:</strong> SO14-SO19, SO40-SO45, SO31, PO12-PO15, BH
                    </p>
                    <p className="text-lg font-mono text-community-green font-bold">023 8200 1091</p>
                  </div>
                  <div className="bg-community-yellow/5 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-community-navy mb-3">Lisa Ashton</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Areas:</strong> SO50-SO53, SO20-SO24, SO30, SO32, PO7, PO17
                    </p>
                    <p className="text-lg font-mono text-community-green font-bold">023 8001 0222</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Contacts */}
          <div className="mb-12">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-community-navy/20 shadow-lg">
                <CardHeader className="bg-community-navy/5">
                  <CardTitle className="flex items-center gap-3 text-xl text-community-navy">
                    <Users className="h-5 w-5 text-community-navy" />
                    Mike
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-3">Administration, Distribution & Customer Accounts</p>
                  <p className="text-lg font-mono text-community-green font-bold">023 8212 0123</p>
                </CardContent>
              </Card>

              <Card className="border-community-navy/20 shadow-lg">
                <CardHeader className="bg-community-navy/5">
                  <CardTitle className="flex items-center gap-3 text-xl text-community-navy">
                    <Palette className="h-5 w-5 text-community-navy" />
                    Brinda
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-3">Design & Production</p>
                  <p className="text-lg font-mono text-community-green font-bold">023 8027 6395</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Address & Email */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-community-green/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-community-green/10 to-community-yellow/10">
                <CardTitle className="flex items-center gap-3 text-xl text-community-navy">
                  <MapPin className="h-5 w-5 text-community-green" />
                  Visit Us
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-community-navy mb-2">Office Address</h3>
                  <p className="text-gray-700">30 Leigh Road</p>
                  <p className="text-gray-700">Eastleigh SO50 9DT</p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold text-community-navy mb-2">Visitor Hours</h3>
                  <p className="text-gray-700">Mon-Fri: 9am-5pm (Fri 4pm)</p>
                  <p className="text-sm text-community-green font-semibold">Visitors welcome!</p>
                </div>
                <div>
                  <h3 className="font-semibold text-community-navy mb-2">Depot/Deliveries</h3>
                  <p className="text-gray-700 text-sm mb-2">Car park at rear via Toynbee Road</p>
                  <a 
                    href="https://what3words.com/flip.envy.player" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-community-green hover:text-community-green/80 text-sm underline"
                  >
                    what3words: flip.envy.player
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-community-yellow/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-community-yellow/10 to-community-green/10">
                <CardTitle className="flex items-center gap-3 text-xl text-community-navy">
                  <Mail className="h-5 w-5 text-community-yellow" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="font-semibold text-community-navy mb-4">Central Email Inbox</h3>
                  <a 
                    href="mailto:discover@discovermagazines.co.uk"
                    className="text-lg font-mono text-community-green hover:text-community-green/80 break-all"
                  >
                    discover@discovermagazines.co.uk
                  </a>
                  <p className="text-sm text-gray-600 mt-2">(Catch all inbox)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;