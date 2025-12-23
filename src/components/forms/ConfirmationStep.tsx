import { JourneyType, Consents } from './types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Mail, Lightbulb, PenLine, Megaphone, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationStepProps {
  journeyType: JourneyType;
  consents: Consents;
  onConsentChange: (updates: Partial<Consents>) => void;
  isSubmitted: boolean;
}

const getJourneyInfo = (journeyType: JourneyType) => {
  switch (journeyType) {
    case 'editorial':
      return { 
        icon: PenLine, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        title: 'Story Submission',
        successTitle: 'Story Submitted!',
        successMessage: 'Thank you for sharing your story with us. Our editorial team will review your submission and get back to you within 5-7 working days. Keep an eye on your inbox for updates!'
      };
    case 'advertising':
      return { 
        icon: Megaphone, 
        color: 'text-community-green',
        bgColor: 'bg-community-green/20',
        title: 'Advertising Quote Request',
        successTitle: 'Quote Request Received!',
        successMessage: 'Thanks for your interest in advertising with Discover. A member of our sales team will contact you within 24 hours to discuss your advertising options and provide a tailored quote.'
      };
    case 'discover_extra':
      return { 
        icon: Mail, 
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        title: 'Discover EXTRA Subscription',
        successTitle: 'Welcome to Discover EXTRA!',
        successMessage: 'You\'re now subscribed to our exclusive digital newsletter. Check your inbox for a confirmation email – your first edition will arrive soon with local news, offers, and community updates.'
      };
    case 'think_advertising':
      return { 
        icon: Lightbulb, 
        color: 'text-rose-600',
        bgColor: 'bg-rose-100',
        title: 'THINK Advertising Subscription',
        successTitle: 'Welcome to THINK!',
        successMessage: 'You\'re now subscribed to THINK, our monthly marketing insights newsletter. Expect expert tips, advertising trends, and success stories delivered straight to your inbox.'
      };
    case 'distributor':
      return { 
        icon: Truck, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        title: 'Distributor Application',
        successTitle: 'Application Received!',
        successMessage: 'Thank you for applying to become a Discover distributor. Our distribution team will review your application and contact you within 3-5 working days to discuss next steps.'
      };
    default:
      return { 
        icon: CheckCircle2, 
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        title: 'Form Submission',
        successTitle: 'Thank You!',
        successMessage: 'Your submission has been received. We\'ll be in touch soon.'
      };
  }
};

const ConfirmationStep = ({ journeyType, consents, onConsentChange, isSubmitted }: ConfirmationStepProps) => {
  const journeyInfo = getJourneyInfo(journeyType);
  const Icon = journeyInfo.icon;

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className={cn(
          "inline-flex items-center justify-center w-20 h-20 rounded-full mb-6",
          journeyInfo.bgColor
        )}>
          <CheckCircle2 className={cn("h-10 w-10", journeyInfo.color)} />
        </div>
        <h2 className="text-2xl font-heading font-bold text-community-navy mb-4">
          {journeyInfo.successTitle}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          {journeyInfo.successMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className={cn(
          "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
          journeyInfo.bgColor
        )}>
          <Icon className={cn("h-8 w-8", journeyInfo.color)} />
        </div>
        <h2 className="text-2xl font-heading font-bold text-community-navy mb-2">
          Almost There!
        </h2>
        <p className="text-gray-600 text-sm">
          Please review and confirm the following
        </p>
      </div>

      <div className="space-y-4 bg-gray-50 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={consents.terms_accepted}
            onCheckedChange={(checked) => onConsentChange({ terms_accepted: checked === true })}
            className="mt-0.5"
          />
          <div className="text-sm">
            <span className="text-gray-700">
              I agree to the{' '}
              <a href="/terms" className="text-community-green hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-community-green hover:underline">Privacy Policy</a>
            </span>
            <span className="text-destructive ml-1">*</span>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={consents.privacy_accepted}
            onCheckedChange={(checked) => onConsentChange({ privacy_accepted: checked === true })}
            className="mt-0.5"
          />
          <div className="text-sm text-gray-700">
            I understand my data will be processed as described in the Privacy Policy
            <span className="text-destructive ml-1">*</span>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={consents.marketing_email}
            onCheckedChange={(checked) => onConsentChange({ marketing_email: checked === true })}
            className="mt-0.5"
          />
          <div className="text-sm text-gray-700">
            I'd like to receive occasional updates and news from Discover
            <span className="text-gray-400 ml-1">(optional)</span>
          </div>
        </label>
      </div>

      <p className="text-xs text-gray-500 text-center">
        By submitting this form, you confirm that the information provided is accurate.
      </p>
    </div>
  );
};

export default ConfirmationStep;
