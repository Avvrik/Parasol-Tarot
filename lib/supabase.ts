/**
 * Supabase Client Configuration
 * Database for tracking Twitter handles
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables. Database features will be disabled.');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface TwitterHandleRecord {
  id: string;
  handle: string;
  created_at: string;
}

/**
 * Check if a handle has been processed before
 */
export async function hasHandle(handle: string): Promise<boolean> {
  if (!supabase) {
    console.warn('[Supabase] Client not initialized');
    return false;
  }

  const normalizedHandle = handle.toLowerCase();
  console.log(`[Supabase] Checking if handle exists: ${normalizedHandle}`);

  try {
    const { data, error } = await supabase
      .from('twitter_handles')
      .select('handle')
      .eq('handle', normalizedHandle)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
        console.log(`[Supabase] Handle not found: ${normalizedHandle}`);
        return false;
      } else {
        console.error('[Supabase] Error checking handle:', error);
        return false;
      }
    }

    console.log(`[Supabase] ✅ Handle exists: ${normalizedHandle}`);
    return true;
  } catch (error) {
    console.error('[Supabase] Exception checking handle:', error);
    return false;
  }
}

/**
 * Save a Twitter handle to database
 */
export async function saveHandle(handle: string): Promise<boolean> {
  if (!supabase) {
    console.warn('[Supabase] Client not initialized, cannot save handle');
    return false;
  }

  const normalizedHandle = handle.toLowerCase();
  console.log(`[Supabase] Attempting to save handle: ${normalizedHandle}`);

  try {
    const { error } = await supabase
      .from('twitter_handles')
      .upsert({
        handle: normalizedHandle,
      }, {
        onConflict: 'handle',
      });

    if (error) {
      console.error('[Supabase] ❌ Error saving handle:', error);
      return false;
    }

    console.log(`[Supabase] ✅ Successfully saved handle: ${normalizedHandle}`);
    return true;
  } catch (error) {
    console.error('[Supabase] ❌ Exception saving handle:', error);
    return false;
  }
}

/**
 * Get all handles (paginated)
 */
export async function getAllHandles(limit = 50, offset = 0): Promise<TwitterHandleRecord[]> {
  if (!supabase) {
    console.error('[Supabase] Client not initialized - cannot fetch handles');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('twitter_handles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[Supabase] Error fetching handles:', error);
      return [];
    }

    return (data as TwitterHandleRecord[]) || [];
  } catch (error) {
    console.error('[Supabase] Exception fetching handles:', error);
    return [];
  }
}

