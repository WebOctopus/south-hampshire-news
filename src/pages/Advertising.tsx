import Navigation from "@/components/Navigation";
import CostCalculator from "@/components/CostCalculator";
import SpecialOfferForm from "@/components/SpecialOfferForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Phone, Users, Newspaper, Truck, Clock, Target, Award, Mail } from "lucide-react";

const Advertising = () => {
  const stats = [
    {
      number: "250+",
      label: "Current Advertisers",
      icon: Users
    },
    {
      number: "20",
      label: "Estd 2005 - Celebrating 20 Years!",
      icon: Award
    },
    {
      number: "158,000",
      label: "Bi-monthly Circulation",
      icon: Newspaper
    },
    {
      number: "12",
      label: "Local Editions to Choose From",
      icon: MapPin
    },
    {
      number: "72%",
      label: "Repeat Advertisers - It Works!",
      icon: Target
    },
    {
      number: "500,000",
      label: "Leaflets Distributed Per Month",
      icon: Truck
    }
  ];

  const localAreas = [
    {
      area: "AREA 1",
      title: "SOUTHAMPTON SUBURBS",
      postcodes: "SO15 SO16 SO17",
      description: "ABC1 homes in the more affluent residential suburban streets inc Chilworth, Upper Shirley, Rownhams, Basett and Highfield. Excluding student areas & flats",
      circulation: "13,500",
      leaflets: "YES"
    },
    {
      area: "AREA 2", 
      title: "CHANDLER'S FORD & NORTH BADDESLEY",
      postcodes: "SO53 SO52",
      description: "ABC1 homes in this affluent suburb between Southampton and Winchester plus North Baddesley",
      circulation: "13,500",
      leaflets: "YES"
    },
    {
      area: "AREA 3",
      title: "EASTLEIGH & VILLAGES", 
      postcodes: "SO50",
      description: "ABC1 homes in Fair Oak, Bishopstoke, Horton Heath, Allbrook, Boyatt Wood and selected streets of Eastleigh.",
      circulation: "10,500",
      leaflets: "YES"
    },
    {
      area: "AREA 4",
      title: "HEDGE END & SURROUNDS",
      postcodes: "SO30", 
      description: "ABC1 homes in east of Southampton: Hedge End, West End & Botley",
      circulation: "13,000",
      leaflets: "YES"
    },
    {
      area: "AREA 5",
      title: "LOCKS HEATH & SURROUNDS",
      postcodes: "SO31",
      description: "ABC1 homes in south east of Southampton, west of Fareham: Locks Heath, Warsash, Swanwick, Bursledon, Hamble, Netley",
      circulation: "13,000", 
      leaflets: "YES"
    },
    {
      area: "AREA 6",
      title: "FAREHAM & SURROUNDS",
      postcodes: "PO13 PO14 PO15",
      description: "ABC1 homes in Fareham westside, Titchfield, Stubbington, Lee on Solent, Hill Head",
      circulation: "14,000",
      leaflets: "YES"
    },
    {
      area: "AREA 7",
      title: "WICKHAM & BISHOP'S WALTHAM",
      postcodes: "SO32 PO17",
      description: "Meon Valley is an affluent rural area with two market towns; Wickham & Bishop's Waltham so it's delivered by Royal Mail. Every property in these postcodes recieves Discover.",
      circulation: "14,000",
      leaflets: "NO, SORRY"
    },
    {
      area: "AREA 8", 
      title: "WINCHESTER & VILLAGES",
      postcodes: "SO21 SO22 SO23",
      description: "Distribution is mixed with part Royal Mail (the affluent rural ring around Winchester) and part by Discover distribution in Winchester's ABC1 suburbs. Rural ring includes Otterbourne, Colden Common, Hursley, Crawley, South Wonston, Littleton, Sparsholt.",
      circulation: "13,500",
      leaflets: "YES"
    },
    {
      area: "AREA 9",
      title: "ROMSEY & TEST VALLEY", 
      postcodes: "SO51 SO20",
      description: "Test Valley includes the market towns of Romsey and Stockbridge including rural villages such as The Wellows, Braishfield, Ampfield, Kings Somborne. Every property in the rural postcodes receive Discover while 4,000 homes in Romsey are distributed by Discover.",
      circulation: "15,000",
      leaflets: "YES BUT ROMSEY ONLY"
    },
    {
      area: "AREA 10",
      title: "WATERSIDE & TOTTON",
      postcodes: "SO40 SO45", 
      description: "Locally referred to as Southampton's Waterside Discover is delivered to ABC1 homes in Totton, Marchwood, Hythe, Dibden, Dibden Purlieu, Holbury and Blackfield.",
      circulation: "14,000",
      leaflets: "YES"
    },
    {
      area: "AREA 11",
      title: "NEW FOREST TO LYMINGTON",
      postcodes: "SO41 SO42 SO43 BH24 4",
      description: "The only magazine to reach so many homes in The New Forest directly delivered to by Royal Mail. Every property in these postcodes receive a copy.",
      circulation: "13,500",
      leaflets: "NO, SORRY"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-community-navy to-community-green text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
          backgroundImage: 'url(/lovable-uploads/08771cf3-89e3-4223-98db-747dce5d2283.png)'
        }} />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-community-navy/80 to-community-green/80" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            YOUR BUSINESS NEEDS TO BE SEEN
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            We can't promise to find you a mate, but we will match you up with new customers!
          </p>
          <Button size="lg" className="bg-white text-community-navy hover:bg-gray-100">
            <Phone className="mr-2 h-5 w-5" />
            Call us TODAY 02380 266388
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
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
                  <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      <section className="py-16 bg-gradient-to-r from-community-green to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-white text-community-green px-6 py-2 rounded-full font-bold text-lg mb-6">
              🎉 LIMITED TIME OFFER
            </div>
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              £999 ALL AREAS PACKAGE
            </h2>
            <p className="text-2xl md:text-3xl mb-4 font-bold">
              Reach 158,000 Homes Across All 12 Areas
            </p>
            <p className="text-xl mb-8 opacity-90">
              Save over £500 with our exclusive package deal - Perfect for businesses ready to make a big impact!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2">158,000</div>
                <div className="text-lg">Total Homes Reached</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2">12</div>
                <div className="text-lg">Distribution Areas</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold mb-2">6</div>
                <div className="text-lg">Magazine Editions</div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <SpecialOfferForm>
              <Button size="lg" className="bg-white text-community-green hover:bg-gray-100 text-xl px-12 py-6 font-bold">
                CLAIM THIS OFFER - £999
              </Button>
            </SpecialOfferForm>
            <p className="mt-4 text-lg opacity-90">
              Includes professional design support & account management
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              ADVERTISING ENQUIRY FORM
            </h2>
            <p className="text-xl text-gray-600">
              South Hampshire Advertising Services: reach up to 158,000 homes in SO & PO Postcodes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Display Advertising</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">We offer 11 ad sizes to more easily match with your budget and campaign needs.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Premium Position Advertising</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Pay a little extra for pages 2,3,5 or back cover ... Stand out from the Crowd!</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Small Budget Options</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Low cost sizes, special packages and generous discounts for selected businesses</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leaflet Distribution */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              The Best Leaflet Management Service in South Hampshire
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Target Up to 108,000 Homes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">100% Tracked, Monitored & Recorded</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Cost Saving Options</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Plus Leaflet Sharing Save on Print and 50% off Delivery!</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Royal Mail Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Piggyback on our Royal Mail Contracts - Save Hassle & £££</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Marketing Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Marketing Services: Traditional & Digital
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Eye-Catching Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Ask about free artwork services for series bookings and anything else you need!</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Logos & Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Whether a new design or a refresh and update we offer low cost portfolios</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">QR Codes & Geo Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Quantify your advertising responses with trackable QR codes and local phone numbers</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Lead Generation Specialists</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">We can talk about more than print advertising to market your business</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Marketing Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Every Discover advertisers deserves - and gets - their own Media Buddy.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-community-navy">Social Media Promotion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">We can "twitter-woo" for you, too! (doesn't sound as good with X)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Essential Facts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Essential Facts & Figures
            </h2>
            <h3 className="text-2xl font-heading font-bold text-community-green mb-4">
              RESULTS DRIVEN, DISPLAY ADVERTISING
            </h3>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Discover is the region's most established and widespread local publication available to businesses wanting to generate brand awareness, lead generation and website traffic from affluent homeowners in South Hampshire.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Facts List */}
            <Card className="h-fit">
              <CardContent className="p-8">
                <ul className="space-y-3 text-gray-700">
                  <li>• A5 (148mm x 210mm) full colour, self cover</li>
                  <li>• Frequency per edition is 6 times a year (bi-monthly)</li>
                  <li>• 12 different publications; target your advertising</li>
                  <li>• Each edition is tailored with local stories & What's On</li>
                  <li>• Average circulation per edition is 13,500 homes</li>
                  <li>• Book 12 editions for 158,000 circulation</li>
                  <li>• Distribution is GPS tracked, monitored and recorded</li>
                  <li>• 50,000 rural homes only get Discover, no other publication</li>
                  <li>• Available for pick up at selected supermarkets</li>
                </ul>
              </CardContent>
            </Card>

            {/* Map Section */}
            <div className="text-center">
              <img 
                src="/lovable-uploads/a0704f2b-f884-4e36-a186-dab5336a19a5.png" 
                alt="Distribution Areas Map - 12 Areas across South Hampshire including Winchester, Southampton, Fareham, New Forest and surrounding areas"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
              <p className="text-sm text-gray-600 mt-4 font-medium">
                12 Distribution Areas across South Hampshire
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Local Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              12 Areas to Target - Trial Areas - Add More Later - Tailored Campaigns - Mix Adverts with Leaflets!
            </h2>
            <p className="text-xl text-gray-600">
              Our 158,000 circulation is divided into 12 Areas - each with a circulation of up to 14,000** homes
            </p>
          </div>

          {/* Special SO19 Section */}
          <Card className="mb-8 border-community-green border-2">
            <CardHeader className="bg-community-green text-white">
              <CardTitle className="text-2xl">!! NEW !! LAUNCH AUG '25</CardTitle>
              <CardDescription className="text-green-100">
                After repeated requests from our current advertisers and local business in SO19, Discover will started delivering in June 2025.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-community-navy mb-2">SO19 - 8,000 CIRCULATION</h3>
                  <p className="text-gray-600">
                    Letterbox (7,100) delivered to selected areas of SO19; primarily 3+ bedroom properties, with a driveway and attached garage. Flats and rental areas excluded. Available at Tesco, Sainsbury & Co-op in SO19
                  </p>
                </div>
                <div className="text-center">
                  <CostCalculator>
                    <Button className="bg-community-green hover:bg-green-600">
                      REQUEST A RATE CARD
                    </Button>
                  </CostCalculator>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="max-w-6xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {localAreas.map((area, index) => (
                <AccordionItem key={area.area} value={`item-${index}`} className="bg-white rounded-lg border shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="bg-community-green text-white rounded-full w-16 h-16 flex items-center justify-center font-bold mr-4 text-xs">
                          {area.area}
                        </div>
                        <div className="text-left">
                          <div className="font-heading font-bold text-lg">{area.title}</div>
                          <div className="text-sm text-gray-600">{area.postcodes}</div>
                          <div className="text-sm text-community-green font-bold">Circulation: {area.circulation}</div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-heading font-bold text-community-navy mb-2">Coverage Details</h4>
                          <p className="text-gray-600">{area.description}</p>
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-community-navy mb-2">Leaflet Distribution</h4>
                          <p className={`font-bold ${area.leaflets === 'YES' ? 'text-community-green' : 'text-red-500'}`}>
                            {area.leaflets}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <CostCalculator>
                          <Button className="w-full">
                            REQUEST A QUOTE
                          </Button>
                        </CostCalculator>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              WANT TO GET STARTED?
            </h2>
            <p className="text-xl text-gray-600">
              From Quote to Artwork - We'll Help you All the Way!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="bg-community-green text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <CardTitle className="text-community-navy">Identifying What's Right for You</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  If you are new to advertising or need a fresh pair of eyes to improve what you are getting from your current advertising, our sales team are focused on what's right for your business; starting with the size of advert, the style, the design to which areas to choose.
                </p>
                <p className="text-gray-600 mt-4 font-bold">
                  If Discover isn't right for you, we'll tell you – honest!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-community-green text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <CardTitle className="text-community-navy">Self Select quotations - You choose</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You'll receive an instant verbal quotation followed by 3 priced options. PLUS a link to our unique self service online cost calculator so you can play with the combination of advert size, areas and type of booking.
                </p>
                <p className="text-gray-600 mt-4 font-bold">
                  We believe in the power of informed choice with no hidden costs or surprises!
                </p>
                <p className="text-community-green font-bold mt-2">Payment plans available</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-community-green text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <CardTitle className="text-community-navy">Free In-house Design - At your service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Many of customers rely on us to create eye catching adverts for them from scratch or adapting what they have. Our editorial department is on hand to write a complimentary article if you book a series.
                </p>
                <p className="text-gray-600 mt-4 font-bold">
                  You'll be allocated an account manager to look after you throughout your journey with us.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-community-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-4xl font-heading font-bold mb-6">
              Sales Lead Generation with Direct Marketing
            </h2>
            <div className="space-y-4 text-lg">
              <p><strong>Sales Leads.</strong></p>
              <p><strong>Web Traffic.</strong></p>
              <p><strong>Brand Awareness.</strong></p>
            </div>
            <p className="text-xl mt-6">
              Helping businesses launch, grow and succeed since 2005. South Hampshire's most respected local magazine publisher.
            </p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-2xl font-heading font-bold mb-4">
              Talk to the Local Magazine Experts
            </h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-community-green hover:bg-community-green/90">
              <Phone className="mr-2 h-5 w-5" />
              023 80 266388
            </Button>
            <Button size="lg" variant="outline" className="border-white hover:bg-white hover:text-community-navy text-white">
              Advertising Enquiry Form
            </Button>
          </div>
          
          <p className="mt-6 text-lg">
            Go On ... Love your Business ... Help it Grow & Prosper Today!
          </p>
        </div>
      </section>
    </div>
  );
};

export default Advertising;
