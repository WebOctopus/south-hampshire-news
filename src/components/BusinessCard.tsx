import { MapPin, Phone, Mail, ExternalLink, Star, Lock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BusinessCardProps {
  business: {
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
    biz_type?: string;
    business_categories?: {
      name: string;
      icon: string;
    };
  };
}

const BusinessCard = ({ business }: BusinessCardProps) => {
  const navigate = useNavigate();
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

  const handleCardClick = () => {
    navigate(`/business/${business.id}`);
  };

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (business.website) {
      window.open(business.website.startsWith('http') ? business.website : `https://${business.website}`, '_blank');
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (business.email) {
      window.open(`mailto:${business.email}`);
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (business.phone) {
      window.open(`tel:${business.phone}`);
    }
  };

  const handleAuthRequired = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/auth');
  };

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
              {business.name}
            </h3>
          </div>
          {business.logo_url && (
            <img
              src={business.logo_url}
              alt={`${business.name} logo`}
              className="w-12 h-12 object-cover rounded-lg ml-3 flex-shrink-0"
            />
          )}
        </div>
        
        {/* Category Badges */}
        {(business.business_categories?.name || business.biz_type) && (
          <div className="flex flex-wrap gap-2">
            {business.business_categories?.name && (
              <Badge variant="secondary" className="bg-community-green/10 text-community-green border-community-green/20">
                {business.business_categories.name}
              </Badge>
            )}
            {business.biz_type && (
              <Badge variant="outline" className="text-muted-foreground">
                {business.biz_type}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      {/* Featured Image */}
      {business.featured_image_url && (
        <div className="px-6 pb-3">
          <img
            src={business.featured_image_url}
            alt={`${business.name} featured image`}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <CardContent className="flex-1 space-y-3 pt-0">
        {/* Address */}
        {(business.address_line1 || business.city || business.postcode) && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="text-sm text-gray-600 truncate">
              {[business.address_line1, business.address_line2, business.city, business.postcode]
                .filter(Boolean)
                .join(', ')}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2">
          {isAuthenticated ? (
            <>
              {business.phone && (
                <button
                  onClick={handlePhoneClick}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-community-green transition-colors w-full text-left"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{business.phone}</span>
                </button>
              )}
              
              {business.email && (
                <button
                  onClick={handleEmailClick}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-community-green transition-colors w-full text-left"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{business.email}</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleAuthRequired}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-community-green transition-colors w-full text-left p-2 border border-gray-200 rounded-md bg-gray-50"
            >
              <Lock className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Sign in to view contact details</span>
            </button>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        {business.website && (
          <Button
            onClick={handleWebsiteClick}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Website
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BusinessCard;