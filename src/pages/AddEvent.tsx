import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { EVENT_CATEGORIES, EVENT_TYPES } from '@/hooks/useEvents';
import { Calendar, Clock, MapPin, User, Mail, Phone, Link as LinkIcon, Upload, Image, CheckCircle, AlertCircle } from 'lucide-react';

const AddEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    date: '',
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
    contact_phone: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.date || !formData.time || !formData.location || 
        !formData.area || !formData.category || !formData.type || !formData.organizer) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;
      
      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          toast({
            title: "Image upload failed",
            description: "Your event will be submitted without an image",
            variant: "destructive"
          });
        }
      }

      // Prepare event data
      const eventData = {
        title: formData.title,
        description: formData.excerpt || null,
        excerpt: formData.excerpt || null,
        full_description: formData.full_description || null,
        date: formData.date,
        time: formData.time,
        end_time: formData.end_time || null,
        location: formData.location,
        area: formData.area,
        postcode: formData.postcode || null,
        category: formData.category,
        type: formData.type,
        organizer: formData.organizer,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        ticket_url: formData.ticket_url || null,
        image: imageUrl,
        is_published: false, // Pending admin approval
        featured: false,
        links: []
      };

      const { error } = await supabase
        .from('events')
        .insert([eventData] as any);

      if (error) throw error;

      setSubmitSuccess(true);
      
      toast({
        title: "Event Submitted!",
        description: "Your event has been submitted for review. It will appear once approved by an admin."
      });

    } catch (error: any) {
      console.error('Error submitting event:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error submitting your event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="text-center">
              <CardContent className="pt-12 pb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-heading font-bold mb-4">Event Submitted Successfully!</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Thank you for submitting your event. Our team will review it and once approved, 
                  it will be visible on the What's On page.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate('/whats-on')}>
                    View What's On
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSubmitSuccess(false);
                    setFormData({
                      title: '', organizer: '', date: '', time: '', end_time: '',
                      location: '', area: '', postcode: '', category: '', type: '',
                      excerpt: '', full_description: '', ticket_url: '', contact_email: '', contact_phone: ''
                    });
                    setImageFile(null);
                    setImagePreview(null);
                  }}>
                    Submit Another Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-heading font-bold mb-4">
              Add Your Event
            </h1>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
              Share your local event with the community. Once submitted, your event will be reviewed 
              and published by our team.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Fields marked with * are required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
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
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g. Summer Music Festival"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="organizer">Organizer *</Label>
                      <Input
                        id="organizer"
                        value={formData.organizer}
                        onChange={(e) => handleInputChange('organizer', e.target.value)}
                        placeholder="e.g. Local Community Group"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => handleInputChange('category', value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {EVENT_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="type">Type *</Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value) => handleInputChange('type', value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {EVENT_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Start Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => handleInputChange('end_time', e.target.value)}
                        disabled={isSubmitting}
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
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g. Community Hall, 123 High Street"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="area">Area / Town *</Label>
                      <Input
                        id="area"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        placeholder="e.g. Wokingham"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postcode">Postcode</Label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                        placeholder="e.g. RG40 1AA"
                        disabled={isSubmitting}
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
                        onChange={(e) => handleInputChange('excerpt', e.target.value.slice(0, 200))}
                        placeholder="A brief summary of your event..."
                        className="h-20"
                        disabled={isSubmitting}
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
                        onChange={(e) => handleInputChange('full_description', e.target.value)}
                        placeholder="Tell people more about your event, what to expect, what to bring..."
                        className="min-h-[150px]"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    Event Image
                  </h3>
                  
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${imagePreview ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
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
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => handleInputChange('contact_email', e.target.value)}
                          placeholder="events@example.com"
                          className="pl-10"
                          disabled={isSubmitting}
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
                          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                          placeholder="01onal 123456"
                          className="pl-10"
                          disabled={isSubmitting}
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
                          onChange={(e) => handleInputChange('ticket_url', e.target.value)}
                          placeholder="https://tickets.example.com/event"
                          className="pl-10"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Banner */}
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

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/whats-on')}
                    className="sm:flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="sm:flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Event for Review'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddEvent;
