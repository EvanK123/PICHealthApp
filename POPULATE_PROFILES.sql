-- Populate profiles table with all existing auth users
INSERT INTO profiles (id, email, is_admin)
SELECT 
  u.id, 
  u.email, 
  FALSE as is_admin
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- Then set specific users as admin
UPDATE profiles SET is_admin = TRUE 
WHERE email = 'pichealthapp@gmail.com';