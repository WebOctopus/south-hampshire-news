import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import AdvertisingCalculator from "@/components/AdvertisingCalculator";
import SpecialOfferForm from "@/components/SpecialOfferForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Phone, Users, Newspaper, Truck, Clock, Target, Award, Mail } from "lucide-react";

const AdvertisingNew = () => {
  const stats = [{
    number: "250+",
    label: "Current Advertisers",
    icon: Users
  }, {
    number: "20",
    label: "Estd 2005 - Celebrating 20 Years!",
    icon: Award
  }, {
    number: "158,000",
    label: "Bi-monthly Circulation",
    icon: Newspaper
  }, {
    number: "12",
    label: "Local Editions to Choose From",
    icon: MapPin
  }, {
    number: "72%",
    label: "Repeat Advertisers - It Works!",
    icon: Target
  }, {
    number: "500,000",
    label: "Leaflets Distributed Per Month",
    icon: Truck
  }];

  const localAreas = [{
    area: "AREA 1",
    title: "SOUTHAMPTON SUBURBS",
    postcodes: "SO15 SO16 SO17",
    description: "ABC1 homes in the more affluent residential suburban streets inc Chilworth, Upper Shirley, Rownhams, Basett and Highfield. Excluding student areas & flats",
    circulation: "13,500",
    leaflets: "YES"
  }, {
    area: "AREA 2",
    title: "CHANDLER'S FORD & NORTH BADDESLEY",
    postcodes: "SO53 SO52",
    description: "ABC1 homes in this affluent suburb between Southampton and Winchester plus North Baddesley",
    circulation: "13,500",
    leaflets: "YES"
  }, {
    area: "AREA 3",
    title: "EASTLEIGH & VILLAGES",
    postcodes: "SO50",
    description: "ABC1 homes in Fair Oak, Bishopstoke, Horton Heath, Allbrook, Boyatt Wood and selected streets of Eastleigh.",
    circulation: "10,500",
    leaflets: "YES"
  }, {
    area: "AREA 4",
    title: "HEDGE END & SURROUNDS",
    postcodes: "SO30",
    description: "ABC1 homes in east of Southampton: Hedge End, West End & Botley",
    circulation: "13,000",
    leaflets: "YES"
  }, {
    area: "AREA 5",
    title: "LOCKS HEATH & SURROUNDS",
    postcodes: "SO31",
    description: "ABC1 homes in south east of Southampton, west of Fareham: Locks Heath, Warsash, Swanwick, Bursledon, Hamble, Netley",
    circulation: "13,000",
    leaflets: "YES"
  }, {
    area: "AREA 6",
    title: "FAREHAM & SURROUNDS",
    postcodes: "PO13 PO14 PO15",
    description: "ABC1 homes in Fareham westside, Titchfield, Stubbington, Lee on Solent, Hill Head",
    circulation: "14,000",
    leaflets: "YES"
  }, {
    area: "AREA 7",
    title: "WICKHAM & BISHOP'S WALTHAM",
    postcodes: "SO32 PO17",
    description: "Meon Valley is an affluent rural area with two market towns; Wickham & Bishop's Waltham so it's delivered by Royal Mail. Every property in these postcodes recieves Discover.",
    circulation: "14,000",
    leaflets: "NO, SORRY"
  }, {
    area: "AREA 8",
    title: "WINCHESTER & VILLAGES",
    postcodes: "SO21 SO22 SO23",
    description: "Distribution is mixed with part Royal Mail (the affluent rural ring around Winchester) and part by Discover distribution in Winchester's ABC1 suburbs. Rural ring includes Otterbourne, Colden Common, Hursley, Crawley, South Wonston, Littleton, Sparsholt.",
    circulation: "13,500",
    leaflets: "YES"
  }, {
    area: "AREA 9",
    title: "ROMSEY & TEST VALLEY",
    postcodes: "SO51 SO20",
    description: "Test Valley includes the market towns of Romsey and Stockbridge including rural villages such as The Wellows, Braishfield, Ampfield, Kings Somborne. Every property in the rural postcodes receive Discover while 4,000 homes in Romsey are distributed by Discover.",
    circulation: "15,000",
    leaflets: "YES BUT ROMSEY ONLY"
  }, {
    area: "AREA 10",
    title: "WATERSIDE & TOTTON",
    postcodes: "SO40 SO45",
    description: "Locally referred to as Southampton's Waterside Discover is delivered to ABC1 homes in Totton, Marchwood, Hythe, Dibden, Dibden Purlieu, Holbury and Blackfield.",
    circulation: "14,000",
    leaflets: "YES"
  }, {
    area: "AREA 11",
    title: "NEW FOREST TO LYMINGTON",
    postcodes: "SO41 SO42 SO43 BH24 4",
    description: "The only magazine to reach so many homes in The New Forest directly delivered to by Royal Mail. Every property in these postcodes receive a copy.",
    circulation: "13,500",
    leaflets: "NO, SORRY"
  }];

  const magazineCovers = [{
    src: "/lovable-uploads/0ee7cdb0-f6e6-4dd5-9492-8136e247b6ab.png",
    alt: "Discover Magazine - Winchester & Surrounds Edition",
    title: "WINCHESTER & SURROUNDS"
  }, {
    src: "/lovable-uploads/3734fd45-4163-4f5c-b495-06604192d54c.png",
    alt: "Discover Magazine - Itchen Valley Edition",
    title: "ITCHEN VALLEY"
  }, {
    src: "/lovable-uploads/c4490b9b-94ad-42c9-a7d4-80ba8a52d3eb.png",
    alt: "Discover Magazine - Meon Valley & Whiteley Edition",
    title: "MEON VALLEY & WHITELEY"
  }, {
    src: "/lovable-uploads/d554421b-d268-40db-8d87-a66cd858a71a.png",
    alt: "Discover Magazine - New Forest & Waterside Edition",
    title: "NEW FOREST & WATERSIDE"
  }, {
    src: "/lovable-uploads/92f70bb1-98a7-464d-a511-5eb7eef51998.png",
    alt: "Discover Magazine - Southampton West & Totton Edition",
    title: "SOUTHAMPTON WEST & TOTTON"
  }, {
    src: "/lovable-uploads/25b8b054-62d4-42b8-858b-d8c91da6dc93.png",
    alt: "Discover Magazine - Test Valley & Romsey Edition",
    title: "TEST VALLEY & ROMSEY"
  }, {
    src: "/lovable-uploads/f98d0aa9-985f-4d69-85b9-193bf1934a18.png",
    alt: "Discover Magazine - Winchester & Alresford Edition",
    title: "WINCHESTER & ALRESFORD"
  }, {
    src: "/lovable-uploads/d4b20a63-65ea-4dec-b4b7-f1e1a6748979.png",
    alt: "Discover Magazine - Chandler's Ford & Eastleigh Edition",
    title: "CHANDLER'S FORD & EASTLEIGH"
  }];

  useEffect(() => {
    // Handle scrolling to hash on page load
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

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
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-1 inline-block">
            <span className="text-green-400 font-bold text-sm">✓ WORKING CALCULATOR</span>
          </div>
        </div>
      </section>

      {/* NEW: Dedicated Calculator Section */}
      <section id="calculator" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Get Your Instant Quote
            </h2>
            <p className="text-xl text-gray-600">
              Calculate your advertising costs with our interactive pricing calculator
            </p>
          </div>
          
          <AdvertisingCalculator>
            <Button size="lg" className="bg-community-green hover:bg-community-green/90 text-white px-8 py-3 font-bold">
              CALCULATE YOUR QUOTE
            </Button>
          </AdvertisingCalculator>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
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

      {/* Magazine Covers Carousel */}
      <section className="py-20 bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
        {/* Futuristic Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,255,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:30px_30px] animate-pulse" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-community-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-community-navy/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-6 py-2 mb-6">
              <div className="w-2 h-2 bg-community-green rounded-full animate-pulse" />
              <span className="text-white font-medium">LIVE PUBLICATIONS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Discover Magazine Editions
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore our stunning collection of local editions covering all areas of South Hampshire
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <Carousel opts={{
              align: "center",
              loop: true
            }} className="w-full">
              <CarouselContent className="-ml-6">
                {magazineCovers.map((cover, index) => (
                  <CarouselItem key={index} className="pl-6 md:basis-1/2 lg:basis-1/3">
                    <Card className="group relative overflow-hidden bg-white/5 backdrop-blur border border-white/10 hover:border-community-green/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-community-green/20">
                      <CardContent className="p-6">
                        <div className="relative overflow-hidden rounded-lg">
                          <img src={cover.src} alt={cover.alt} className="w-full h-96 object-contain transition-transform duration-700 group-hover:scale-110" />
                          {/* Futuristic Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="text-white font-bold text-sm mb-2">{cover.title}</h3>
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-community-green rounded-full" />
                              <span className="text-community-green text-xs font-medium">CURRENT EDITION</span>
                            </div>
                          </div>
                        </div>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-lg border border-community-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Custom Navigation Buttons */}
              <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300" />
              <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300" />
            </Carousel>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="border-white/30 hover:bg-white px-8 py-3 font-bold rounded-full backdrop-blur transition-all duration-300 text-slate-950">
                EXPLORE ALL EDITIONS
              </Button>
              <Button variant="outline" className="border-white/30 hover:bg-white px-8 py-3 font-bold rounded-full backdrop-blur transition-all duration-300 text-slate-950">
                VIEW DISTRIBUTION MAP
              </Button>
            </div>
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

      {/* Distribution Areas Table */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Distribution Areas & Coverage
            </h2>
            <p className="text-xl text-gray-600">
              Detailed breakdown of our 12 distribution areas across South Hampshire
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Area</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                  <TableHead className="font-bold">Postcodes</TableHead>
                  <TableHead className="font-bold">Description</TableHead>
                  <TableHead className="font-bold">Circulation</TableHead>
                  <TableHead className="font-bold">Leaflets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localAreas.map((area, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{area.area}</TableCell>
                    <TableCell className="font-medium">{area.title}</TableCell>
                    <TableCell>{area.postcodes}</TableCell>
                    <TableCell className="text-sm">{area.description}</TableCell>
                    <TableCell className="font-medium">{area.circulation}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        area.leaflets === "YES" 
                          ? "bg-green-100 text-green-800" 
                          : area.leaflets === "YES BUT ROMSEY ONLY"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {area.leaflets}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-community-navy mb-4">
              Ready to Advertise?
            </h2>
            <p className="text-xl text-gray-600">
              Get in touch with our advertising team to discuss your requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Phone className="h-12 w-12 text-community-green mx-auto mb-4" />
                <CardTitle className="text-community-navy">Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-community-navy mb-2">023 8027 2922</p>
                <p className="text-gray-600">Monday - Friday, 9am - 5pm</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Mail className="h-12 w-12 text-community-green mx-auto mb-4" />
                <CardTitle className="text-community-navy">Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-community-navy mb-2">advertising@discover-southampton.co.uk</p>
                <p className="text-gray-600">We'll respond within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-community-green mx-auto mb-4" />
                <CardTitle className="text-community-navy">Book Consultation</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="bg-community-green hover:bg-community-green/90 text-white px-6 py-2">
                  Schedule Meeting
                </Button>
                <p className="text-gray-600 mt-2">Free advertising consultation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdvertisingNew;