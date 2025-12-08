# Security Configuration

## Environment Variables

This application uses environment variables to store sensitive credentials. **Never commit the `.env` file to version control.**

### Setup Instructions

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your actual credentials:
   - `EXPO_PUBLIC_GOOGLE_API_KEY`: Your Google Calendar API key
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Getting Credentials

#### Google Calendar API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create credentials (API Key)
5. Restrict the API key to only Google Calendar API

#### Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to Settings > API
4. Copy the Project URL and anon/public key