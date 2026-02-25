// api/admin/users/verification/[id]/route.ts

import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const supabase = getSupabaseServer();
  const { id: userId } = await params;

  try {
    // 1. Security Check
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    // Log for debugging (Check your terminal, not browser console)
    console.log("Checking Admin Access for:", authUser?.email);
    
    const { data: adminRecord } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", authUser?.id)
      .single();

    if (!adminRecord?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Fetch User (Verification Level is here)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, verification_level")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Fetch ONLY the pending submission separately 
    // This prevents the join from breaking the user data object
    const { data: submission } = await supabase
      .from("kyc_submissions")
      .select("id, status, tier_requested, id_image_url, created_at")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    // 4. Combine and return a flat object
    return NextResponse.json({
      ...user,
      pending_submission: submission || null
    });
    
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}