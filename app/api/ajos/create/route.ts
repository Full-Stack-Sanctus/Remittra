import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = getSupabaseServer();

    // Get Bearer token from request headers
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // Verify session and get user
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const { name, cycleAmount, cycleDuration } = await req.json();
    if (!name || !cycleAmount || !cycleDuration) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Insert Ajo
    const { data: ajoData, error: ajoError } = await supabaseServer
      .from("ajos")
      .insert({
        name,
        created_by: user.id,
        cycle_amount: cycleAmount,
        cycle_duration: cycleDuration,
        current_cycle: 1,
      })
      .select()
      .single();

    if (ajoError || !ajoData) {
      return NextResponse.json({ error: ajoError?.message || "Failed to create Ajo" }, { status: 400 });
    }

    // Insert creator as head in user_ajos
    const { error: userAjoError } = await supabaseServer.from("user_ajos").insert({
      user_id: user.id,
      ajo_id: ajoData.id,
      your_contribution: 0,
      payout_due: false,
      is_head: true,
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
