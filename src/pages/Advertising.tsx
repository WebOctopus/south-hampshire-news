import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Phone, Users, Newspaper, Truck, Clock } from "lucide-react";

const Advertising = () => {
  const adSizes = [
    { size: "Full Page", dimensions: "190mm x 277mm", price: "£450" },
    { size: "Half Page", dimensions: "190mm x 138mm", price: "£250" },
    { size: "Quarter Page", dimensions: "93mm x 138mm", price: "£150" },
    { size: "1/8 Page", dimensions: "93mm x 68mm", price: "£85" },
    { size: "1/16 Page", dimensions: "45mm x 68mm", price: "£50" },
    { size: "Business Card", dimensions: "85mm x 55mm", price: "£35" },
    { size: "Double Column", dimensions: "128mm x 100mm", price: "£120" },
    { size: "Single Column", dimensions: "62mm x 100mm", price: "£70" },
    { size: "Strip Ad", dimensions: "190mm x 25mm", price: "£60" },
    { size: "Small Square", dimensions: "45mm x 45mm", price: "£30" },
    { size: "Mini Ad", dimensions: "30mm x 30mm", price: "£20" }
  ];

  const localEditions = [
    { area: "SO15", name: "Southampton City Centre", households: "12,500" },
    { area: "SO16", name: "Bitterne & Thornhill", households: "15,200" },
    { area: "SO17", name: "Shirley & Freemantle", households: "18,000" },
    { area: "SO18", name: "Woolston & Weston", households: "14,800" },
    { area: "SO19", name: "Sholing & Houndsfield", households: "16,500" },
    { area: "SO30", name: "Hedge End & West End", households: "13,200" },
    { area: "SO31", name: "Netley & Hamble", households: "11,800" },
    { area: "SO32", name: "Bishop's Waltham", households: "9,500" },
    { area: "SO40", name: "Totton & Eling", households: "17,300" },
    { area: "SO45", name: "Hythe & Dibden", households: "14,600" },
    { area: "SO53", name: "Chandler's Ford", households: "16,900" },
    { area: "PO14", name: "Fareham East", households: "13,700" }
  ];

  const stats = [
    { number: "250+", label: "Current Advertisers", icon: Users },
    { number: "158,000", label: "Circulation", icon: Newspaper },
    { number: "150", label: "Distributors", icon: Truck },
    { number: "20", label: "Years in Business", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-community-navy to-community-green text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            YOUR BUSINESS NEEDS TO BE SEEN
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Reach over 158,000 local households with our trusted community publications
          </p>
          <Button size="lg" className="bg-white text-community-navy hover:bg-gray-100">
            <Phone className="mr-2 h-5 w-5" />
            Call Now: 023 8043 3399
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <IconComponent className="h-12 w-12 text-community-green" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-community-navy mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Advertising Sizes & Prices
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect size for your message
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-heading font-bold">Ad Size</TableHead>
                    <TableHead className="font-heading font-bold">Dimensions</TableHead>
                    <TableHead className="font-heading font-bold">Price per Edition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adSizes.map((ad, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{ad.size}</TableCell>
                      <TableCell>{ad.dimensions}</TableCell>
                      <TableCell className="font-bold text-community-green">{ad.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Leaflet Distribution */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-heading font-bold text-community-navy mb-6">
                GPS-Tracked Leaflet Distribution
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>
                  Our professional distribution service ensures your leaflets reach every household 
                  in your target areas with complete transparency and accountability.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <MapPin className="h-6 w-6 text-community-green mr-3 mt-0.5 flex-shrink-0" />
                    <span>GPS tracking on every delivery round for complete transparency</span>
                  </li>
                  <li className="flex items-start">
                    <Truck className="h-6 w-6 text-community-green mr-3 mt-0.5 flex-shrink-0" />
                    <span>Professional distributors with local area knowledge</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="h-6 w-6 text-community-green mr-3 mt-0.5 flex-shrink-0" />
                    <span>Detailed delivery reports provided after completion</span>
                  </li>
                </ul>
              </div>
              <Button className="mt-8" size="lg">
                Request Distribution Quote
              </Button>
            </div>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-2xl font-heading font-bold text-community-navy mb-4">
                Live Tracking Available
              </h3>
              <p className="text-gray-600">
                Watch your leaflets being delivered in real-time with our GPS tracking system
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Local Editions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Our Local Editions
            </h2>
            <p className="text-xl text-gray-600">
              Choose your target areas from our 12 local editions
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {localEditions.map((edition, index) => (
                <AccordionItem 
                  key={edition.area} 
                  value={`item-${index}`}
                  className="bg-white rounded-lg border shadow-sm"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="bg-community-green text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mr-4">
                          {edition.area}
                        </div>
                        <div className="text-left">
                          <div className="font-heading font-bold text-lg">{edition.name}</div>
                          <div className="text-gray-600">{edition.households} households</div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-16 w-16 text-community-green mx-auto mb-2" />
                          <p className="text-gray-600">Interactive map coming soon</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-heading font-bold text-community-navy mb-2">Coverage Details</h4>
                          <p className="text-gray-600">
                            Full door-to-door coverage of {edition.households} households in the {edition.name} area.
                          </p>
                        </div>
                        <Button className="w-full">
                          Request a Quote for {edition.area}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-community-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-heading font-bold mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl mb-8">
            Contact us today for a personalized quote and media pack
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-community-green hover:bg-community-green/90">
              <Phone className="mr-2 h-5 w-5" />
              Call 023 8043 3399
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-community-navy">
              Download Media Pack
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Advertising;