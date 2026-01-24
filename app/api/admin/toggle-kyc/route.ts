import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, verified } = await req.json();
  const { error } = await supabase
    .from("users")
    .update({ kyc_verified: !verified })
    .eq("id", userId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
