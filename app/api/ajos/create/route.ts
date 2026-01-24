import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, createdBy, cycleAmount, cycleDuration } = await req.json();
    const supabaseServer = getSupabaseServer();

    // Validate required fields
    if (!name || !createdBy || !cycleAmount || !cycleDuration) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1️⃣ Insert Ajo into ajos table
    const { data: ajoData, error: ajoError } = await supabaseServer
      .from("ajos")
      .insert({
        name,
        created_by: createdBy,
        cycle_amount: cycleAmount,
        cycle_duration: cycleDuration,
        current_cycle: 1,
      })
      .select() // to get inserted record
      .single();

    if (ajoError || !ajoData) {
      return NextResponse.json({ error: ajoError?.message || "Failed to create Ajo" }, { status: 400 });
    }

    // 2️⃣ Insert creator into user_ajos as head
    const { error: userAjoError } = await supabaseServer.from("user_ajos").insert({
      user_id: createdBy,
      ajo_id: ajoData.id,
      your_contribution: 0,
      payout_due: false,
      is_head: true, // optional column if you added it
    });

    if (userAjoError) {
      return NextResponse.json({ error: userAjoError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, ajo: ajoData });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
