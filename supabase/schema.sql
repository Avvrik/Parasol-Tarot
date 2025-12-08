-- Parasol Tarot Database Schema
-- Create this table in your Supabase project

-- Twitter handles table to track handles that have been processed
CREATE TABLE IF NOT EXISTS twitter_handles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast handle lookups
CREATE INDEX IF NOT EXISTS idx_twitter_handles_handle ON twitter_handles(handle);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_twitter_handles_created_at ON twitter_handles(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE twitter_handles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read handles
CREATE POLICY "Anyone can view handles"
  ON twitter_handles FOR SELECT
  USING (true);

-- Policy: Allow anyone to insert handles
CREATE POLICY "Anyone can create handles"
  ON twitter_handles FOR INSERT
  WITH CHECK (true);

-- Optional: Add a comment
COMMENT ON TABLE twitter_handles IS 'Stores Twitter handles that have been processed';

