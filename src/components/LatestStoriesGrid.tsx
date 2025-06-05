import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LatestStoriesGrid = () => {
  // Mock data - in a real app this would come from a blog feed
  const stories = [
    {
      id: 1,
      title: 'New Community Garden Opens in Fareham',
      excerpt: 'Local residents celebrate the opening of a beautiful new community garden that brings neighbors together.',
      image: '/placeholder.svg',
      date: '2024-06-01',
      category: 'Community'
    },
    {
      id: 2,
      title: 'Local Business Wins Regional Award',
      excerpt: 'Southampton-based bakery receives recognition for outstanding customer service and community involvement.',
      image: '/placeholder.svg',
      date: '2024-05-28',
      category: 'Business'
    },
    {
      id: 3,
      title: 'Charity Walk Raises £15,000',
      excerpt: 'Annual charity walk through Hampshire countryside exceeds fundraising goals for local hospice.',
      image: '/placeholder.svg',
      date: '2024-05-25',
      category: 'Events'
    },
    {
      id: 4,
      title: 'School Art Project Brightens High Street',
      excerpt: 'Students create stunning mural that transforms local shopping area and celebrates community diversity.',
      image: '/placeholder.svg',
      date: '2024-05-22',
      category: 'Education'
    },
    {
      id: 5,
      title: 'New Cycling Route Connects Villages',
      excerpt: 'Hampshire County Council opens safe cycling path linking rural communities with market towns.',
      image: '/placeholder.svg',
      date: '2024-05-20',
      category: 'Transport'
    },
    {
      id: 6,
      title: 'Local Hero Honored for Volunteer Work',
      excerpt: 'Grandmother of four receives community award for decades of service to local food bank.',
      image: '/placeholder.svg',
      date: '2024-05-18',
      category: 'People'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-4">
            Latest Stories
          </h2>
          <p className="text-xl text-gray-600 font-body">
            Stay updated with the latest news from your community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <Card key={story.id} className="group hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img 
                  src={story.image} 
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-community-green text-white text-xs font-medium rounded-full">
                    {story.category}
                  </span>
                  <span className="text-gray-500 text-sm">{story.date}</span>
                </div>
                <CardTitle className="text-xl font-heading text-community-navy group-hover:text-community-green transition-colors">
                  {story.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-body mb-4">
                  {story.excerpt}
                </p>
                <Button variant="outline" size="sm" className="text-community-green border-community-green hover:bg-community-green hover:text-white">
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" className="bg-community-navy hover:bg-slate-700 text-white">
            View All Stories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestStoriesGrid;