// @/app/api/ajos/memberships/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServerClient";

export async function GET(req: NextRequest) {
  try {
    const supabase = await getSupabaseServer(); 
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch groups where user is a member (is_head = false)
    const { data: joinedData } = await supabase
      .from("user_ajos")
      .select(`
        your_contribution, 
        payout_due, 
        is_head, 
        ajos (id, name, current_cycle, cycle_amount, cycle_duration)
      `)
      .eq("user_id", user.id)
      .eq("is_head", false);

    // 2. Fetch requests for groups the user CREATED (user is the lead)
    const { data: requestsData } = await supabase
      .from("ajo_invites")
      .select(`*`)
      .eq("created_by", user.id)
      .eq("status", "pending");

    return NextResponse.json({
      memberships: joinedData?.map(item => ({
        ...item.ajos,
        your_contribution: item.your_contribution,
        payout_due: item.payout_due
      })) || [],
      requests: requestsData || []
    });

  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}