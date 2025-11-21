import { createClient } from '@supabase/supabase-js';

// These should come from env vars in production
const SUPABASE_URL = 'https://hjxipujkcrawdepgdbqk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeGlwdWprY3Jhd2RlcGdkYnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NzcwNjMsImV4cCI6MjA3OTA1MzA2M30.BMf7aCN-cLfSfX3sVDBbWWWuYhsaTvB9b0MFfonPT6E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);