// lib/supabaseMiddleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // 1. Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // Inside your setAll(cookiesToSet) function:
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // FIX: Pass as a single object instead of 3 arguments
            request.cookies.set({ name, value, ...options });
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            // response.cookies.set still accepts (name, value, options) 
            // but using the object syntax here too keeps it consistent
            response.cookies.set({ name, value, ...options })
          );
        },
        
      },
    }
  );

  // 2. Refresh the session (important for security!)
  const { data: { user } } = await supabase.auth.getUser();

  // 3. PROTECT ROUTES
  const url = request.nextUrl.clone();

  // If trying to access /admin or /user without being logged in
  if (!user && (url.pathname.startsWith("/admin") || url.pathname.startsWith("/user"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. ROLE-BASED ACCESS CONTROL (RBAC)
  if (user) {
    // Fetch user profile from your 'users' table
    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    // Prevent non-admins from reaching /admin
    if (url.pathname.startsWith("/admin") && !profile?.is_admin) {
      return NextResponse.redirect(new URL("/user", request.url));
    }
    
    // Redirect logged-in users away from Login/Signup
    if (url.pathname === "/login" || url.pathname === "/signup") {
      return NextResponse.redirect(new URL(profile?.is_admin ? "/admin" : "/user", request.url));
    }
  }

  return response;
};