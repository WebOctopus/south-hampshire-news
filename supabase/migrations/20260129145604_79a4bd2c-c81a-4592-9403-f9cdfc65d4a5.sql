-- Insert initial advertising page content if it doesn't already exist
INSERT INTO public.content_blocks (name, block_type, content, position, is_active, sort_order)
SELECT 
  'advertising_page',
  'page_content',
  '{
    "hero": {
      "trustBadge": "South Hampshire''s Leading Local Magazine Publisher",
      "headline": "Reach 142,000 Affluent Homes",
      "subheadline": "Generate brand awareness, create leads, and boost website traffic with South Hampshire''s most trusted local magazine network.",
      "videoUrl": "https://qajegkbvbpekdggtrupv.supabase.co/storage/v1/object/public/websitevideo/New%20Hero%20Video.mp4"
    },
    "stats": [
      { "number": "142k", "label": "Bi-monthly Circulation" },
      { "number": "14", "label": "Local Editions" },
      { "number": "72%", "label": "Repeat Rate" },
      { "number": "1,000s", "label": "Customers since 2005" },
      { "number": "580k", "label": "Leaflets/Year" }
    ],
    "loveSection": {
      "heading": "Love Your Business...",
      "subheading": "Invest in Local Advertising to Grow, Expand & Thrive",
      "paragraph1": "Discover Magazine is the region''s most established and widespread portfolio of local publications available to businesses to generate brand awareness, create leads and boost website traffic from affluent homeowners in South Hampshire.",
      "paragraph2": "We started publishing in 2005, and have since grown to become a trusted advertising partner for hundreds of local businesses. Our magazines reach 142,000 homes across 14 editions, covering Winchester, Southampton, Eastleigh, Fareham, and the New Forest.",
      "quote": "We''ve perfected the formula for connecting local businesses with local customers."
    },
    "mediaPack": {
      "heading": "Our Media Pack",
      "description": "Browse our complete media pack to learn about advertising opportunities",
      "embedUrl": "https://indd.adobe.com/embed/0cffeb07-c98f-42bf-9c6b-7661f5c82240?startpage=1&allowFullscreen=false"
    },
    "editionsMap": {
      "heading": "Interactive Distribution & Circulation Maps",
      "description": "Click on a numbered button or area name to view detailed distribution information",
      "embedUrl": "https://indd.adobe.com/embed/3a8ebb1d-2f10-4a2a-b847-dd653c134e5a?startpage=1&allowFullscreen=false"
    },
    "calculatorSection": {
      "badge": "Ready to Get Started?",
      "heading": "Get Your Instant Quote & Booking",
      "subheading": "Start by selecting your preferred advertising package",
      "tagline": "Join hundreds of local businesses who''ve grown with Discover Magazine"
    },
    "enquirySection": {
      "phone": "023 8064 5852",
      "description": "Our sales team are ready to chat about your advertising goals and find the perfect solution for your business."
    }
  }'::jsonb,
  'advertising',
  true,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM public.content_blocks WHERE position = 'advertising'
);