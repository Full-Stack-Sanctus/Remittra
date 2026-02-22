import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  // 'next' is a param you can pass from the signup/login page 
  // to tell the callback where to go (defaults to '/')
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                // Using object spread for compatibility and consistency
                cookieStore.set({ name, value, ...options })
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing sessions.
            }
          },
        },
      }
    );

    // 1. Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // 2. Fetch user role to decide the first redirect destination
      // Using the supabase instance we just created which now has the session
      const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();

      // 3. Route based on role
      const redirectPath = profile?.is_admin ? "/admin" : "/user";
      
      // origin ensures we don't redirect to a malicious external site
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // If something goes wrong or code is missing, send them to an error page
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}