// lib/supabaseServer.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Returns a Supabase client for server-side operations.
 * Uses SERVICE ROLE key. Session cookies allow identifying the current user.
 */
export function getSupabaseServer(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Don't persist session, server-side only
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        // Optional: custom headers
      },
    },
    // This enables the server to read cookies for identifying the logged-in user
    cookies: cookies() as any,
  });
}

