import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Clock, MapPin, Megaphone, PenLine, Truck, Mail, Lightbulb } from "lucide-react";

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
        <div className="max-w-4xl mx-auto">
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
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-community-navy mb-2">Main Number</h3>
                    <p className="text-2xl font-mono text-community-green font-bold mb-4">023 8026 6388</p>
                    
                    <div className="space-y-2 text-gray-700 bg-community-green/5 p-4 rounded-lg">
                      <p className="font-semibold text-community-navy mb-3">Phone Menu Options:</p>
                      <p>Press <span className="font-mono font-bold text-community-navy">1</span> for advertising sales</p>
                      <p>Press <span className="font-mono font-bold text-community-navy">2</span> for accounts</p>
                      <p>Press <span className="font-mono font-bold text-community-navy">3</span> for design & production</p>
                      <p>Press <span className="font-mono font-bold text-community-navy">4</span> for distributor related enquiries</p>
                      <p className="pt-2 italic">Hold for Reception</p>
                    </div>
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

          {/* Visit Us */}
          <Card className="border-community-green/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-community-green/10 to-community-yellow/10">
              <CardTitle className="flex items-center gap-3 text-xl text-community-navy">
                <MapPin className="h-5 w-5 text-community-green" />
                Visit Us
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-community-navy mb-2">Office Address</h3>
                  <p className="text-gray-700">30 Leigh Road</p>
                  <p className="text-gray-700">Eastleigh SO50 9DT</p>
                </div>
                <div>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Forms Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-community-navy text-center mb-8">
            Get In Touch
          </h2>
          
          <Tabs defaultValue="advertising" className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-2 h-auto p-3 bg-white border border-community-green/20 rounded-lg mb-6">
              <TabsTrigger 
                value="advertising" 
                className="flex items-center gap-2 data-[state=active]:bg-community-green data-[state=active]:text-white"
              >
                <Megaphone className="h-4 w-4" />
                <span className="hidden sm:inline">Advertising Enquiry</span>
                <span className="sm:hidden">Advertising</span>
              </TabsTrigger>
              <TabsTrigger 
                value="editorial" 
                className="flex items-center gap-2 data-[state=active]:bg-community-green data-[state=active]:text-white"
              >
                <PenLine className="h-4 w-4" />
                <span className="hidden sm:inline">Editorial Submission</span>
                <span className="sm:hidden">Editorial</span>
              </TabsTrigger>
              <TabsTrigger 
                value="distributor" 
                className="flex items-center gap-2 data-[state=active]:bg-community-green data-[state=active]:text-white"
              >
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">Apply to be a Distributor</span>
                <span className="sm:hidden">Distributor</span>
              </TabsTrigger>
              <TabsTrigger 
                value="discover" 
                className="flex items-center gap-2 data-[state=active]:bg-community-green data-[state=active]:text-white"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Subscribe to Discover Extra</span>
                <span className="sm:hidden">Discover Extra</span>
              </TabsTrigger>
              <TabsTrigger 
                value="think" 
                className="flex items-center gap-2 data-[state=active]:bg-community-green data-[state=active]:text-white"
              >
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Subscribe to THINK Advertising</span>
                <span className="sm:hidden">THINK</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="advertising">
              <Card className="border-community-green/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-community-green/10 to-community-yellow/10">
                  <CardTitle className="flex items-center gap-3 text-xl text-community-navy">
                    <Megaphone className="h-5 w-5 text-community-green" />
                    Advertising Enquiry Form
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 min-h-[500px] flex items-center justify-center">
                  <p className="text-gray-500 italic">Advertising enquiry form will be embedded here</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="editorial">
              <Card className="border-community-green/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-community-green/10 to-community-yellow/10">
                  <CardTitle className="flex items-center gap-3 text-xl text-community-navy">
                    <PenLine className="h-5 w-5 text-community-green" />
                    Editorial Submission Form
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 min-h-[500px] flex items-center justify-center">
                  <p className="text-gray-500 italic">Editorial submission form will be embedded here</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="distributor">
              <Card className="border-community-green/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-community-green/10 to-community-yellow/10">
                  <CardTitle className="flex items-center gap-3 text-xl text-community-navy">
                    <Truck className="h-5 w-5 text-community-green" />
                    Apply to be a Distributor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 min-h-[500px] flex items-center justify-center">
                  <p className="text-gray-500 italic">Distributor application form will be embedded here</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="discover">
              <Card className="border-community-green/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-community-green/10 to-community-yellow/10">
                  <CardTitle className="flex items-center gap-3 text-xl text-community-navy">
                    <Mail className="h-5 w-5 text-community-green" />
                    Subscribe to Discover Extra
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 min-h-[500px] flex items-center justify-center">
                  <p className="text-gray-500 italic">Discover Extra subscription form will be embedded here</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="think">
              <Card className="border-community-green/20 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-community-green/10 to-community-yellow/10">
                  <CardTitle className="flex items-center gap-3 text-xl text-community-navy">
                    <Lightbulb className="h-5 w-5 text-community-green" />
                    Subscribe to THINK Advertising
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 min-h-[500px] flex items-center justify-center">
                  <p className="text-gray-500 italic">THINK Advertising subscription form will be embedded here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
