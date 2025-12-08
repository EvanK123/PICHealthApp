# Add Admin Column to Existing Profiles Table

Run this SQL in Supabase SQL Editor:

```sql
-- Add is_admin column to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- To make a user admin by email:
UPDATE profiles SET is_admin = TRUE 
WHERE id = (SELECT id FROM auth.users WHERE email = 'pichealth@gmail.com');

-- To check admin status:
SELECT u.email, p.is_admin 
FROM auth.users u 
JOIN profiles p ON u.id = p.id 
WHERE u.email = 'pichealth@gmail.com';
```