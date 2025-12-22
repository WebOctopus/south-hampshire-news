import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';

interface Story {
  id: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  created_at: string;
  category: string;
}

const LatestStoriesGrid = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('id, title, excerpt, featured_image_url, created_at, category')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setStories(data || []);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="py-10 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-2 md:mb-4">
              Latest Stories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-lg"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stories.length === 0) {
    return null;
  }

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
                      <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={story.featured_image_url || '/placeholder.svg'} 
                          alt={story.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
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
                  src={story.featured_image_url || '/placeholder.svg'} 
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
                  <span className="text-muted-foreground text-sm">{formatDate(story.created_at)}</span>
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
