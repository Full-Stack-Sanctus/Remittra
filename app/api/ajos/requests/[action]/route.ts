// @/app/api/ajos/requests/[action]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServerClient";

export async function POST(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  const { action } = params;
  const { requestId } = await req.json();
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Fetch the invite and verify the current user is the "Head" of that Ajo
  const { data: invite, error: fetchError } = await supabase
    .from("ajo_invites")
    .select("*, ajos(id, creator_id)")
    .eq("id", requestId)
    .single();

  if (fetchError || !invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  
  // Security check: Only the Ajo creator/head can approve/reject
  if (invite.ajos.creator_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const newStatus = action === "approve" ? "accepted" : "rejected";

  if (action === "approve") {
    // Atomic Operation: Update invite AND join the group
    const { error: joinError } = await supabase.from("user_ajos").insert({
      user_id: invite.user_id,
      ajo_id: invite.ajo_id,
      is_head: false,
    });

    if (joinError) return NextResponse.json({ error: "Failed to join user" }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("ajo_invites")
    .update({ status: newStatus })
    .eq("id", requestId);

  if (updateError) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({ success: true });
}