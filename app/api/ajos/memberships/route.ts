// @/app/api/ajos/memberships/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServerClient";

export async function GET(req: NextRequest) {
  const supabase = await getSupabaseServer(); 
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Memberships (Groups I'm already in)
  const { data: joinedData } = await supabase
    .from("user_ajos")
    .select(`ajo_name, your_contribution, payout_due, is_head, ajos (*)`)
    .eq("user_id", user.id)
    .eq("is_head", false);

  // 2. Incoming Requests (I am the Head, others want to join)
  const { data: incomingRequests } = await supabase
    .from("ajo_invites")
    .select(`*, ajos(name)`)
    .eq("created_by", user.id) // Assuming created_by is the Admin
    .eq("status", "pending");

  // 3. Outgoing Requests (I applied to join these groups)
  const { data: mySentRequests } = await supabase
    .from("ajo_invites")
    .select(`*, ajos(name)`)
    .eq("user_id", user.id); // Requests tied to my ID

  return NextResponse.json({
    memberships: joinedData || [],
    incomingRequests: incomingRequests || [],
    sentRequests: mySentRequests || []
  });
}