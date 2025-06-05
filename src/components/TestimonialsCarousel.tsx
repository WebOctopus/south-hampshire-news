import { useState } from 'react';
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-center text-community-navy mb-12">
          What Our Readers Say
        </h2>
        
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">★</span>
                      ))}
                    </div>
                    <blockquote className="text-gray-700 mb-4 font-body italic">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="border-t pt-4">
                      <p className="font-semibold text-community-navy">{testimonial.name}</p>
                      <p className="text-gray-600 text-sm">{testimonial.location}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;