import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ArtworkUploadSection } from './ArtworkUploadSection';

const ArtworkUploadTab = () => {
  const { user } = useAuth();

  // Fetch paid bookings for the current user
  const { data: paidBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['paid-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .in('payment_status', ['paid', 'confirmed', 'payment_pending'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch ad sizes for all bookings
  const adSizeIds = [...new Set(paidBookings.map((b: any) => b.ad_size_id).filter(Boolean))];
  const { data: adSizes = [] } = useQuery({
    queryKey: ['ad-sizes-for-artwork', adSizeIds],
    queryFn: async () => {
      if (adSizeIds.length === 0) return [];
      const { data, error } = await supabase
        .from('ad_sizes')
        .select('*')
        .in('id', adSizeIds);
      if (error) throw error;
      return data || [];
    },
    enabled: adSizeIds.length > 0,
  });

  const getAdSize = (adSizeId: string | null) => {
    if (!adSizeId) return null;
    return adSizes.find((s: any) => s.id === adSizeId) || null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (bookingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (paidBookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Artwork Required</h3>
          <p className="text-muted-foreground max-w-md">
            Once you have a confirmed booking with payment, you'll be able to upload your artwork here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          Artwork Upload
        </h2>
        <p className="text-muted-foreground mt-1">
          Upload your print-ready artwork for each confirmed booking below.
        </p>
      </div>

      {paidBookings.map((booking: any) => {
        const adSize = getAdSize(booking.ad_size_id);
        return (
          <Card key={booking.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-base flex items-center justify-between">
                <span>
                  Booking: {booking.title || booking.pricing_model} — {formatDate(booking.created_at)}
                </span>
                <Badge variant="outline" className="capitalize">
                  {booking.payment_status}
                </Badge>
              </CardTitle>
              {adSize && (
                <p className="text-sm text-muted-foreground">
                  Ad Size: <span className="font-medium">{adSize.name}</span> ({adSize.dimensions})
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              <ArtworkUploadSection booking={booking} adSize={adSize} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ArtworkUploadTab;
