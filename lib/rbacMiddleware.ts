// lib/rbacMiddleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { type User } from "@supabase/supabase-js";

interface Profile {
  is_admin: boolean;
}

export const handleAuthorization = async (
  request: NextRequest,
  user: User | null,
  profile: Profile | null
) => {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 1. PUBLIC REDIRECT: Prevent logged-in users from seeing Landing/Login/Signup
  const publicRoutes = ["/", "/signup", "/login"];
  if (user && publicRoutes.includes(pathname)) {
    const dashboard = profile?.is_admin ? "/admin" : "/user";
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // 2. AUTH GUARD: Protect /admin and /user from unauthenticated guests
  if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/user"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. ADMIN GUARD: Prevent non-admins from hitting /admin routes
  if (pathname.startsWith("/admin") && !profile?.is_admin) {
    // Drop them back to the user dashboard with a clear conscience
    return NextResponse.redirect(new URL("/user", request.url));
  }

  // 4. USER GUARD: Prevent admins from messing with standard user flows (Optional)
  // If you want admins to stay in /admin only:
  // if (pathname.startsWith("/user") && profile?.is_admin) {
  //   return NextResponse.redirect(new URL("/admin", request.url));
  // }

  return null; // Return null if no redirect is needed
};