-- Undo event_likes table creation
DROP TABLE IF EXISTS event_likes CASCADE;

-- Remove from realtime publication (if it was added)
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS event_likes;