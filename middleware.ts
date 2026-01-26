import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isAdminPath = url.pathname.startsWith("/admin");
  const isUserPath = url.pathname.startsWith("/user");

  // 2. If not logged in and trying to access protected routes, send to login
  if (!user && (isAdminPath || isUserPath)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. If logged in, fetch the role from the database
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    // Cross-check: Is this the system admin (env) or a DB admin?
    const adminEmail = process.env.ADMIN_EMAIL; // Use private env for security
    const isActuallyAdmin = user.email === adminEmail || profile?.is_admin === true;

    // 🛡️ REVERSE PROTECTION LOGIC
    
    // Case A: User is an Admin but trying to access /user dashboard
    if (isActuallyAdmin && isUserPath) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Case B: User is NOT an Admin but trying to access /admin dashboard
    if (!isActuallyAdmin && isAdminPath) {
      return NextResponse.redirect(new URL("/user", request.url));
    }
    
    // Case C: Logged in users shouldn't see the login page
    if (url.pathname === "/") {
       return NextResponse.redirect(new URL(isActuallyAdmin ? "/admin" : "/user", request.url));
    }
  }

  return response;
}

// Ensure middleware only runs on dashboard paths
export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/"],
};