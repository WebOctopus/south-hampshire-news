-- Make the websitevideo bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'websitevideo';

-- Create policies for public access to videos
CREATE POLICY "Videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'websitevideo');

CREATE POLICY "Allow public uploads to video bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'websitevideo');