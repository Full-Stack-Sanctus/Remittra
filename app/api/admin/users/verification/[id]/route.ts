// api/admin/users/verification/[id]/route.ts

import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse, NextRequest } from "next/server";

// Define the shape of the params
type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams // Params is now a Promise
) {
  const supabase = getSupabaseServer();
  
  // 1. Await the params to get the ID
  const { id: userId } = await params;

  try {
    // 2. Security Check: Verify Admin
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminRecord } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", authUser.id)
      .single();

    if (!adminRecord?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Fetch User and Pending Submission
    const { data, error } = await supabase
      .from("users")
      .select(`
        id, 
        email, 
        verification_level,
        kyc_submissions (
          id,
          status,
          tier_requested,
          id_image_url,
          created_at
        )
      `)
      .eq("id", userId)
      .eq("kyc_submissions.status", "pending")
      .maybeSingle();

    if (error) throw error;

    // Handle case where user exists but has no pending submission
    if (!data) {
       const { data: basicUser } = await supabase
        .from("users")
        .select("id, email, verification_level")
        .eq("id", userId)
        .single();
        
       return NextResponse.json(basicUser);
    }

    return NextResponse.json(data);
    
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}