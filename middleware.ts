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

  // Use getUser() for security - it validates the JWT against Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminPath) {
    // 1. Not logged in? Redirect to login
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. Security Check: Compare against Private Env Variable and Database
    // Note: Removed NEXT_PUBLIC_ for server-side security
    const adminEmail = process.env.ADMIN_EMAIL; 
    
    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    const isSystemAdmin = user.email === adminEmail;
    const isDbAdmin = profile?.is_admin === true;

    // If they fail BOTH checks, they are definitely not an admin
    if (!isSystemAdmin && !isDbAdmin) {
      console.warn(`Unauthorized admin access attempt by ${user.email}`);
      return NextResponse.redirect(new URL("/user", request.url));
    }
  }

  return response;
}

// Ensure middleware only runs on relevant routes to save performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}