import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookies() as any }
    );

    // Fetch all Ajo groups (basic)
    const { data, error } = await supabase
      .from("ajos")
      .select("*")
      .order("name", { ascending: true });

    console.log("AJOS RAW DATA:", data);
    if (error) console.error("AJOS FETCH ERROR:", error);

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err: any) {
    console.error("UNEXPECTED ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
