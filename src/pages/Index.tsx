import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import PostcodeBanner from '../components/PostcodeBanner';
import IconCardsSection from '../components/IconCardsSection';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import LatestStoriesGrid from '../components/LatestStoriesGrid';
import FeaturedAdvertisersSection from '../components/FeaturedAdvertisersSection';
import NewsletterSignup from '../components/NewsletterSignup';
// StickyDownloadForm hidden temporarily - may be replaced later
// import StickyDownloadForm from '../components/StickyDownloadForm';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useNavigate } from 'react-router-dom';
import { useMagazineEditions } from '@/hooks/useMagazineEditions';
import { Skeleton } from '@/components/ui/skeleton';

// Fallback data in case database is empty or loading fails
const fallbackCovers = [
  { src: "/lovable-uploads/0ee7cdb0-f6e6-4dd5-9492-8136e247b6ab.png", alt: "Discover Magazine - Winchester & Surrounds Edition", issueMonth: "January 2025", link: null as string | null },
  { src: "/lovable-uploads/3734fd45-4163-4f5c-b495-06604192d54c.png", alt: "Discover Magazine - Itchen Valley Edition", issueMonth: "January 2025", link: null as string | null },
  { src: "/lovable-uploads/c4490b9b-94ad-42c9-a7d4-80ba8a52d3eb.png", alt: "Discover Magazine - Meon Valley & Whiteley Edition", issueMonth: "January 2025", link: null as string | null },
  { src: "/lovable-uploads/d554421b-d268-40db-8d87-a66cd858a71a.png", alt: "Discover Magazine - New Forest & Waterside Edition", issueMonth: "January 2025", link: null as string | null },
  { src: "/lovable-uploads/92f70bb1-98a7-464d-a511-5eb7eef51998.png", alt: "Discover Magazine - Southampton West & Totton Edition", issueMonth: "January 2025", link: null as string | null },
  { src: "/lovable-uploads/25b8b054-62d4-42b8-858b-d8c91da6dc93.png", alt: "Discover Magazine - Test Valley & Romsey Edition", issueMonth: "January 2025", link: null as string | null },
  { src: "/lovable-uploads/f98d0aa9-985f-4d69-85b9-193bf1934a18.png", alt: "Discover Magazine - Winchester & Alresford Edition", issueMonth: "January 2025", link: null as string | null },
  { src: "/lovable-uploads/d4b20a63-65ea-4dec-b4b7-f1e1a6748979.png", alt: "Discover Magazine - Chandler's Ford & Eastleigh Edition", issueMonth: "January 2025", link: null as string | null }
];

const Index = () => {
  const navigate = useNavigate();
  const { data: editions, isLoading } = useMagazineEditions(false, 'front_cover');
  
  // Map database editions to carousel format, or use fallback
  const magazineCovers = editions?.length 
    ? editions.map(e => ({
        src: e.image_url,
        alt: e.alt_text || `Discover Magazine - ${e.title} Edition`,
        issueMonth: e.issue_month || 'Current Edition',
        link: e.link_url
      }))
    : fallbackCovers;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Magazine Covers Carousel - Now at the top */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
          {/* Futuristic Background Effects */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,255,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:30px_30px] animate-pulse" />
          <div className="absolute top-0 left-0 w-48 md:w-96 h-48 md:h-96 bg-community-green/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-community-navy/20 rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-3 md:mb-4">
                South Hampshire's Biggest, Little & Best Local Magazine
              </h2>
              <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto">
                A collection of localised editions delivered to 142,000 letterboxes in SO & PO postcodes. Loved by residents since 2005 and continuing to serve businesses with a cost effective advertising platform.
              </p>
            </div>

            <div className="relative">
              <Carousel opts={{
                align: "center",
                loop: true
              }} className="w-full max-w-5xl mx-auto">
                <CarouselContent className="-ml-3 md:-ml-6">
                  {magazineCovers.map((cover, index) => {
                    const CardWrapper = cover.link ? 'a' : 'div';
                    const wrapperProps = cover.link ? {
                      href: cover.link,
                      target: "_blank",
                      rel: "noopener noreferrer"
                    } : {};
                    
                    return (
                      <CarouselItem key={index} className="pl-3 md:pl-6 basis-[85%] md:basis-1/2 lg:basis-1/3">
                        <CardWrapper {...wrapperProps} className={cover.link ? "cursor-pointer block" : ""}>
                          <Card className="group relative overflow-hidden bg-white/5 backdrop-blur border border-white/10 hover:border-community-green/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-community-green/20">
                            <CardContent className="p-4 md:p-6">
                              <div className="relative overflow-hidden rounded-lg">
                                <img src={cover.src} alt={cover.alt} className="w-full h-64 md:h-80 lg:h-96 object-contain transition-transform duration-700 group-hover:scale-110" />
                                {/* Futuristic Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              </div>
                              {/* Glow Effect */}
                              <div className="absolute inset-0 rounded-lg border border-community-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </CardContent>
                          </Card>
                        </CardWrapper>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                
                {/* Mobile-visible navigation buttons */}
                <CarouselPrevious className="left-2 md:-left-4 lg:-left-16 h-10 w-10 md:h-12 md:w-12 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300" />
                <CarouselNext className="right-2 md:-right-4 lg:-right-16 h-10 w-10 md:h-12 md:w-12 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-community-green hover:border-community-green transition-all duration-300" />
              </Carousel>
              
              {/* Swipe indicator for mobile */}
              <p className="text-center text-xs text-gray-400 mt-4 md:hidden">
                Swipe to explore editions
              </p>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-8 md:mt-12">
              <div className="inline-flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button 
                  className="bg-community-green hover:bg-community-green/90 text-white px-6 md:px-8 py-3 font-bold rounded-full border border-community-green/20 hover:shadow-lg hover:shadow-community-green/30 transition-all duration-300 min-h-[44px]"
                  onClick={() => navigate('/advertising')}
                >
                  ADVERTISING INFO
                </Button>
                <Button asChild variant="outline" className="border-white/30 hover:bg-white px-6 md:px-8 py-3 font-bold rounded-full backdrop-blur transition-all duration-300 text-slate-950 min-h-[44px]">
                  <a href="/contact">CONTACT US</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Five cards section */}
        <IconCardsSection />
        
        {/* Our Readers Say - Hidden on mobile */}
        <div className="hidden md:block">
          <TestimonialsCarousel />
        </div>
        
        {/* Featured Advertisers */}
        <FeaturedAdvertisersSection />
        
        {/* Latest Stories */}
        <div id="news">
          <LatestStoriesGrid />
        </div>
        
        {/* Discover Extra */}
        <NewsletterSignup />
      </main>
      <Footer />
      {/* StickyDownloadForm hidden temporarily - may be replaced later */}
    </div>
  );
};

export default Index;