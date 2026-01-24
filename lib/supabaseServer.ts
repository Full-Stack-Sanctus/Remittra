<<<<<<< HEAD
// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';
=======
import { createClient } from "@supabase/supabase-js";
>>>>>>> origin/main

export function getSupabaseServer() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

<<<<<<< HEAD
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase server env vars missing');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}
=======
if (!supabaseUrl || !supabaseKey) {
  throw new Error("supabaseUrl is required");
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
>>>>>>> origin/main
