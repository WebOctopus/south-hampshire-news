import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const LatestStoriesGrid = () => {
  const navigate = useNavigate();
  
  const stories = [
    {
      id: 1,
      title: 'New Community Garden Opens in Fareham',
      excerpt: 'Local residents celebrate the opening of a beautiful new community garden that brings neighbors together.',
      image: '/lovable-uploads/3d27ee8c-7011-429f-98ca-06f2a167bed7.png',
      date: '2024-06-01',
      category: 'Community'
    },
    {
      id: 2,
      title: 'Local Business Wins Regional Award',
      excerpt: 'Southampton-based bakery receives recognition for outstanding customer service and community involvement.',
      image: '/lovable-uploads/99da34dd-ee6c-44a1-b95c-6edbc8085cd4.png',
      date: '2024-05-28',
      category: 'Business'
    },
    {
      id: 3,
      title: 'Charity Walk Raises £15,000',
      excerpt: 'Annual charity walk through Hampshire countryside exceeds fundraising goals for local hospice.',
      image: '/lovable-uploads/8510b25e-7916-4c6f-9962-24063afd3547.png',
      date: '2024-05-25',
      category: 'Events'
    },
    {
      id: 4,
      title: 'School Art Project Brightens High Street',
      excerpt: 'Students create stunning mural that transforms local shopping area and celebrates community diversity.',
      image: '/lovable-uploads/39aad051-fc81-4d48-8360-29e479c12edb.png',
      date: '2024-05-22',
      category: 'Education'
    },
    {
      id: 5,
      title: 'New Cycling Route Connects Villages',
      excerpt: 'Hampshire County Council opens safe cycling path linking rural communities with market towns.',
      image: '/lovable-uploads/9880f659-eb8f-4c62-a436-3228e465479c.png',
      date: '2024-05-20',
      category: 'Transport'
    },
    {
      id: 6,
      title: 'Local Hero Honored for Volunteer Work',
      excerpt: 'Grandmother of four receives community award for decades of service to local food bank.',
      image: '/lovable-uploads/0cb5406a-eaee-4828-af68-e345305abd9e.png',
      date: '2024-05-18',
      category: 'People'
    }
  ];

  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-2 md:mb-4">
            Latest Stories
          </h2>
          <p className="text-sm md:text-xl text-muted-foreground font-body">
            Stay updated with the latest news from your community
          </p>
        </div>
        
        {/* Mobile: Carousel with compact cards */}
        <div className="md:hidden relative">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-3">
              {stories.map((story) => (
                <CarouselItem key={story.id} className="pl-3 basis-[85%]">
                  <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <div className="flex gap-3 p-3">
                      {/* Compact image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={story.image} 
                          alt={story.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-community-green text-white text-[10px] font-medium rounded-full">
                            {story.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-heading font-semibold text-community-navy line-clamp-2 mb-1">
                          {story.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {story.excerpt}
                        </p>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 h-8 w-8" />
            <CarouselNext className="right-0 h-8 w-8" />
          </Carousel>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Swipe to see more stories
          </p>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {stories.map((story) => (
            <Card 
              key={story.id} 
              className="group hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                <img 
                  src={story.image} 
                  alt={story.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-community-green text-white text-xs font-medium rounded-full">
                    {story.category}
                  </span>
                  <span className="text-muted-foreground text-sm">{story.date}</span>
                </div>
                <h3 className="text-lg font-heading font-semibold text-community-navy group-hover:text-community-green transition-colors line-clamp-2 mb-2">
                  {story.title}
                </h3>
                <p className="text-muted-foreground font-body text-sm line-clamp-2 mb-3">
                  {story.excerpt}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-community-green border-community-green hover:bg-community-green hover:text-white"
                  onClick={() => navigate(`/story/${story.id}`)}
                >
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* View All button */}
        <div className="text-center mt-6 md:mt-12">
          <Button 
            size="lg" 
            className="bg-community-navy hover:bg-slate-700 text-white min-h-[44px]"
            onClick={() => navigate('/stories')}
          >
            View All Stories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestStoriesGrid;
