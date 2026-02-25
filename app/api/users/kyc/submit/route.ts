// @/app/api/users/kyc/submit/route.ts
import { getSupabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  
  // 1. Get Authenticated User
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse Requested Tier (2 or 3)
  const { tier } = await request.json();

  // 3. Fetch user's passportUrl from the 'users' table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("passportUrl")
    .eq("id", authUser.id)
    .single();

  if (userError || !userData?.passportUrl) {
    return NextResponse.json({ error: "Passport URL not found. Please upload a profile photo first." }, { status: 400 });
  }

  // 4. Insert into kyc_submissions
  const { error: insertError } = await supabase
    .from("kyc_submissions")
    .insert({
      user_id: authUser.id,
      tier_requested: tier,
      id_image_url: userData.passportUrl, // Using passportUrl as requested
      self_url: userData.passportUrl,     // Using passportUrl as requested
      status: "pending",
      submitted_at: new Date().toISOString(),
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Verification submitted successfully" });
}