import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { editionAreas } from '@/data/editionAreas';
import { useEventCategories, useEventTypes } from '@/hooks/useEventTaxonomies';
import { Calendar, Clock, MapPin, User, Mail, Phone, Link as LinkIcon, Upload, Image as ImageIcon, AlertCircle, Globe } from 'lucide-react';
import { useRef } from 'react';

export interface EventFormFieldsData {
  title: string;
  organizer: string;
  date: string;
  date_end: string;
  time: string;
  end_time: string;
  location: string;
  area: string;
  postcode: string;
  category: string;
  type: string;
  excerpt: string;
  full_description: string;
  ticket_url: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
}

interface EventFormFieldsProps {
  formData: EventFormFieldsData;
  onChange: (field: keyof EventFormFieldsData, value: string) => void;
  imagePreview: string | null;
  existingImageUrl?: string | null;
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
  showInfoBanner?: boolean;
  isOnBehalf?: boolean;
}

export function EventFormFields({
  formData,
  onChange,
  imagePreview,
  existingImageUrl,
  onImageChange,
  disabled = false,
  showInfoBanner = false,
  isOnBehalf = false,
}: EventFormFieldsProps) {
  const { items: eventCategories } = useEventCategories();
  const { items: eventTypes } = useEventTypes();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = imagePreview || existingImageUrl || null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onImageChange(file);
  };

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="e.g. Summer Music Festival"
              disabled={disabled}
              required
            />
          </div>
          <div>
            <Label htmlFor="organizer">Organiser *</Label>
            <Input
              id="organizer"
              value={formData.organizer}
              onChange={(e) => onChange('organizer', e.target.value)}
              placeholder="e.g. Local Community Group"
              disabled={disabled}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => onChange('category', value)}
                disabled={disabled}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => onChange('type', value)}
                disabled={disabled}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((t) => (
                    <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Date & Time
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Start Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => onChange('date', e.target.value)}
              disabled={disabled}
              required
            />
          </div>
          <div>
            <Label htmlFor="date_end">End Date (optional)</Label>
            <Input
              id="date_end"
              type="date"
              value={formData.date_end}
              onChange={(e) => onChange('date_end', e.target.value)}
              min={formData.date}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground mt-1">Leave blank for single-day events</p>
          </div>
          <div>
            <Label htmlFor="time">Start Time *</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => onChange('time', e.target.value)}
              disabled={disabled}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              type="time"
              value={formData.end_time}
              onChange={(e) => onChange('end_time', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Location
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="location">Venue / Address *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => onChange('location', e.target.value)}
              placeholder="e.g. Community Hall, 123 High Street"
              disabled={disabled}
              required
            />
          </div>
          <div>
            <Label htmlFor="area">Area / Town *</Label>
            <Select
              value={formData.area}
              onValueChange={(value) => onChange('area', value)}
              disabled={disabled}
            >
              <SelectTrigger id="area">
                <SelectValue placeholder="Select your area" />
              </SelectTrigger>
              <SelectContent>
                {editionAreas.map((area) => (
                  <SelectItem key={area.id} value={area.name}>
                    {area.name} ({area.postcodes})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              value={formData.postcode}
              onChange={(e) => onChange('postcode', e.target.value)}
              placeholder="e.g. RG40 1AA"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Description</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="excerpt">Short Description (max 200 characters)</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => onChange('excerpt', e.target.value.slice(0, 200))}
              placeholder="A brief summary of your event..."
              className="h-20"
              disabled={disabled}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.excerpt.length}/200 characters
            </p>
          </div>
          <div>
            <Label htmlFor="full_description">Full Description</Label>
            <Textarea
              id="full_description"
              value={formData.full_description}
              onChange={(e) => onChange('full_description', e.target.value)}
              placeholder="Tell people more about your event, what to expect, what to bring..."
              className="min-h-[150px]"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Event Image
        </h3>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${displayImage ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'}`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          {displayImage ? (
            <div className="space-y-4">
              <img
                src={displayImage}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg object-cover"
              />
              <p className="text-sm text-muted-foreground">
                Click to change image
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload an image</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG or WEBP (max 5MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact & Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Contact & Links
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_email">
              Contact Email {isOnBehalf && <span className="text-destructive">* (organiser login)</span>}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => onChange('contact_email', e.target.value)}
                placeholder="events@example.com"
                className="pl-10"
                disabled={disabled}
                required={isOnBehalf}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => onChange('contact_phone', e.target.value)}
                placeholder="01234 567890"
                className="pl-10"
                disabled={disabled}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="website_url">Website Address</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => onChange('website_url', e.target.value)}
                placeholder="https://www.example.com"
                className="pl-10"
                disabled={disabled}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="ticket_url">Ticket / Booking URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="ticket_url"
                type="url"
                value={formData.ticket_url}
                onChange={(e) => onChange('ticket_url', e.target.value)}
                placeholder="https://tickets.example.com/event"
                className="pl-10"
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {showInfoBanner && (
        <div className="bg-muted/50 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Review Process</p>
            <p className="text-muted-foreground">
              All events are reviewed before being published. This usually takes 1-2 business days.
              We'll notify you once your event is live.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const defaultEventFormFieldsData: EventFormFieldsData = {
  title: '',
  organizer: '',
  date: '',
  date_end: '',
  time: '',
  end_time: '',
  location: '',
  area: '',
  postcode: '',
  category: '',
  type: '',
  excerpt: '',
  full_description: '',
  ticket_url: '',
  contact_email: '',
  contact_phone: '',
  website_url: '',
};