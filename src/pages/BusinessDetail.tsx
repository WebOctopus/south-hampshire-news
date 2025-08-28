import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, ExternalLink, Clock, Star, ImageIcon, Lock } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

interface Business {
  id: string;
  name: string;
  description: string;
  category_id: string;
  email?: string; // Optional for public users
  phone?: string; // Optional for public users
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postcode: string;
  logo_url: string;
  featured_image_url: string;
  images: string[];
  is_verified: boolean;
  featured: boolean;
  opening_hours: any;
  business_categories: {
    name: string;
    icon: string;
  };
}

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      fetchBusiness();
    }
  }, [id]);

  const fetchBusiness = async () => {
    const { data, error } = await supabase.rpc('get_business_detail', {
      business_id: id
    });
    
    if (error) {
      console.error('Error fetching business:', error);
      setBusiness(null);
    } else if (data && data.length > 0) {
      // Transform the data to match the expected Business interface
      const businessData = {
        ...data[0],
        business_categories: (data[0].business_categories as any) || { name: '', icon: '' }
      };
      setBusiness(businessData as Business);
    } else {
      setBusiness(null);
    }
    setLoading(false);
  };

  const handleWebsiteClick = () => {
    if (business?.website) {
      window.open(business.website.startsWith('http') ? business.website : `https://${business.website}`, '_blank');
    }
  };

  const handleEmailClick = () => {
    if (business?.email) {
      window.open(`mailto:${business.email}`);
    }
  };

  const handlePhoneClick = () => {
    if (business?.phone) {
      window.open(`tel:${business.phone}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-community-green"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <p className="text-gray-600 mb-8">The business you're looking for doesn't exist or has been removed.</p>
          <Link to="/business-directory">
            <Button className="bg-community-green hover:bg-green-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = [business.featured_image_url, ...(business.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/business-directory" className="inline-flex items-center text-community-green hover:text-green-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Link>

        {/* Mobile Business Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-3">
                {business.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-community-green/10 text-community-green">
                  {business.business_categories?.name}
                </Badge>
                {business.is_verified && (
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Verified
                  </Badge>
                )}
                {business.featured && (
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            {business.logo_url && (
              <img
                src={business.logo_url}
                alt={`${business.name} logo`}
                className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg ml-4 flex-shrink-0"
              />
            )}
          </div>
          
          {business.description && (
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              {business.description}
            </p>
          )}
          
          {/* Mobile Contact Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
            {isAuthenticated ? (
              <>
                {business.phone && (
                  <Button
                    onClick={handlePhoneClick}
                    variant="outline"
                    className="w-full text-sm"
                    size="sm"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                )}
                {business.email && (
                  <Button
                    onClick={handleEmailClick}
                    variant="outline"
                    className="w-full text-sm"
                    size="sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                )}
              </>
            ) : (
              <Link to="/auth" className="col-span-full">
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  size="sm"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Sign in to view contact details
                </Button>
              </Link>
            )}
            {business.website && (
              <Button
                onClick={handleWebsiteClick}
                className="w-full bg-community-green hover:bg-green-600 text-sm"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Website
              </Button>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {allImages.length > 0 ? (
              <>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={allImages[selectedImageIndex]}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index ? 'border-community-green' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${business.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Desktop Business Info */}
          <div className="hidden lg:block space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                    {business.name}
                  </h1>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-community-green/10 text-community-green">
                      {business.business_categories?.name}
                    </Badge>
                    {business.is_verified && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Verified
                      </Badge>
                    )}
                    {business.featured && (
                      <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                {business.logo_url && (
                  <img
                    src={business.logo_url}
                    alt={`${business.name} logo`}
                    className="w-16 h-16 object-cover rounded-lg ml-4"
                  />
                )}
              </div>

              {business.description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {business.description}
                </p>
              )}
            </div>

            {/* Desktop Contact Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {isAuthenticated ? (
                <>
                  {business.phone && (
                    <Button
                      onClick={handlePhoneClick}
                      variant="outline"
                      className="w-full"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  )}
                  {business.email && (
                    <Button
                      onClick={handleEmailClick}
                      variant="outline"
                      className="w-full"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  )}
                </>
              ) : (
                <Link to="/auth" className="col-span-full">
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Sign in to view contact details
                  </Button>
                </Link>
              )}
              {business.website && (
                <Button
                  onClick={handleWebsiteClick}
                  className="w-full bg-community-green hover:bg-green-600"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Details Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-community-green" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(business.address_line1 || business.city || business.postcode) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-600">
                    {business.address_line1 && <div>{business.address_line1}</div>}
                    {business.address_line2 && <div>{business.address_line2}</div>}
                    <div>
                      {business.city && business.city}
                      {business.city && business.postcode && ', '}
                      {business.postcode && business.postcode}
                    </div>
                  </div>
                </div>
              )}

              {isAuthenticated ? (
                <>
                  {business.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <a
                        href={`tel:${business.phone}`}
                        className="text-community-green hover:text-green-600 transition-colors"
                      >
                        {business.phone}
                      </a>
                    </div>
                  )}

                  {business.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <a
                        href={`mailto:${business.email}`}
                        className="text-community-green hover:text-green-600 transition-colors"
                      >
                        {business.email}
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="text-gray-600">
                    <Link to="/auth" className="text-community-green hover:text-green-600 transition-colors">
                      Sign in to view contact details
                    </Link>
                  </div>
                </div>
              )}

              {business.website && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <a
                    href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-community-green hover:text-green-600 transition-colors"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-community-green" />
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              {business.opening_hours ? (
                <div className="space-y-2">
                  {Object.entries(business.opening_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize font-medium">{day}</span>
                      <span className="text-gray-600">{hours as string}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Opening hours not available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessDetail;