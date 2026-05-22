import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ImageIcon, Info, Plus } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BusinessClaimButton } from '@/components/BusinessClaimButton';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessDetailHero } from '@/components/directory/BusinessDetailHero';
import { MeetTheOwnerCard } from '@/components/directory/MeetTheOwnerCard';
import { OpeningHoursCard } from '@/components/directory/OpeningHoursCard';
import { BusinessDetailsCard } from '@/components/directory/BusinessDetailsCard';

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

  // Gallery: show actual images + empty placeholder slots up to multiple of 3 (min 6 when owner can manage)
  const minTiles = canManage ? 6 : Math.max(3, allImages.length);
  const gallerySlots = Array.from({ length: Math.max(minTiles, allImages.length) }, (_, i) => allImages[i] ?? null);

  return (
    <div className="min-h-screen bg-[hsl(180_20%_97%)]">
      <Navigation />

      <div className="bg-background border-b border-community-teal/15 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-1.5">
          <Link to="/business-directory" className="text-community-purple hover:underline">
            Directory
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate">{business.name}</span>
        </div>
      </div>

      <BusinessDetailHero business={business} />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="relative">
          <div className={!business.is_verified ? 'opacity-60 pointer-events-none select-none' : ''}>
            <div className="grid lg:grid-cols-3 gap-4 lg:gap-[18px]">
              {/* Left column (2/3) */}
              <div className="lg:col-span-2 space-y-[14px]">
                {business.description && (
                  <div className="bg-card border border-community-teal/25 rounded-xl p-5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1px] text-muted-foreground mb-3">
                      <Info className="h-3.5 w-3.5 text-community-teal" /> About
                    </div>
                    <p className="text-[13px] text-foreground/75 leading-[1.7] whitespace-pre-line">
                      {business.description}
                    </p>
                  </div>
                )}

                {/* Gallery */}
                <section>
                  <h2 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1px] text-muted-foreground mb-3">
                    <ImageIcon className="h-3.5 w-3.5 text-community-teal" /> Gallery
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {gallerySlots.map((src, i) =>
                      src ? (
                        <div
                          key={i}
                          className="aspect-[4/3] rounded-[10px] overflow-hidden bg-card border border-community-teal/25"
                        >
                          <img
                            src={src}
                            alt={`${business.name} ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : canManage ? (
                        <button
                          key={i}
                          type="button"
                          className="aspect-[4/3] rounded-[10px] bg-card border border-dashed border-community-teal/40 flex flex-col items-center justify-center gap-1.5 text-community-teal/70 hover:border-community-teal/70 transition-colors"
                        >
                          <Plus className="h-5 w-5" />
                          <span className="text-[11px] text-muted-foreground">Add photo</span>
                        </button>
                      ) : (
                        <div
                          key={i}
                          className="aspect-[4/3] rounded-[10px] bg-card border border-community-teal/25 flex flex-col items-center justify-center gap-1.5 text-community-teal/40"
                        >
                          <ImageIcon className="h-6 w-6" />
                          <span className="text-[11px] text-muted-foreground">Photo {i + 1}</span>
                        </div>
                      )
                    )}
                  </div>
                </section>

                <MeetTheOwnerCard
                  ownerName={business.owner_name}
                  ownerRole={business.owner_role}
                  ownerPhotoUrl={business.owner_photo_url}
                  ownerQuote={business.owner_quote}
                />
              </div>

              {/* Right column (1/3) */}
              <div className="space-y-[14px]">
                <BusinessDetailsCard business={business} />
                <OpeningHoursCard openingHours={business.opening_hours} />
              </div>
            </div>

          </div>

        </div>

        {!business.is_verified && (
          <div className="mt-8 flex justify-center">
            <div className="max-w-md w-full bg-card border-2 border-community-teal/40 rounded-2xl p-6 md:p-8 shadow-xl text-center">
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

        <Link
          to="/business-directory"
          className="inline-flex items-center text-community-purple hover:underline mt-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
        </Link>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessDetail;