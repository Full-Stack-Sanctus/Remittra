// lib/supabaseMiddleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { handleAuthorization } from "./rbacMiddleware"; // Import the logic

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set({ name, value, ...options }));
        },
      },
    }
  );

  // Refresh session and get user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Profile if user exists
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  // EXECUTE RBAC LOGIC
  const redirectResponse = await handleAuthorization(request, user, profile);
  
  // If the logic says "Go elsewhere", return that redirect. Otherwise, return the session response.
  return redirectResponse || response;
};