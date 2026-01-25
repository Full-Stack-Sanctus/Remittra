import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseServer = getSupabaseServer();

    // Fetch all Ajo groups
    const { data, error } = await supabaseServer
      .from("ajos")
      .select("id, name, current_cycle") // only basic fields
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching Ajo groups:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
