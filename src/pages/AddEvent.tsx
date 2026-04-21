import { useState, useRef, useEffect } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { EventFormFields, defaultEventFormFieldsData, type EventFormFieldsData } from '@/components/events/EventFormFields';

const AddEvent = () => {
  const { isAdmin } = useAuth();
  const [isOnBehalf, setIsOnBehalf] = useState(false);
  const [formData, setFormData] = useState<EventFormFieldsData>(defaultEventFormFieldsData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Spam protection state
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAtRef = useRef<number>(Date.now());
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  // Fetch Turnstile site key on mount (only needed for non-admin public submissions)
  useEffect(() => {
    if (isAdmin) return;
    formLoadedAtRef.current = Date.now();
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('submit-event', {
          method: 'GET' as never,
        });
        if (error) throw error;
        if (data?.siteKey) setTurnstileSiteKey(data.siteKey);
      } catch (err) {
        // Fallback: try a direct GET in case invoke doesn't surface GETs
        try {
          const url = `https://qajegkbvbpekdggtrupv.supabase.co/functions/v1/submit-event`;
          const res = await fetch(url, {
            headers: {
              apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhamVna2J2YnBla2RnZ3RydXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjM1NjEsImV4cCI6MjA2NDY5OTU2MX0.pYwQldpBjowrqBL_rwyBipOU5SkEAytfJLBzmLPGuBQ',
            },
          });
          const json = await res.json();
          if (json?.siteKey) setTurnstileSiteKey(json.siteKey);
        } catch (e) {
          console.error('Failed to load Turnstile config:', e);
        }
      }
    })();
  }, [isAdmin]);

  const handleInputChange = (field: keyof EventFormFieldsData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
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
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
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

    // On-behalf requires contact email
    if (isOnBehalf && !formData.contact_email) {
      toast({
        title: "Organiser email required",
        description: "Please enter the organiser's email address so we can send them login details.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user (optional - events can be submitted anonymously)
      const { data: { user } } = await supabase.auth.getUser();
      
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

      // ============================================================
      // PUBLIC (non-admin) PATH — route through validated edge function
      // ============================================================
      if (!isAdmin) {
        if (!turnstileToken) {
          toast({
            title: "Please complete the captcha",
            description: "We use a quick check to keep spam out.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const { data: result, error: fnError } = await supabase.functions.invoke('submit-event', {
          body: {
            title: formData.title,
            organizer: formData.organizer,
            date: formData.date,
            date_end: formData.date_end || null,
            time: formData.time,
            end_time: formData.end_time || null,
            location: formData.location,
            area: formData.area,
            postcode: formData.postcode || null,
            category: formData.category,
            type: formData.type,
            excerpt: formData.excerpt || null,
            full_description: formData.full_description || null,
            ticket_url: formData.ticket_url || null,
            contact_email: formData.contact_email || null,
            contact_phone: formData.contact_phone || null,
            website_url: formData.website_url || null,
            image: imageUrl,
            turnstileToken,
            honeypot,
            formLoadedAt: formLoadedAtRef.current,
          },
        });

        if (fnError || (result && (result as any).error)) {
          const message = (result as any)?.error || fnError?.message || "There was an error submitting your event.";
          toast({
            title: "Submission failed",
            description: message,
            variant: "destructive",
          });
          // Reset captcha so user can try again
          turnstileRef.current?.reset();
          setTurnstileToken(null);
          setIsSubmitting(false);
          return;
        }

        setSubmitSuccess(true);
        toast({
          title: "Event Submitted!",
          description: "Your event has been submitted for review. It will appear once approved by an admin.",
        });
        setIsSubmitting(false);
        return;
      }

      // ============================================================
      // ADMIN PATH — direct insert (admin RLS allows it; supports on-behalf flow)
      // ============================================================

      // Handle on-behalf flow: create/find organiser account
      let organiserUserId: string | null = null;
      let organiserPassword: string | null = null;
      let isExistingUser = false;

      if (isOnBehalf && formData.contact_email) {
        const tempPassword = crypto.randomUUID().slice(0, 12);
        
        const { data: manageResult, error: manageError } = await supabase.functions.invoke('admin-manage-user', {
          body: {
            action: 'create_user',
            email: formData.contact_email,
            password: tempPassword,
            display_name: formData.organizer || formData.contact_email.split('@')[0],
            phone: formData.contact_phone || undefined,
            allow_existing_user: true,
            send_email: false, // We'll send our own email
          }
        });

        if (manageError) {
          console.error('Error creating organiser account:', manageError);
          toast({
            title: "Account creation failed",
            description: "Could not create organiser account. The event will be submitted without linking.",
            variant: "destructive"
          });
        } else if (manageResult) {
          organiserUserId = manageResult.user_id;
          isExistingUser = manageResult.is_existing_user === true;
          if (!isExistingUser) {
            organiserPassword = tempPassword;
          }
        }
      }

      // Prepare event data
      const eventData = {
        title: formData.title,
        description: formData.excerpt || null,
        excerpt: formData.excerpt || null,
        full_description: formData.full_description || null,
        date: formData.date,
        date_end: formData.date_end || null,
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
        website_url: formData.website_url || null,
        image: imageUrl,
        is_published: false, // Pending admin approval
        featured: false,
        links: [],
        user_id: isOnBehalf && organiserUserId ? organiserUserId : (user?.id || null)
      };

      const { data: insertedEvent, error } = await supabase
        .from('events')
        .insert([eventData] as any)
        .select()
        .single();

      if (error) throw error;

      // Fire-and-forget admin notification email
      supabase.functions.invoke('send-event-notification', {
        body: {
          event_id: insertedEvent.id,
          slug: insertedEvent.slug,
          title: formData.title,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          area: formData.area,
          category: formData.category,
          type: formData.type,
          organizer: formData.organizer || undefined,
          contact_email: formData.contact_email || undefined,
          contact_phone: formData.contact_phone || undefined,
          excerpt: formData.excerpt || undefined,
        }
      }).catch(err => console.error('Failed to send event notification:', err));

      // Fire-and-forget organiser login email (on-behalf only)
      if (isOnBehalf && formData.contact_email && organiserUserId) {
        supabase.functions.invoke('send-event-organiser-login', {
          body: {
            email: formData.contact_email,
            password: organiserPassword,
            is_existing_user: isExistingUser,
            event_id: insertedEvent.id,
            slug: insertedEvent.slug,
            event_title: formData.title,
            organiser_name: formData.organizer || undefined,
          }
        }).catch(err => console.error('Failed to send organiser login email:', err));
      }

      setSubmitSuccess(true);
      
      toast({
        title: "Event Submitted!",
        description: isOnBehalf 
          ? "Event submitted and organiser has been emailed with their login details."
          : "Your event has been submitted for review. It will appear once approved by an admin."
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
                      title: '', organizer: '', date: '', date_end: '', time: '', end_time: '',
                      location: '', area: '', postcode: '', category: '', type: '',
                      excerpt: '', full_description: '', ticket_url: '', contact_email: '', contact_phone: '', website_url: ''
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
                {/* Admin On-Behalf Toggle */}
                {isAdmin && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="font-medium text-amber-900">Filling in on behalf of an organiser</p>
                          <p className="text-sm text-amber-700">
                            The organiser will receive an email with login details to manage their event
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={isOnBehalf}
                        onCheckedChange={setIsOnBehalf}
                        disabled={isSubmitting}
                      />
                    </div>
                    {isOnBehalf && (
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <p className="text-sm text-amber-700">
                          <strong>Note:</strong> The organiser's contact email (below) will be used as their login email. 
                          They'll receive credentials and a link to the dashboard where they can upload an image and verify details.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <EventFormFields
                  formData={formData}
                  onChange={handleInputChange}
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                  disabled={isSubmitting}
                  showInfoBanner
                  isOnBehalf={isOnBehalf}
                />
                </div>

                {/* Honeypot — hidden from real users, bots will fill this */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '-10000px',
                    top: 'auto',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                  }}
                >
                  <label htmlFor="website_homepage">Website (leave blank)</label>
                  <input
                    id="website_homepage"
                    name="website_homepage"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {/* Turnstile captcha — public submissions only */}
                {!isAdmin && turnstileSiteKey && (
                  <div className="flex justify-center">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={turnstileSiteKey}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setTurnstileToken(null)}
                      options={{ theme: 'light' }}
                    />
                  </div>
                )}

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
                    disabled={isSubmitting || (!isAdmin && !turnstileToken)}
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
