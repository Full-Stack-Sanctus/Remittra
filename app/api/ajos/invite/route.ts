import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const supabaseServer = getSupabaseServer();
    const body = await req.json();
    const { ajoId, userId, durationHours = 24 } = body;

    if (!ajoId || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Verify user is head of Ajo
    const { data: ajo, error: ajoError } = await supabaseServer
      .from("ajos")
      .select("created_by")
      .eq("id", ajoId)
      .single();

    if (ajoError || !ajo)
      return NextResponse.json({ error: "Ajo not found" }, { status: 404 });

    if (ajo.created_by !== userId)
      return NextResponse.json(
        { error: "Only head can generate invite" },
        { status: 403 },
      );

    // 2. Generate secure invite code
    const code = crypto.randomBytes(12).toString("hex"); // 24 chars, more secure

    // 3. Set expiration
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

    // Optional: limit active invites per Ajo (e.g., max 5)
    const { count } = await supabaseServer
      .from("ajo_invites")
      .select("*", { count: "exact" })
      .eq("ajo_id", ajoId)
      .gt("expires_at", new Date().toISOString());

    if (count && count >= 5) {
      return NextResponse.json(
        { error: "Maximum active invites reached" },
        { status: 400 },
      );
    }

    // 4. Insert into DB
    const { data: inviteData, error: inviteError } = await supabaseServer
      .from("ajo_invites")
      .insert([{ ajo_id: ajoId, code, expires_at: expiresAt }])
      .select()
      .single();

    if (inviteError || !inviteData)
      return NextResponse.json(
        { error: "Failed to create invite" },
        { status: 500 },
      );

    // 5. Return invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/${code}`;
    return NextResponse.json({ inviteLink, expiresAt });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
