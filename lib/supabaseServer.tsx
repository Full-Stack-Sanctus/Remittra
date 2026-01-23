// lib/supabaseServer.ts

/*
import { createClient } from '@supabase/supabase-js'

const connectionString = process.env.SUPABASE_DB_URL!
if (!connectionString) throw new Error('Missing SUPABASE_DB_URL')

export const supabaseServer = createClient(connectionString, {
  // Optional: adjust headers if needed
  auth: { persistSession: false },
})
*/

// Using Project URL + anon key
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
