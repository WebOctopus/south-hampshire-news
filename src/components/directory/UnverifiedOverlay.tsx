import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UnverifiedOverlay({ onClaim }: { onClaim: () => void }) {
  return (
    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-10 rounded-2xl">
      <div className="max-w-md text-center bg-card border-2 border-community-green/30 rounded-2xl p-6 md:p-8 shadow-xl">
        <ShieldCheck className="h-10 w-10 text-community-green mx-auto mb-3" />
        <h3 className="font-heading text-xl md:text-2xl mb-2">Apply to verify this business</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Claim and verify this listing to receive a <strong>£100 voucher code</strong> to advertise in Discover Magazine.
        </p>
        <Button onClick={onClaim} className="bg-community-green hover:bg-community-green/90">
          Apply to verify
        </Button>
      </div>
    </div>
  );
}