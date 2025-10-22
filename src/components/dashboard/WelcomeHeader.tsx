import { User } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, MapPin, Calendar } from 'lucide-react';
import { formatPrice } from '@/lib/pricingCalculator';

interface WelcomeHeaderProps {
  user: User | null;
  quotes: any[];
  bookings?: any[];
}

export default function WelcomeHeader({ user, quotes, bookings = [] }: WelcomeHeaderProps) {
  // TEMPORARY: Preview mode - same as in BookingCard
  const PREVIEW_AS_PAID = true;
  
  const hasPaidBookings = PREVIEW_AS_PAID 
    ? bookings.length > 0 
    : bookings.some(b => b.payment_status === 'paid' || b.payment_status === 'subscription_active' || b.payment_status === 'mandate_active');
  
  const totalReach = quotes.reduce((sum, quote) => sum + (quote.total_circulation || 0), 0);
  const totalInvestment = quotes.reduce((sum, quote) => sum + (quote.final_total || 0), 0);
  const activeQuotes = quotes.filter(quote => quote.pricing_model).length;

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Friend';

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-heading font-bold mb-2">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="text-xl text-muted-foreground mb-4">
          {hasPaidBookings 
            ? "Your advertising campaigns are now active and reaching your target audience!"
            : `You're one step away from reaching ${totalReach.toLocaleString()} homes in your area!`
          }
        </p>
        {!hasPaidBookings && (
          <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg">
            Book Your Campaign Today
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saved Quotes</p>
                <p className="text-2xl font-bold">{activeQuotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potential Reach</p>
                <p className="text-2xl font-bold">{totalReach.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Investment Ready</p>
                <p className="text-2xl font-bold">{formatPrice(totalInvestment)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated ROI</p>
                <p className="text-2xl font-bold">300%+</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}