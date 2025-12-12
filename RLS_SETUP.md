# Row-Level Security (RLS) Setup for Profiles Table

## Problem
When creating a new account, you may encounter this error:
```
{code: '42501', message: 'new row violates row-level security policy for table "profiles"'}
```

This happens because the `profiles` table has Row-Level Security (RLS) enabled, but the policies don't allow users to insert their own profile during signup (when `auth.uid()` might not be available yet).

## Solution

Run the SQL migration file in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/fix_profiles_rls.sql`
4. Click **Run** to execute the migration

## What the Migration Does

The migration uses a **database trigger** approach, which is more reliable:

1. **Database Trigger** - Automatically creates a profile entry when a new user is created in `auth.users`
   - This bypasses RLS because triggers run with `SECURITY DEFINER` privileges
   - The trigger extracts the `full_name` from the user's metadata
   - This is the primary method for profile creation

2. **RLS Policies** (as backup):
   - **Users can insert their own profile** - Allows users to create a profile with their own user ID (backup if trigger fails)
   - **Users can update their own profile** - Allows users to update only their own profile
   - **Users can read all profiles** - Allows all authenticated users to read profiles (needed for displaying names in comments)

## Alternative: Manual Setup

If you prefer to set up the policies manually:

1. Go to **Authentication** > **Policies** in Supabase Dashboard
2. Select the `profiles` table
3. Create the following policies:

### Insert Policy
- Policy name: "Users can insert their own profile"
- Allowed operation: INSERT
- USING expression: `auth.uid() = id`
- WITH CHECK expression: `auth.uid() = id`

### Update Policy
- Policy name: "Users can update their own profile"
- Allowed operation: UPDATE
- USING expression: `auth.uid() = id`
- WITH CHECK expression: `auth.uid() = id`

### Select Policy
- Policy name: "Users can read all profiles"
- Allowed operation: SELECT
- USING expression: `true`

## Verification

After running the migration, try creating a new account. The profile should be created successfully without the RLS error.

