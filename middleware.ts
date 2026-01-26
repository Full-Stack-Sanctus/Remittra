// middleware.ts
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

  const { data: { user } } = await supabase.auth.getUser();
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminPath) {
    // 1. If not logged in at all, redirect to login
    if (!user) return NextResponse.redirect(new URL("/", request.url));

    // 2. Check if email matches the Admin Env Variable
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    
    // Check both the ENV email AND the database 'is_admin' flag for double security
    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    const isSystemAdmin = user.email === adminEmail;
    const isDbAdmin = profile?.is_admin === true;

    if (!isSystemAdmin && !isDbAdmin) {
      return NextResponse.redirect(new URL("/user", request.url));
    }
  }

  return response;
}