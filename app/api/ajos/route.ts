import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  const supabaseServer = getSupabaseServer();
  const { data } = await supabaseServer
    .from("ajos")
    .select("id, name, current_cycle, cycle_amount, created_by");
  return NextResponse.json(data || []);
}
