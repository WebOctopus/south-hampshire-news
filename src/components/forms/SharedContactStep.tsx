import { ContactDetails, JourneyType, Consents, getRequiredContactFields } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SharedContactStepProps {
  contact: ContactDetails;
  journeyType: JourneyType;
  onChange: (updates: Partial<ContactDetails>) => void;
  errors?: Partial<Record<keyof ContactDetails, string>>;
  consents?: Consents;
  onConsentsChange?: (updates: Partial<Consents>) => void;
}

const SharedContactStep = ({ contact, journeyType, onChange, errors = {}, consents, onConsentsChange }: SharedContactStepProps) => {
  const requiredFields = getRequiredContactFields(journeyType);
  
  const isRequired = (field: keyof ContactDetails) => requiredFields.includes(field);
  
  const getFieldLabel = (field: keyof ContactDetails): string => {
    const labels: Record<keyof ContactDetails, string> = {
      first_name: 'First Name',
      last_name: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      postcode: 'Postcode',
      company: 'Company/Business Name'
    };
    return labels[field];
  };

  const renderField = (
    field: keyof ContactDetails,
    icon: React.ReactNode,
    type: string = 'text',
    placeholder: string = ''
  ) => {
    const required = isRequired(field);
    const hasError = !!errors[field];
    
    return (
      <div className="space-y-2">
        <Label 
          htmlFor={field} 
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          {icon}
          {getFieldLabel(field)}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={field}
          type={type}
          value={contact[field]}
          onChange={(e) => onChange({ [field]: e.target.value })}
          placeholder={placeholder}
          required={required}
          className={cn(
            "transition-colors",
            hasError && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {hasError && (
          <p className="text-sm text-destructive">{errors[field]}</p>
        )}
      </div>
    );
  };

  const getIntroText = () => {
    if (journeyType === 'discover_extra') {
      return (
        <p className="text-sm text-muted-foreground mb-6">
          We usually send one email a month, occasionally two if there is a special event, announcement or offer to share. By adding your postcode we know which edition of Discover you receive (one of 14 local editions) and can tailor the e-newsletter to you. You can unsubscribe at any time.
        </p>
      );
    }
    return (
      <p className="text-gray-600 text-sm">
        We'll use this information to get back to you
      </p>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-community-navy mb-2">
          Your Contact Details
        </h2>
        {getIntroText()}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {renderField('first_name', <User className="h-4 w-4 text-gray-400" />, 'text', 'John')}
        {renderField('last_name', <User className="h-4 w-4 text-gray-400" />, 'text', 'Smith')}
      </div>

      <div className="space-y-4">
        {renderField('email', <Mail className="h-4 w-4 text-gray-400" />, 'email', 'john@example.com')}
        
        {(journeyType === 'editorial' || journeyType === 'advertising' || journeyType === 'distributor') && (
          renderField('phone', <Phone className="h-4 w-4 text-gray-400" />, 'tel', '07700 900000')
        )}
        
        {(journeyType === 'distributor' || journeyType === 'discover_extra') && (
          renderField('postcode', <MapPin className="h-4 w-4 text-gray-400" />, 'text', 'SO50 9DT')
        )}
        
        {(journeyType === 'advertising' || journeyType === 'think_advertising') && (
          renderField('company', <Building2 className="h-4 w-4 text-gray-400" />, 'text', 'Your Business Ltd')
        )}
      </div>

      {/* Discover Extra consent checkbox */}
      {journeyType === 'discover_extra' && consents && onConsentsChange && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-start gap-3">
            <Checkbox
              id="discover_extra_consent"
              checked={consents.discover_extra}
              onCheckedChange={(checked) => onConsentsChange({ discover_extra: !!checked })}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label 
                htmlFor="discover_extra_consent" 
                className="text-sm font-medium cursor-pointer"
              >
                Yes, I'd like to receive Discover EXTRA emails <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Get exclusive content, competitions, and local news delivered to your inbox.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedContactStep;
