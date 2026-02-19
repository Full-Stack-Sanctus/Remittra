// @/app/api/ajos/invite/route.ts
import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer();
    
    // 1. Get Session User (Enterprise standard: identify user from server session, not body)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ajoId } = await req.json();

    // 2. Atomic check: Verify ownership and existing valid link
    const { data: ajo, error: ajoErr } = await supabase
      .from("ajos")
      .select("id, name, created_by, invitation_url, invite_expires_at")
      .eq("id", ajoId)
      .single();

    if (ajoErr || !ajo) return NextResponse.json({ error: "Group not found" }, { status: 404 });
    
    // 3. Authorization Check
    if (ajo.created_by !== user.id) {
      return NextResponse.json({ error: "Access Denied: You are not the creator of this group." }, { status: 403 });
    }

    // 4. Check if a link already exists and is still valid
    if (ajo.invitation_url && ajo.invite_expires_at) {
      const now = new Date();
      const expiry = new Date(ajo.invite_expires_at);
      if (now < expiry) {
        return NextResponse.json({ error: "A link was created already and is still valid." }, { status: 400 });
      }
    }

    // 5. Generate secure 5-minute link
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join?token=${token}`;

    // 6. Update Database
    const { error: updateErr } = await supabase
      .from("ajos")
      .update({
        invitation_url: inviteLink,
        invite_expires_at: expiresAt,
        is_clicked: false
      })
      .eq("id", ajoId);

    if (updateErr) throw updateErr;

    return NextResponse.json({ 
      success: true, 
      groupName: ajo.name,
      message: "You have successfully created a link, please check your email." 
    });

  } catch (err) {
    console.error("[INVITE_ERROR]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}