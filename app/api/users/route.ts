import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Create SSR Supabase client
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-side key to bypass RLS
      { cookies: cookies() as any }
    );

    // Fetch all Ajo groups with basic info
    const { data: ajosData, error } = await supabaseServer
      .from("ajos")
      .select("id, name, current_cycle")
      .order("name", { ascending: true });

    if (error) {
      console.error("AJOS FETCH ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(ajosData || [], { status: 200 });
  } catch (err: any) {
    console.error("UNEXPECTED ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
