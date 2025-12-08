-- Add username column to existing event_comments table
ALTER TABLE event_comments ADD COLUMN IF NOT EXISTS username TEXT;

-- Populate username for existing comments (extract from email)
UPDATE event_comments 
SET username = SPLIT_PART(user_email, '@', 1) 
WHERE username IS NULL OR username = '';

-- Verify the update
SELECT id, user_email, username FROM event_comments;
