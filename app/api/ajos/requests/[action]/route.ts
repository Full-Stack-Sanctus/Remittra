// @/app/api/ajos/requests/[action]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServerClient";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> } // Params is a Promise
) {
  try {
    const { action } = await params; // Await the promise here
    const { requestId } = await req.json();
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Fetch invite and verify the current user is the "Head" (created_by)
    const { data: invite, error: fetchError } = await supabase
      .from("ajo_invites")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError || !invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }
    
    // Security: Only the person who created the invite (Admin) can approve/decline
    if (invite.created_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Map the action to your DB schema: 'approved' or 'declined'
    const newStatus = action === "approve" ? "approved" : "declined";

    if (newStatus === "approved") {
      // Enterprise safety: Use an RPC or a manual check to prevent double-entry
      const { error: joinError } = await supabase.from("user_ajos").insert({
        user_id: invite.user_id,
        ajo_id: invite.ajo_id,
        is_head: false,
      });

      if (joinError && joinError.code !== '23505') { // Ignore unique constraint errors
        return NextResponse.json({ error: "Failed to join user" }, { status: 500 });
      }
    }

    // Update the invite status
    const { error: updateError } = await supabase
      .from("ajo_invites")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, status: newStatus });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}