import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedAdvertisers } from '@/hooks/useFeaturedAdvertisers';

const FeaturedAdvertisersSection = () => {
  const { data: advertisers, isLoading } = useFeaturedAdvertisers(false);

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[220px] w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!advertisers || advertisers.length === 0) {
    return null;
  }

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
              {advertisers.map((advertiser) => (
                <CarouselItem key={advertiser.id} className="pl-3 md:pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  {advertiser.business_id ? (
                    <Link to={`/business/${advertiser.business_id}`}>
                      <div className="flex items-center justify-center p-4 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer min-h-[200px] md:min-h-[220px]">
                        <img 
                          src={advertiser.image_url} 
                          alt={advertiser.name}
                          loading="lazy"
                          className="max-w-full max-h-44 md:max-h-48 object-contain hover:scale-105 transition-all duration-300"
                        />
                      </div>
                    </Link>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="flex items-center justify-center p-4 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer min-h-[200px] md:min-h-[220px]">
                          <img 
                            src={advertiser.image_url} 
                            alt={advertiser.name}
                            loading="lazy"
                            className="max-w-full max-h-44 md:max-h-48 object-contain hover:scale-105 transition-all duration-300"
                          />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] p-4">
                        <div className="flex items-center justify-center">
                          <img 
                            src={advertiser.image_url} 
                            alt={advertiser.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
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
