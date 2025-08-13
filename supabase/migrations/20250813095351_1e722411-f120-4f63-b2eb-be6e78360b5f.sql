-- Clear existing business categories
DELETE FROM business_categories;

-- Insert new business categories with appropriate slugs and descriptions
INSERT INTO business_categories (name, slug, description, icon) VALUES
('0-18 Play/Learn', '0-18-play-learn', 'Educational activities and learning opportunities for children and young adults', 'graduation-cap'),
('Business & IT', 'business-it', 'Business services, IT support, technology and computing services', 'briefcase'),
('Charity', 'charity', 'Charitable organizations and non-profit services', 'heart'),
('Cleaning', 'cleaning', 'Cleaning services for homes and businesses', 'spray-can'),
('Community', 'community', 'Community groups, local organizations and social services', 'users'),
('Eating & Drinking', 'eating-drinking', 'Restaurants, cafes, pubs, bars and food services', 'utensils'),
('Entertainment', 'entertainment', 'Entertainment venues, events and leisure activities', 'music'),
('Hair & Beauty', 'hair-beauty', 'Hair salons, beauty services, spas and wellness treatments', 'scissors'),
('Holidays & Travel', 'holidays-travel', 'Travel agencies, holiday services and accommodation', 'plane'),
('Home: Garden', 'home-garden', 'Gardening services, landscaping and outdoor maintenance', 'flower'),
('Home: Interiors', 'home-interiors', 'Interior design, furniture and home decoration services', 'home'),
('Home: Property Services', 'home-property-services', 'Property maintenance, repairs and home improvement services', 'wrench'),
('Leisure Activities', 'leisure-activities', 'Recreational activities, hobbies and leisure pursuits', 'gamepad-2'),
('Medical Services', 'medical-services', 'Healthcare, medical services and wellness providers', 'stethoscope'),
('Motoring', 'motoring', 'Car services, repairs, sales and automotive businesses', 'car'),
('Moving Home', 'moving-home', 'Removal services, storage and relocation assistance', 'truck'),
('Party Services', 'party-services', 'Event planning, party supplies and celebration services', 'party-popper'),
('Personal Services', 'personal-services', 'Personal care, lifestyle and individual service providers', 'user'),
('Pet Services', 'pet-services', 'Pet care, veterinary services and animal-related businesses', 'heart'),
('Professional Services', 'professional-services', 'Legal, financial, consulting and professional business services', 'briefcase'),
('Retail', 'retail', 'Shops, stores and retail businesses', 'shopping-bag'),
('Senior Living', 'senior-living', 'Services and facilities for elderly care and senior living', 'shield'),
('Sport & Fitness', 'sport-fitness', 'Gyms, sports facilities and fitness services', 'dumbbell');