import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Smartphone, Globe, Mail, ImageIcon, Info, Plus } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BusinessClaimButton } from '@/components/BusinessClaimButton';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessDetailHero } from '@/components/directory/BusinessDetailHero';
import { MeetTheOwnerCard } from '@/components/directory/MeetTheOwnerCard';
import { OpeningHoursCard } from '@/components/directory/OpeningHoursCard';
import { UnverifiedOverlay } from '@/components/directory/UnverifiedOverlay';

interface Business {
  id: string;
  name: string;
  description: string;
  category_id: string;
  email?: string;
  phone?: string;
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
  owner_id: string | null;
  owner_name?: string | null;
  owner_role?: string | null;
  owner_photo_url?: string | null;
  owner_quote?: string | null;
  advertises_in_discover?: boolean | null;
  business_categories: {
    name: string;
    icon: string;
  };
}

const BusinessDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (slug) {
      fetchBusiness();
    }
  }, [slug]);

  const fetchBusiness = async () => {
    const { data, error } = await supabase.rpc('get_business_detail_by_slug', {
      business_slug: slug as string
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
  const isOwner = !!user && user.id === business.owner_id;
  const canManage = isOwner || isAdmin;
  const websiteHost = business.website
    ? (() => {
        try {
          return new URL(business.website.startsWith('http') ? business.website : `https://${business.website}`).hostname.replace(/^www\./, '');
        } catch {
          return business.website;
        }
      })()
    : null;
  const address = [business.address_line1, business.address_line2, business.city, business.postcode]
    .filter(Boolean)
    .join(', ');

  // Gallery: show actual images + empty placeholder slots up to multiple of 3 (min 6 when owner can manage)
  const minTiles = canManage ? 6 : Math.max(3, allImages.length);
  const gallerySlots = Array.from({ length: Math.max(minTiles, allImages.length) }, (_, i) => allImages[i] ?? null);

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Link to="/business-directory" className="inline-flex items-center text-community-green hover:text-green-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Link>

        <BusinessDetailHero business={business} />

        <div className="relative">
          <div className={!business.is_verified ? 'opacity-60 pointer-events-none select-none' : ''}>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left column (2/3) */}
              <div className="lg:col-span-2 space-y-6">
                {business.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        <Info className="h-4 w-4" /> About
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                        {business.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <MeetTheOwnerCard
                  ownerName={business.owner_name}
                  ownerRole={business.owner_role}
                  ownerPhotoUrl={business.owner_photo_url}
                  ownerQuote={business.owner_quote}
                />
              </div>

              {/* Right column (1/3) */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      <Info className="h-4 w-4" /> Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {business.phone && (
                      <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-community-green hover:underline">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{business.phone}</span>
                      </a>
                    )}
                    {business.phone && (
                      <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-community-green hover:underline">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span>{business.phone}</span>
                      </a>
                    )}
                    {websiteHost && (
                      <a
                        href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-community-green hover:underline"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{websiteHost}</span>
                      </a>
                    )}
                    {business.email && (
                      <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-community-green hover:underline">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{business.email}</span>
                      </a>
                    )}
                    {address && (
                      <div className="flex items-start gap-3 text-foreground/80">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span>
                          {business.address_line1 && <span className="block">{business.address_line1}</span>}
                          {business.address_line2 && <span className="block">{business.address_line2}</span>}
                          <span className="block">
                            {[business.city, business.postcode].filter(Boolean).join(', ')}
                          </span>
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <OpeningHoursCard openingHours={business.opening_hours} />
              </div>
            </div>

            {/* Gallery */}
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                <ImageIcon className="h-4 w-4" /> Gallery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallerySlots.map((src, i) =>
                  src ? (
                    <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-muted border">
                      <img src={src} alt={`${business.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ) : canManage ? (
                    <button
                      key={i}
                      type="button"
                      className="aspect-[4/3] rounded-xl bg-muted/40 border border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted transition"
                    >
                      <Plus className="h-6 w-6 mb-1" />
                      <span className="text-sm">Add photo</span>
                    </button>
                  ) : (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-xl bg-muted/40 border flex flex-col items-center justify-center text-muted-foreground"
                    >
                      <ImageIcon className="h-6 w-6 mb-1" />
                      <span className="text-sm">Photo {i + 1}</span>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>

          {!business.is_verified && (
            <div className="absolute inset-0 flex items-start justify-center pt-24 z-10">
              <div className="max-w-md w-full mx-4 bg-card border-2 border-community-green/30 rounded-2xl p-6 md:p-8 shadow-xl text-center">
                <h3 className="font-heading text-xl md:text-2xl mb-2">
                  Apply to verify this business
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Claim and verify this listing to receive a <strong>£100 voucher code</strong> to advertise in Discover Magazine.
                </p>
                <BusinessClaimButton
                  businessId={business.id}
                  businessName={business.name}
                  ownerId={business.owner_id}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessDetail;