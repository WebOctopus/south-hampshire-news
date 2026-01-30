import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Building2, MapPin, Phone, Globe, Clock, Save, X, Share2, Image as ImageIcon } from 'lucide-react';
import { ImageDropzone } from '@/components/ui/image-dropzone';
import { useBusinessImageUpload } from '@/hooks/useBusinessImageUpload';

interface UserBusinessEditFormProps {
  business: any;
  onSave: () => void;
  onCancel: () => void;
}

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function UserBusinessEditForm({ business, onSave, onCancel }: UserBusinessEditFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const { uploadImage, isUploading } = useBusinessImageUpload();
  
  const [formData, setFormData] = useState({
    name: business?.name || '',
    description: business?.description || '',
    keywords: business?.keywords || '',
    category_id: business?.category_id || '',
    email: business?.email || '',
    phone: business?.phone || '',
    website: business?.website || '',
    address_line1: business?.address_line1 || '',
    address_line2: business?.address_line2 || '',
    city: business?.city || '',
    postcode: business?.postcode || '',
    logo_url: business?.logo_url || '',
    featured_image_url: business?.featured_image_url || '',
    // Social media
    facebook_url: business?.facebook_url || '',
    instagram_url: business?.instagram_url || '',
    twitter_url: business?.twitter_url || '',
    linkedin_url: business?.linkedin_url || '',
    tiktok_url: business?.tiktok_url || '',
    youtube_url: business?.youtube_url || '',
  });

  const [openingHours, setOpeningHours] = useState<Record<string, string>>(
    business?.opening_hours || {}
  );

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('business_categories')
        .select('*')
        .order('name');
      if (data) setCategories(data);
    };
    loadCategories();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day: string, value: string) => {
    setOpeningHours(prev => ({ ...prev, [day]: value }));
  };

  const handleLogoUpload = async (file: File): Promise<string | null> => {
    const url = await uploadImage(file, business.id, 'logo');
    if (url) {
      handleChange('logo_url', url);
    }
    return url;
  };

  const handleFeaturedUpload = async (file: File): Promise<string | null> => {
    const url = await uploadImage(file, business.id, 'featured');
    if (url) {
      handleChange('featured_image_url', url);
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        category_id: formData.category_id || null,
        opening_hours: openingHours,
      };

      const { error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', business.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your business listing has been updated."
      });
      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              placeholder="Tell customers about your business..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Directory Keywords</Label>
            <Textarea
              id="keywords"
              value={formData.keywords}
              onChange={(e) => handleChange('keywords', e.target.value)}
              placeholder="e.g., plumber, heating, boiler repair, emergency"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Add searchable keywords to help customers find your business
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://www.example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => handleChange('address_line1', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              value={formData.address_line2}
              onChange={(e) => handleChange('address_line2', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => handleChange('postcode', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5" />
            Images
          </CardTitle>
          <CardDescription>
            Drag and drop or click to upload your business logo and featured image.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageDropzone
              label="Logo"
              value={formData.logo_url}
              onUpload={handleLogoUpload}
              onClear={() => handleChange('logo_url', '')}
              aspectRatio="square"
              disabled={isUploading}
            />
            <ImageDropzone
              label="Featured Image"
              value={formData.featured_image_url}
              onUpload={handleFeaturedUpload}
              onClear={() => handleChange('featured_image_url', '')}
              aspectRatio="landscape"
              disabled={isUploading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5" />
            Social Media Links
          </CardTitle>
          <CardDescription>
            Add links to your social media profiles to help customers connect with you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook_url">Facebook</Label>
              <Input
                id="facebook_url"
                value={formData.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/yourbusiness"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram_url">Instagram</Label>
              <Input
                id="instagram_url"
                value={formData.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/yourbusiness"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_url">Twitter / X</Label>
              <Input
                id="twitter_url"
                value={formData.twitter_url}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                placeholder="https://x.com/yourbusiness"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) => handleChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/company/yourbusiness"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok_url">TikTok</Label>
              <Input
                id="tiktok_url"
                value={formData.tiktok_url}
                onChange={(e) => handleChange('tiktok_url', e.target.value)}
                placeholder="https://tiktok.com/@yourbusiness"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube</Label>
              <Input
                id="youtube_url"
                value={formData.youtube_url}
                onChange={(e) => handleChange('youtube_url', e.target.value)}
                placeholder="https://youtube.com/@yourbusiness"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Opening Hours
          </CardTitle>
          <CardDescription>
            Enter your opening hours for each day (e.g., "9:00 - 17:00" or "Closed").
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="flex items-center gap-2">
                <Label htmlFor={day} className="w-24 capitalize">{day}</Label>
                <Input
                  id={day}
                  value={openingHours[day] || ''}
                  onChange={(e) => handleHoursChange(day, e.target.value)}
                  placeholder="e.g., 9:00 - 17:00"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading || isUploading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
