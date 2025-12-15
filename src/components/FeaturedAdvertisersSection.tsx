import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const FeaturedAdvertisersSection = () => {
  const advertisers = [
    { name: 'DJ Summers Plumbing & Heating', logo: '/lovable-uploads/3457943e-ae98-43c0-b6cb-556d1d936472.png' },
    { name: 'Edwards Conservatory & Gutter Cleaning', logo: '/lovable-uploads/f6d05495-f433-4146-a6c5-b4332e7616bf.png' },
    { name: 'Acorn Tree Specialist Ltd', logo: '/lovable-uploads/0fd435d2-73a9-43e4-94cb-ee201a129979.png' },
    { name: 'The Little Curtain and Blind Company', logo: '/lovable-uploads/9940534b-25e0-4a76-9769-8f048532d0a5.png' },
    { name: 'Jon Callen Podiatrist', logo: '/lovable-uploads/6ce5a96b-19dd-49ab-aa34-4a048c3c22d2.png' },
    { name: 'Mark Parsons Decorating Services', logo: '/lovable-uploads/5c775c6a-2d81-439b-871e-56243f2f1686.png' },
    { name: 'Martin Langley Carpentry', logo: '/lovable-uploads/5d7d823c-c298-48e4-81ca-f206cfb9e6f9.png' },
    { name: 'W.A.G Decorating Services', logo: '/lovable-uploads/3bf54723-bde1-45e5-ba7d-fa1c6a9a1a1a.png' }
  ];

  return (
    <section className="py-12 md:py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-3 md:mb-4">
            Featured Advertisers
          </h2>
          <p className="text-base md:text-xl text-muted-foreground font-body">
            Supporting local businesses that make our community thrive
          </p>
        </div>
        
        <div className="relative">
          <Carousel 
            opts={{
              align: "start",
              loop: true
            }} 
            className="w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-6">
              {advertisers.map((advertiser, index) => (
                <CarouselItem key={index} className="pl-3 md:pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex items-center justify-center p-4 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer min-h-[200px] md:min-h-[220px]">
                        <img 
                          src={advertiser.logo} 
                          alt={advertiser.name}
                          loading="lazy"
                          className="max-w-full max-h-44 md:max-h-48 object-contain hover:scale-105 transition-all duration-300"
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] p-4">
                      <div className="flex items-center justify-center">
                        <img 
                          src={advertiser.logo} 
                          alt={advertiser.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Mobile-visible navigation */}
            <CarouselPrevious className="left-0 md:-left-4 lg:-left-12 h-10 w-10 md:h-12 md:w-12" />
            <CarouselNext className="right-0 md:-right-4 lg:-right-12 h-10 w-10 md:h-12 md:w-12" />
          </Carousel>
          
          {/* Swipe hint for mobile */}
          <p className="text-center text-xs text-muted-foreground mt-4 md:hidden">
            Swipe to see more advertisers
          </p>
        </div>
        
        <div className="text-center mt-8 md:mt-12">
          <p className="text-muted-foreground font-body mb-4">
            Want to feature your business here?
          </p>
          <a 
            href="/advertising" 
            className="inline-block text-community-green font-semibold hover:text-green-600 transition-colors min-h-[44px] py-2"
          >
            Learn about our advertising options →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAdvertisersSection;
