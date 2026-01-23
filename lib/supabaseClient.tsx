/* #  Strictly for typing
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

*/

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
    (() => {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    })(),
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    (() => {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
    })(),
);
