import { supabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, createdBy, cycleAmount } = await req.json();
  if (!name || !createdBy || !cycleAmount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await supabaseServer.from("ajos").insert({
    name,
    created_by: createdBy,
    cycle_amount: cycleAmount,
    current_cycle: 1,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
