# Supabase Setup for Event Comments

## Database Table

Create a new table in Supabase called `event_comments` with the following schema:

### SQL Command

```sql
CREATE TABLE event_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  username TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_event_comments_event_id ON event_comments(event_id);
CREATE INDEX idx_event_comments_created_at ON event_comments(created_at DESC);
```

### Column Details

- **id**: UUID, Primary Key, Auto-generated
- **event_id**: TEXT, The Google Calendar event ID
- **user_id**: UUID, Foreign key to auth.users table
- **user_email**: TEXT, User's email for display
- **username**: TEXT, User's display name (from metadata or email prefix)
- **comment_text**: TEXT, The comment content
- **created_at**: TIMESTAMP, Auto-generated timestamp

## Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments
CREATE POLICY "Anyone can view comments"
ON event_comments FOR SELECT
USING (true);

-- Allow authenticated users to insert their own comments
CREATE POLICY "Authenticated users can insert comments"
ON event_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
ON event_comments FOR DELETE
USING (auth.uid() = user_id);
```

## Testing

After creating the table and policies, test by:
1. Sign in to the app
2. Open an event
3. Click "View Comments"
4. Add a comment
5. Verify it appears in the list
