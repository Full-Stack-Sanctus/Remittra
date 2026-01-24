import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { ajoId, userId } = await req.json();
  if (!ajoId || !userId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { error } = await supabase
    .from("ajo_members")
    .insert({ ajo_id: ajoId, user_id: userId });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
