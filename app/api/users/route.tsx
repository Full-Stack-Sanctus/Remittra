import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  const { data } = await supabase
    .from("users")
    .select("id, email, kyc_verified");
  return NextResponse.json(data || []);
}
