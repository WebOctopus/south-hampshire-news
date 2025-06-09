import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

const StoriesArchive = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data - in a real app this would come from a blog feed/API
  const allStories = [
    {
      id: 1,
      title: 'New Community Garden Opens in Fareham',
      excerpt: 'Local residents celebrate the opening of a beautiful new community garden that brings neighbors together.',
      image: '/placeholder.svg',
      date: '2024-06-01',
      category: 'Community',
      area: 'FAREHAM & SURROUNDS'
    },
    {
      id: 2,
      title: 'Local Business Wins Regional Award',
      excerpt: 'Southampton-based bakery receives recognition for outstanding customer service and community involvement.',
      image: '/placeholder.svg',
      date: '2024-05-28',
      category: 'Business',
      area: 'SOUTHAMPTON SUBURBS'
    },
    {
      id: 3,
      title: 'Charity Walk Raises £15,000',
      excerpt: 'Annual charity walk through Hampshire countryside exceeds fundraising goals for local hospice.',
      image: '/placeholder.svg',
      date: '2024-05-25',
      category: 'Events',
      area: 'WINCHESTER & VILLAGES'
    },
    {
      id: 4,
      title: 'School Art Project Brightens High Street',
      excerpt: 'Students create stunning mural that transforms local shopping area and celebrates community diversity.',
      image: '/placeholder.svg',
      date: '2024-05-22',
      category: 'Education',
      area: 'EASTLEIGH & VILLAGES'
    },
    {
      id: 5,
      title: 'New Cycling Route Connects Villages',
      excerpt: 'Hampshire County Council opens safe cycling path linking rural communities with market towns.',
      image: '/placeholder.svg',
      date: '2024-05-20',
      category: 'Transport',
      area: 'ROMSEY & TEST VALLEY'
    },
    {
      id: 6,
      title: 'Local Hero Honored for Volunteer Work',
      excerpt: 'Grandmother of four receives community award for decades of service to local food bank.',
      image: '/placeholder.svg',
      date: '2024-05-18',
      category: 'People',
      area: 'WATERSIDE & TOTTON'
    },
    {
      id: 7,
      title: 'New Library Branch Opens Downtown',
      excerpt: 'Modern library facility offers digital resources and community meeting spaces for all ages.',
      image: '/placeholder.svg',
      date: '2024-05-15',
      category: 'Community',
      area: 'CHANDLER\'S FORD & NORTH BADDESLEY'
    },
    {
      id: 8,
      title: 'Local Restaurant Wins Sustainability Award',
      excerpt: 'Family-owned restaurant recognized for innovative eco-friendly practices and local sourcing.',
      image: '/placeholder.svg',
      date: '2024-05-12',
      category: 'Business',
      area: 'HEDGE END & SURROUNDS'
    },
    {
      id: 9,
      title: 'Youth Football Team Reaches Finals',
      excerpt: 'Local under-16s team makes it to county championships after impressive season performance.',
      image: '/placeholder.svg',
      date: '2024-05-08',
      category: 'Events',
      area: 'LOCKS HEATH & SURROUNDS'
    }
  ];

  const categories = ['all', 'Community', 'Business', 'Events', 'Education', 'Transport', 'People'];
  const areas = ['all', 'SOUTHAMPTON SUBURBS', 'CHANDLER\'S FORD & NORTH BADDESLEY', 'EASTLEIGH & VILLAGES', 'HEDGE END & SURROUNDS', 'LOCKS HEATH & SURROUNDS', 'FAREHAM & SURROUNDS', 'WICKHAM & BISHOP\'S WALTHAM', 'WINCHESTER & VILLAGES', 'ROMSEY & TEST VALLEY', 'WATERSIDE & TOTTON', 'NEW FOREST TO LYMINGTON'];

  // Filter and sort stories
  const filteredStories = allStories
    .filter(story => {
      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           story.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
      const matchesArea = selectedArea === 'all' || story.area === selectedArea;
      return matchesSearch && matchesCategory && matchesArea;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        {/* Header */}
        <section className="bg-community-navy text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-4">
                Stories Archive
              </h1>
              <p className="text-xl text-gray-300 font-body max-w-2xl mx-auto">
                Browse through all our community stories and find what interests you most
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Filter by:</span>
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map(area => (
                      <SelectItem key={area} value={area}>
                        {area === 'all' ? 'All Areas' : area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4">
              <p className="text-gray-600 text-sm">
                Showing {filteredStories.length} of {allStories.length} stories
              </p>
            </div>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredStories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 font-body">
                  No stories found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedArea('all');
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStories.map((story) => (
                  <Card key={story.id} className="group hover:shadow-lg transition-shadow duration-300">
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={story.image} 
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-3 py-1 bg-community-green text-white text-xs font-medium rounded-full">
                          {story.category}
                        </span>
                        <span className="px-3 py-1 bg-community-navy text-white text-xs font-medium rounded-full">
                          {story.area}
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
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StoriesArchive;