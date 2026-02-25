// api/users/route.ts

import { getSupabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function GET() {
  
  const supabaseServer = await getSupabaseServer(); 
  
  const { data, error } = await supabaseServer
    .from("users")
    .select("id, email, kyc_verified, verification_level");

  if (error) {
    console.error("Fetch error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}