import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

const TestimonialsCarousel = () => {
  const testimonials = [
    {
      name: 'Sarah Mitchell',
      location: 'Fareham',
      quote: 'Discover magazine keeps me connected with everything happening in our community. I love reading the local stories!',
      rating: 5
    },
    {
      name: 'David Thompson',
      location: 'Gosport',
      quote: 'The events section is fantastic. I never miss out on local activities thanks to Discover.',
      rating: 5
    },
    {
      name: 'Emma Wilson',
      location: 'Havant',
      quote: 'As a local business owner, advertising in Discover has really helped boost our customer base.',
      rating: 5
    },
    {
      name: 'Robert Clarke',
      location: 'Waterlooville',
      quote: 'Been reading Discover for years. It truly captures the spirit of our local community.',
      rating: 5
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-center text-community-navy mb-8 md:mb-12">
          What Our Readers Say
        </h2>
        
        <div className="relative">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-full md:basis-1/2">
                  <Card className="h-full mx-2">
                    <CardContent className="p-5 md:p-6">
                      <div className="flex mb-3 md:mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-lg md:text-xl">★</span>
                        ))}
                      </div>
                      <blockquote className="text-muted-foreground mb-4 font-body italic text-sm md:text-base">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="border-t pt-3 md:pt-4">
                        <p className="font-semibold text-community-navy">{testimonial.name}</p>
                        <p className="text-muted-foreground text-sm">{testimonial.location}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Visible navigation buttons */}
            <CarouselPrevious className="left-0 md:-left-4 lg:-left-12 h-10 w-10 md:h-12 md:w-12" />
            <CarouselNext className="right-0 md:-right-4 lg:-right-12 h-10 w-10 md:h-12 md:w-12" />
          </Carousel>
          
          {/* Swipe hint for mobile */}
          <p className="text-center text-xs text-muted-foreground mt-4 md:hidden">
            Swipe to see more reviews
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
