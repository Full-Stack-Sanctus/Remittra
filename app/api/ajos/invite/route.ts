// @/app/api/ajos/invite/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  try {
    // 1. Authenticate User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ajoId } = await req.json();

    // 2. Fetch Ajo and verify ownership
    const { data: ajo, error: ajoErr } = await supabase
      .from("ajos")
      .select("id, name, created_by, invitation_url, invite_expires_at")
      .eq("id", ajoId)
      .single();

    if (ajoErr || !ajo) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    
    // 3. Authorization Check
    if (ajo.created_by !== user.id) {
      return NextResponse.json({ 
        error: "Access Denied: You are not the creator of this group and cannot add members." 
      }, { status: 403 });
    }

    // 4. Check for existing valid link
    if (ajo.invitation_url && ajo.invite_expires_at) {
      const now = new Date();
      const expiry = new Date(ajo.invite_expires_at);
      if (now < expiry) {
        return NextResponse.json({ 
          error: "A link was created already and is still valid." 
        }, { status: 400 });
      }
    }

    // 5. Generate secure 5-minute link & token
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join?token=${token}`;

    // 6. Update Database with new link state
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