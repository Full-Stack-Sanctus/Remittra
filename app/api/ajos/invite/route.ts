import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const supabaseServer = getSupabaseServer();
    const body = await req.json();
    const { ajoId, userId, durationHours = 24 } = body;

    // 1. Check if user is the head of the Ajo
    const { data: ajo, error: ajoError } = await supabaseServer
      .from("ajos")
      .select("created_by")
      .eq("id", ajoId)
      .single();

    if (ajoError || !ajo) return NextResponse.json({ error: "Ajo not found" }, { status: 404 });
    if (ajo.created_by !== userId) return NextResponse.json({ error: "Only head can generate invite" }, { status: 403 });

    // 2. Generate unique invite code
    const code = crypto.randomBytes(8).toString("hex");

    // 3. Set expiration
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

    // 4. Insert invite into DB
    const { data: inviteData, error: inviteError } = await supabaseServer
      .from("ajo_invites")
      .insert([{ ajo_id: ajoId, code, expires_at: expiresAt }])
      .select()
      .single();

    if (inviteError || !inviteData) return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });

    // 5. Return invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/${code}`;
    return NextResponse.json({ inviteLink, expiresAt });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
