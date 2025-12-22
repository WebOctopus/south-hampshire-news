import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface StoryDetail {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  area: string;
  featured_image_url: string | null;
  author_name: string | null;
  created_at: string;
  published_at: string | null;
}

const Story = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('stories')
          .select('*')
          .eq('id', id)
          .eq('is_published', true)
          .single();

        if (fetchError || !data) {
          setError(true);
        } else {
          setStory(data as StoryDetail);
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Estimate read time based on word count
  const getReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="aspect-video bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-heading font-bold text-community-navy mb-4">
              Story Not Found
            </h1>
            <p className="text-gray-600 mb-6">The story you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/stories')} className="bg-community-navy hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            onClick={() => navigate('/stories')} 
            variant="ghost" 
            className="mb-8 text-community-navy hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Button>

          <article>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 bg-community-green text-white text-sm font-medium rounded-full">
                  <Tag className="w-3 h-3 mr-1" />
                  {story.category}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-community-navy text-white text-sm font-medium rounded-full">
                  <MapPin className="w-3 h-3 mr-1" />
                  {story.area}
                </span>
                <span className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(story.published_at || story.created_at)}
                </span>
                <span className="text-gray-500 text-sm">{getReadTime(story.content)}</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-community-navy mb-4">
                {story.title}
              </h1>
              
              {story.excerpt && (
                <p className="text-xl text-gray-600 font-body mb-6">
                  {story.excerpt}
                </p>
              )}
              
              {story.author_name && (
                <p className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  By {story.author_name}
                </p>
              )}
            </div>

            {story.featured_image_url && (
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-8">
                <img 
                  src={story.featured_image_url} 
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div 
              className="prose prose-lg max-w-none font-body"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {story.content}
            </div>
          </article>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-heading font-semibold text-community-navy mb-2">
                  Share this story
                </h3>
                <p className="text-gray-600">Help spread the word about community news</p>
              </div>
              <Button onClick={() => navigate('/stories')} className="bg-community-navy hover:bg-slate-700">
                Read More Stories
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Story;
