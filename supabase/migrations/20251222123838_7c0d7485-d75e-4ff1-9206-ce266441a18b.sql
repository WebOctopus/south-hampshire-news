-- Drop the restrictive user policy and add one that allows submissions
DROP POLICY IF EXISTS "Users can manage their own events" ON public.events;

-- Allow anyone to submit events for approval (they start unpublished)
CREATE POLICY "Anyone can submit events for approval" 
ON public.events 
FOR INSERT 
WITH CHECK (is_published = false AND featured = false);

-- Allow users to manage their own submitted events
CREATE POLICY "Users can manage their own events" 
ON public.events 
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to upload event images
CREATE POLICY "Anyone can upload event images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'event-images');

-- Allow public read access to event images
CREATE POLICY "Anyone can view event images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-images');