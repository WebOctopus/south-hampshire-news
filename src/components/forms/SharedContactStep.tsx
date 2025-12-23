import { ContactDetails, JourneyType, getRequiredContactFields } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SharedContactStepProps {
  contact: ContactDetails;
  journeyType: JourneyType;
  onChange: (updates: Partial<ContactDetails>) => void;
  errors?: Partial<Record<keyof ContactDetails, string>>;
}

const SharedContactStep = ({ contact, journeyType, onChange, errors = {} }: SharedContactStepProps) => {
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-community-navy mb-2">
          Your Contact Details
        </h2>
        <p className="text-gray-600 text-sm">
          We'll use this information to get back to you
        </p>
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
        
        {journeyType === 'distributor' && (
          renderField('postcode', <MapPin className="h-4 w-4 text-gray-400" />, 'text', 'SO50 9DT')
        )}
        
        {(journeyType === 'advertising' || journeyType === 'think_advertising') && (
          renderField('company', <Building2 className="h-4 w-4 text-gray-400" />, 'text', 'Your Business Ltd')
        )}
      </div>
    </div>
  );
};

export default SharedContactStep;
