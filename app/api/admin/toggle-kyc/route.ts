// app/api/admin/toggle-kyc/route.ts
import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, verified } = await req.json();

  const supabase = getSupabaseServer(); // <-- call function here

  const { error } = await supabase
    .from("users")
    .update({ kyc_verified: !verified })
    .eq("id", userId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
