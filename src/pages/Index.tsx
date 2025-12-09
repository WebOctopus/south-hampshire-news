import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import PostcodeBanner from '../components/PostcodeBanner';
import IconCardsSection from '../components/IconCardsSection';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import LatestStoriesGrid from '../components/LatestStoriesGrid';
import FeaturedAdvertisersSection from '../components/FeaturedAdvertisersSection';
import NewsletterSignup from '../components/NewsletterSignup';
import StickyDownloadForm from '../components/StickyDownloadForm';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useNavigate } from 'react-router-dom';
import { useMagazineEditions } from '@/hooks/useMagazineEditions';
import { Skeleton } from '@/components/ui/skeleton';

// Fallback data in case database is empty or loading fails
const fallbackCovers = [
  { src: "/lovable-uploads/0ee7cdb0-f6e6-4dd5-9492-8136e247b6ab.png", alt: "Discover Magazine - Winchester & Surrounds Edition", title: "WINCHESTER & SURROUNDS" },
  { src: "/lovable-uploads/3734fd45-4163-4f5c-b495-06604192d54c.png", alt: "Discover Magazine - Itchen Valley Edition", title: "ITCHEN VALLEY" },
  { src: "/lovable-uploads/c4490b9b-94ad-42c9-a7d4-80ba8a52d3eb.png", alt: "Discover Magazine - Meon Valley & Whiteley Edition", title: "MEON VALLEY & WHITELEY" },
  { src: "/lovable-uploads/d554421b-d268-40db-8d87-a66cd858a71a.png", alt: "Discover Magazine - New Forest & Waterside Edition", title: "NEW FOREST & WATERSIDE" },
  { src: "/lovable-uploads/92f70bb1-98a7-464d-a511-5eb7eef51998.png", alt: "Discover Magazine - Southampton West & Totton Edition", title: "SOUTHAMPTON WEST & TOTTON" },
  { src: "/lovable-uploads/25b8b054-62d4-42b8-858b-d8c91da6dc93.png", alt: "Discover Magazine - Test Valley & Romsey Edition", title: "TEST VALLEY & ROMSEY" },
  { src: "/lovable-uploads/f98d0aa9-985f-4d69-85b9-193bf1934a18.png", alt: "Discover Magazine - Winchester & Alresford Edition", title: "WINCHESTER & ALRESFORD" },
  { src: "/lovable-uploads/d4b20a63-65ea-4dec-b4b7-f1e1a6748979.png", alt: "Discover Magazine - Chandler's Ford & Eastleigh Edition", title: "CHANDLER'S FORD & EASTLEIGH" }
];

const Index = () => {
  const navigate = useNavigate();
  const { data: editions, isLoading } = useMagazineEditions();
  
  // Map database editions to carousel format, or use fallback
  const magazineCovers = editions?.length 
    ? editions.map(e => ({
        src: e.image_url,
        alt: e.alt_text || `Discover Magazine - ${e.title} Edition`,
        title: e.title,
        link: e.link_url
      }))
    : fallbackCovers;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Magazine Covers Carousel - Now at the top */}
        <section className="py-20 bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
          {/* Futuristic Background Effects */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,255,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:30px_30px] animate-pulse" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-community-green/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-community-navy/20 rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
                South Hampshire's Biggest, Little & Best Local Magazine
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                A collection of localised editions delivered to 142,000 letterboxes in SO & PO postcodes. Loved by residents since 2005 and continuing to serve businesses with a cost effective advertising platform.
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
                <Button 
                  className="bg-community-green hover:bg-community-green/90 text-white px-8 py-3 font-bold rounded-full border border-community-green/20 hover:shadow-lg hover:shadow-community-green/30 transition-all duration-300"
                  onClick={() => navigate('/advertising')}
                >
                  ADVERTISING INFO
                </Button>
                <Button asChild variant="outline" className="border-white/30 hover:bg-white px-8 py-3 font-bold rounded-full backdrop-blur transition-all duration-300 text-slate-950">
                  <a href="/advertising#distribution-map">VIEW DISTRIBUTION MAP</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Five cards section */}
        <IconCardsSection />
        
        {/* Our Readers Say */}
        <TestimonialsCarousel />
        
        {/* Featured Advertisers */}
        <FeaturedAdvertisersSection />
        
        {/* Latest Stories */}
        <LatestStoriesGrid />
        
        {/* Discover Extra */}
        <NewsletterSignup />
      </main>
      <Footer />
      <StickyDownloadForm />
    </div>
  );
};

export default Index;