import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, userId } = await req.json();
    if (!code || !userId)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const supabaseServer = getSupabaseServer();

    // 1. Validate invite code
    const { data: invite, error: inviteError } = await supabaseServer
      .from("ajo_invites")
      .select("*")
      .eq("code", code)
      .single();

    if (inviteError || !invite)
      return NextResponse.json({ error: "Invalid invite" }, { status: 400 });

    if (new Date(invite.expires_at) < new Date())
      return NextResponse.json({ error: "Invite expired" }, { status: 400 });

    const ajoId = invite.ajo_id;

    // 2. Check if user already joined
    const { data: member } = await supabaseServer
      .from("ajo_members")
      .select("id")
      .eq("ajo_id", ajoId)
      .eq("user_id", userId)
      .single();

    if (member) return NextResponse.json({ error: "Already joined" }, { status: 400 });

    // 3. Insert member
    const { error: joinError } = await supabaseServer
      .from("ajo_members")
      .insert({ ajo_id: ajoId, user_id: userId });

    if (joinError) return NextResponse.json({ error: joinError.message }, { status: 500 });

    // 4. Delete / expire invite
    await supabaseServer.from("ajo_invites").delete().eq("code", code);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
