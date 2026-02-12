
-- Create email_templates table
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  subject text NOT NULL,
  html_body text NOT NULL,
  available_variables text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admin full access to email templates"
  ON public.email_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default templates
INSERT INTO public.email_templates (name, display_name, subject, html_body, available_variables) VALUES
(
  'booking_confirmation_customer',
  'Booking Confirmation (Customer)',
  'Your Discover Magazine Booking Confirmation',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;"><h1 style="color: #ffffff; margin: 0; font-size: 24px;">Booking Confirmed!</h1><p style="color: #e2e8f0; margin: 10px 0 0;">Thank you for your advertising booking</p></div><div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0;"><p>Dear {{customer_name}},</p><p>Your advertising booking has been confirmed. Here are the details:</p><table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Package</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{package_type}}</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Ad Size</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{ad_size}}</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Duration</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{duration}}</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Circulation</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{circulation}}</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Total Cost</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{total_cost}}</td></tr></table><p>You can view and manage your booking from your <a href="{{dashboard_url}}" style="color: #3182ce;">dashboard</a>.</p></div><div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e2e8f0; border-top: 0;"><p style="color: #718096; font-size: 12px; margin: 0;">Discover Magazine &copy; 2025</p></div></div>',
  ARRAY['customer_name', 'package_type', 'ad_size', 'duration', 'circulation', 'total_cost', 'dashboard_url']
),
(
  'quote_saved_customer',
  'Quote Saved (Customer)',
  'Your Discover Magazine Quote Has Been Saved',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;"><h1 style="color: #ffffff; margin: 0; font-size: 24px;">Quote Saved!</h1><p style="color: #e2e8f0; margin: 10px 0 0;">Your advertising quote is ready for review</p></div><div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0;"><p>Dear {{customer_name}},</p><p>Your advertising quote has been saved. Here are the details:</p><table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Package</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{package_type}}</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Ad Size</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{ad_size}}</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Duration</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{duration}}</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Circulation</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{circulation}}</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Total Cost</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{total_cost}}</td></tr></table><p>When you are ready to proceed, you can convert this quote to a booking from your <a href="{{dashboard_url}}" style="color: #3182ce;">dashboard</a>.</p></div><div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e2e8f0; border-top: 0;"><p style="color: #718096; font-size: 12px; margin: 0;">Discover Magazine &copy; 2025</p></div></div>',
  ARRAY['customer_name', 'package_type', 'ad_size', 'duration', 'circulation', 'total_cost', 'dashboard_url']
),
(
  'booking_quote_admin',
  'New Booking/Quote (Admin)',
  '{{type_label}}: {{customer_name}} - {{model_label}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;"><h1 style="color: #ffffff; margin: 0; font-size: 24px;">New {{type_label}} Received</h1><p style="color: #fed7d7; margin: 10px 0 0;">{{model_label}} advertising enquiry</p></div><div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0;"><h2 style="margin-top: 0;">Customer Details</h2><table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Name</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{customer_name}}</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{email}}</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{phone}}</td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Company</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{{company}}</td></tr></table><h2>Booking Details</h2>{{details_table}}<p><a href="{{admin_url}}" style="color: #3182ce;">View in Admin Dashboard</a></p></div><div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e2e8f0; border-top: 0;"><p style="color: #718096; font-size: 12px; margin: 0;">Discover Magazine Admin Notification</p></div></div>',
  ARRAY['type_label', 'model_label', 'customer_name', 'email', 'phone', 'company', 'details_table', 'admin_url']
),
(
  'welcome_email',
  'Welcome Email',
  'Welcome to Discover Magazine!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;"><h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to Discover!</h1><p style="color: #e2e8f0; margin: 10px 0 0;">Your account has been created successfully</p></div><div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0;"><p>Dear {{customer_name}},</p><p>Welcome to Discover Magazine! Your account has been set up and you are ready to start exploring advertising opportunities in South Hampshire.</p><p>From your dashboard you can:</p><ul><li>Create and manage advertising bookings</li><li>View and track your quotes</li><li>Set up payment via GoCardless</li><li>Manage your business listing</li></ul><p><a href="{{dashboard_url}}" style="display: inline-block; background: #3182ce; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Go to Dashboard</a></p></div><div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e2e8f0; border-top: 0;"><p style="color: #718096; font-size: 12px; margin: 0;">Discover Magazine &copy; 2025</p></div></div>',
  ARRAY['customer_name', 'dashboard_url']
);
