import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { ajoId, userId } = await req.json();
  if (!ajoId || !userId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data: ajo } = await supabase
    .from("ajos")
    .select("*")
    .eq("id", ajoId)
    .single();
  if (!ajo)
    return NextResponse.json({ error: "Ajo not found" }, { status: 404 });

  const { error } = await supabase.from("ajo_contributions").insert({
    ajo_id: ajoId,
    user_id: userId,
    cycle_number: ajo.current_cycle,
    amount: ajo.cycle_amount,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
