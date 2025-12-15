import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LatestStoriesGrid = () => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  
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

  // On mobile, show only 3 stories unless expanded
  const displayedStories = showAll ? stories : stories.slice(0, 3);

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-3 md:mb-4">
            Latest Stories
          </h2>
          <p className="text-base md:text-xl text-muted-foreground font-body">
            Stay updated with the latest news from your community
          </p>
        </div>
        
        {/* Mobile: Show limited stories, Desktop: Show all */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Mobile shows displayedStories, desktop shows all */}
          {stories.map((story, index) => (
            <Card 
              key={story.id} 
              className={`group hover:shadow-lg transition-shadow duration-300 ${
                !showAll && index >= 3 ? 'hidden md:block' : ''
              }`}
            >
              <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                <img 
                  src={story.image} 
                  alt={story.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-2 md:pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-community-green text-white text-xs font-medium rounded-full">
                    {story.category}
                  </span>
                  <span className="text-muted-foreground text-sm">{story.date}</span>
                </div>
                <CardTitle className="text-lg md:text-xl font-heading text-community-navy group-hover:text-community-green transition-colors line-clamp-2">
                  {story.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-body mb-4 text-sm md:text-base line-clamp-2">
                  {story.excerpt}
                </p>
                <Button 
                  variant="outline" 
                  className="text-community-green border-community-green hover:bg-community-green hover:text-white min-h-[44px] px-6"
                  onClick={() => navigate(`/story/${story.id}`)}
                >
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Mobile: Show more / Show less button */}
        <div className="text-center mt-8 md:hidden">
          {!showAll ? (
            <Button 
              variant="outline"
              onClick={() => setShowAll(true)}
              className="min-h-[44px] px-8"
            >
              Show More Stories
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => setShowAll(false)}
              className="min-h-[44px] px-8"
            >
              Show Less
            </Button>
          )}
        </div>
        
        {/* Desktop: View All button */}
        <div className="text-center mt-12 hidden md:block">
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
