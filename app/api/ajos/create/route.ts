import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = getSupabaseServer();
    
    // Get session and user
    const { data: { session } } = await supabaseServer.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Auth session missing" }, { status: 401 });
    }
    const userId = session.user.id;

    const { name, cycleAmount, cycleDuration } = await req.json();

    if (!name || !cycleAmount || !cycleDuration) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Insert into ajos table
    const { data: ajoData, error: ajoError } = await supabaseServer
      .from("ajos")
      .insert({
        name,
        created_by: userId,
        cycle_amount: Number(cycleAmount),
        cycle_duration: Number(cycleDuration),
        current_cycle: 1,
      })
      .select()
      .single();

    if (ajoError || !ajoData) {
      return NextResponse.json({ error: ajoError?.message || "Failed to create Ajo" }, { status: 400 });
    }

    // Insert creator into user_ajos as head
    const { error: userAjoError } = await supabaseServer
      .from("user_ajos")
      .insert({
        user_id: userId,
        ajo_id: ajoData.id,
        your_contribution: 0,
        payout_due: false,
        is_head: true // make sure this column exists
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
