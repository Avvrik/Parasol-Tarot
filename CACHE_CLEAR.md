# Twitter Handles Database Management

The Supabase database now only tracks Twitter handles that have been processed, not cached images.

## View Handles in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **twitter_handles** table
3. View all handles that have been processed

## Clear Handles from Database

### Option A: Clear a Specific Handle

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **twitter_handles** table
3. Find the row with the handle you want to remove
4. Delete that row

### Option B: Clear All Handles

Run this SQL in the Supabase SQL Editor:

```sql
-- Clear all handles
DELETE FROM twitter_handles;
```

### Option C: Clear a Specific Handle via SQL

```sql
-- Replace 'username' with the actual handle
DELETE FROM twitter_handles WHERE handle = LOWER('username');
```

## Notes

- The database only stores Twitter handles, not images
- Each handle is stored once (unique constraint)
- Handles are tracked with a timestamp of when they were first processed

