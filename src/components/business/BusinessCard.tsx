import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

interface Business {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postcode: string;
  logo_url: string;
  is_verified: boolean;
  featured: boolean;
  business_categories: BusinessCategory;
}

interface BusinessCardProps {
  business: Business;
}

const BusinessCard = ({ business }: BusinessCardProps) => (
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <CardTitle className="text-xl flex items-center gap-2">
            {business.name}
            {business.is_verified && (
              <Badge variant="secondary" className="text-xs">
                ✓ Verified
              </Badge>
            )}
            {business.featured && (
              <Badge className="bg-community-green text-xs">
                Featured
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {business.business_categories?.name}
          </p>
        </div>
        {business.logo_url && (
          <img 
            src={business.logo_url} 
            alt={`${business.name} logo`}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-gray-700 mb-4">{business.description}</p>
      
      <div className="space-y-2 text-sm">
        {business.address_line1 && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} />
            <span>
              {business.address_line1}
              {business.address_line2 && `, ${business.address_line2}`}
              {business.city && `, ${business.city}`}
              {business.postcode && ` ${business.postcode}`}
            </span>
          </div>
        )}
        
        {business.phone && (
          <div className="text-gray-600">
            <strong>Phone:</strong> {business.phone}
          </div>
        )}
        
        {business.email && (
          <div className="text-gray-600">
            <strong>Email:</strong> {business.email}
          </div>
        )}
        
        {business.website && (
          <div className="text-gray-600">
            <strong>Website:</strong> 
            <a 
              href={business.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-community-green hover:underline ml-1"
            >
              {business.website}
            </a>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex gap-2">
        <Button size="sm" className="bg-community-green hover:bg-green-600">
          View Details
        </Button>
        {business.phone && (
          <Button variant="outline" size="sm">
            Call Now
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

export default BusinessCard;