// @/app/api/ajos/join/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  try {
    // 1. Get Authenticated User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Trace the Request URL (The full link used to join)
    const { requestUrl } = await req.json();

    // 3. Find Ajo by invitation_url and validate state
    const { data: ajo, error: ajoErr } = await supabase
      .from("ajos")
      .select("id, created_by, invitation_url, is_clicked, invite_expires_at")
      .eq("invitation_url", requestUrl)
      .single();

    if (ajoErr || !ajo) {
      return NextResponse.json({ error: "Invalid link or link not found." }, { status: 404 });
    }

    // 4. Logic Checks
    if (ajo.is_clicked) {
      return NextResponse.json({ error: "This link has already been used and is now expired." }, { status: 400 });
    }

    if (ajo.created_by === user.id) {
      return NextResponse.json({ error: "You cannot add yourself to a group you created." }, { status: 403 });
    }

    // 5. Update Ajo state to "Clicked"
    const { error: updateErr } = await supabase
      .from("ajos")
      .update({ is_clicked: true })
      .eq("id", ajo.id);

    if (updateErr) throw updateErr;

    // 6. Check if user already has an invite entry for this link
    const { data: existingInvite } = await supabase
      .from("ajo_invites")
      .select("id")
      .eq("request_url", requestUrl)
      .eq("user_id", user.id)
      .single();

    if (!existingInvite) {
      // Create new row in ajo_invites
      const { error: inviteInsertErr } = await supabase
        .from("ajo_invites")
        .insert({
          user_id: user.id,
          user_email: user.email,
          ajo_id: ajo.id,
          created_by: ajo.created_by, // The Ajo creator
          request_url: requestUrl,
          status: "pending"
        });

      if (inviteInsertErr) throw inviteInsertErr;
    }

    return NextResponse.json({ 
      success: true, 
      message: "Your request to join has been submitted for approval." 
    });

  } catch (err) {
    console.error("[JOIN_ROUTE_ERROR]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}