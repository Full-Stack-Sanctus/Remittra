import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch Ajos for this user
  const { data: ajos, error: ajosError } = await supabase
    .from("ajos")
    .select("*")
    .or(`created_by.eq.${user.id},id=in.(select ajo_id from ajo_members where user_id.eq.${user.id})`);

  if (ajosError) {
    return NextResponse.json({ error: ajosError.message }, { status: 400 });
  }

  // Optionally map to include joined and your contribution
  const formatted = ajos.map((ajo: any) => ({
    ...ajo,
    joined: ajo.created_by === user.id || false, // adjust based on membership table
    your_contribution: 0, // calculate from contributions table if you have it
    payout_due: false, // calculate logic
  }));

  return NextResponse.json(formatted);
}
