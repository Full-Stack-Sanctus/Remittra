// api/admin/users/verification/[id]/route.ts

import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseServer();
  const userId = params.id;

  // 1. SECURITY: Verify the requester is an Admin
  const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: adminRecord } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", adminUser.id)
    .single();

  if (!adminRecord?.is_admin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  // 2. DATA: Fetch user details and their pending submission
  // We join users with kyc_submissions where status is 'pending'
  const { data, error } = await supabase
    .from("users")
    .select(`
      id, 
      email, 
      verification_level,
      kyc_submissions!inner (
        id,
        status,
        document_url,
        full_name,
        created_at
      )
    `)
    .eq("id", userId)
    .eq("kyc_submissions.status", "pending") 
    .maybeSingle();

  // If no pending submission found, just fetch the user basic info
  if (!data) {
    const { data: basicUser } = await supabase
      .from("users")
      .select("id, email, verification_level")
      .eq("id", userId)
      .single();
      
    return NextResponse.json(basicUser);
  }

  return NextResponse.json(data);
}