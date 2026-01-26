import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 1. Create the Supabase client specifically for Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Refresh session and get the user
  const { data: { user } } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/login";
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  // 3. Protection Logic
  if (!user && !isLoginPage) {
    // No user? Send them to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAdminPath) {
    // User exists, but are they an Admin?
    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      // Not an admin? Kick them to the standard user dashboard
      return NextResponse.redirect(new URL("/user", request.url));
    }
  }

  return response;
}

// 4. Configure which routes trigger this middleware
export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};