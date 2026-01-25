import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  const supabaseServer = getSupabaseServer();
  const { data } = await supabaseServer
    .from("users")
    .select("id, email, kyc_verified");
  return NextResponse.json(data || []);
}
