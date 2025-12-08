# Enable Realtime for Comments

Run this SQL in Supabase SQL Editor:

```sql
-- Enable realtime for event_comments table
ALTER PUBLICATION supabase_realtime ADD TABLE event_comments;

-- Verify it's enabled
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

You should see `event_comments` in the results. After running this, deletes and inserts will sync in real-time across all users.
