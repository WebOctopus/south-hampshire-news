import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, MapPin, Phone, Globe, Settings, Share2, Image as ImageIcon } from 'lucide-react';
import { ImageDropzone } from '@/components/ui/image-dropzone';
import { useBusinessImageUpload } from '@/hooks/useBusinessImageUpload';

interface BusinessEditFormProps {
  business: any;
  onClose: () => void;
  onSave: () => void;
}

export function BusinessEditForm({ business, onClose, onSave }: BusinessEditFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const { uploadImage, isUploading } = useBusinessImageUpload();
  
  const [formData, setFormData] = useState({
    name: business?.name || '',
    description: business?.description || '',
    biz_type: business?.biz_type || '',
    sector: business?.sector || '',
    category_id: business?.category_id || '',
    email: business?.email || '',
    phone: business?.phone || '',
    website: business?.website || '',
    address_line1: business?.address_line1 || '',
    address_line2: business?.address_line2 || '',
    city: business?.city || '',
    postcode: business?.postcode || '',
    edition_area: business?.edition_area || '',
    logo_url: business?.logo_url || '',
    featured_image_url: business?.featured_image_url || '',
    is_active: business?.is_active ?? true,
    is_verified: business?.is_verified ?? false,
    featured: business?.featured ?? false,
    owner_id: business?.owner_id || '',
    // Social media
    facebook_url: business?.facebook_url || '',
    instagram_url: business?.instagram_url || '',
    twitter_url: business?.twitter_url || '',
    linkedin_url: business?.linkedin_url || '',
    tiktok_url: business?.tiktok_url || '',
    youtube_url: business?.youtube_url || '',
  });

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

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        owner_id: formData.owner_id || null,
        category_id: formData.category_id || null,
      };

      const { error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', business.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business updated successfully."
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
    <div className="flex flex-col h-full max-h-[80vh]">
      <DialogHeader className="pb-4">
        <DialogTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Edit Business: {business?.name}
        </DialogTitle>
        <DialogDescription>
          Update all business information. Changes are saved immediately.
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="flex-1 pr-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Basic Information
            </h3>
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
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="biz_type">Business Type (from CSV)</Label>
                <Input
                  id="biz_type"
                  value={formData.biz_type}
                  onChange={(e) => handleChange('biz_type', e.target.value)}
                  placeholder="e.g., HPR PLUMBER"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => handleChange('sector', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" /> Contact Information
            </h3>
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
                placeholder="https://"
              />
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Address
            </h3>
            <div className="grid grid-cols-1 gap-4">
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="edition_area">Edition Area</Label>
                <Input
                  id="edition_area"
                  value={formData.edition_area}
                  onChange={(e) => handleChange('edition_area', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Images
            </h3>
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
          </div>

          <Separator />

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Social Media Links
            </h3>
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
          </div>

          <Separator />

          {/* Admin Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" /> Admin Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange('is_active', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_verified">Verified</Label>
                <Switch
                  id="is_verified"
                  checked={formData.is_verified}
                  onCheckedChange={(checked) => handleChange('is_verified', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleChange('featured', checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_id">Owner User ID</Label>
              <Input
                id="owner_id"
                value={formData.owner_id}
                onChange={(e) => handleChange('owner_id', e.target.value)}
                placeholder="Enter user UUID to assign ownership"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for unclaimed businesses. Enter a user UUID to assign ownership.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-background">
            <Button type="submit" disabled={loading || isUploading} className="flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
}
