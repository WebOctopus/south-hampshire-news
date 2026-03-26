ALTER TABLE profiles ADD COLUMN company text;

UPDATE profiles p
SET company = b.company
FROM (
  SELECT DISTINCT ON (user_id) user_id, company
  FROM bookings
  WHERE company IS NOT NULL AND company != ''
  ORDER BY user_id, created_at DESC
) b
WHERE p.user_id = b.user_id;