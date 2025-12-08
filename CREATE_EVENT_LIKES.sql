-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES event_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Allow users to view all likes
CREATE POLICY "Users can view all likes" ON comment_likes
  FOR SELECT USING (true);

-- Allow users to insert their own likes
CREATE POLICY "Users can insert own likes" ON comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes
CREATE POLICY "Users can delete own likes" ON comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE comment_likes;