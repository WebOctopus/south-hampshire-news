import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdvertiserStatusBannerProps {
  status: 'active' | 'lapsed' | 'none';
}

const AdvertiserStatusBanner = ({ status }: AdvertiserStatusBannerProps) => {
  const navigate = useNavigate();

  if (status === 'none') return null;

  if (status === 'active') {
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900 dark:text-green-100">
          You're an active advertiser — full access to upcoming editions, artwork uploads, and tools.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between gap-4 text-amber-900 dark:text-amber-100">
        <span>
          Welcome back. Your account is currently inactive — past bookings and vouchers are still available.
        </span>
        <Button
          size="sm"
          variant="outline"
          className="border-amber-300 hover:bg-amber-100"
          onClick={() => navigate('/advertising')}
        >
          Book again →
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default AdvertiserStatusBanner;
