import { createServerClient } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = nextCookies(); // ✅ call the function

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: ajos } = await supabase
    .from("ajos")
    .select(`
      id, name, created_by, cycle_amount, cycle_duration, current_cycle,
      contributions:user_ajo_contributions(amount, payout_due, user_id)
    `);

  const result = ajos.map((ajo: any) => {
    const contribution = ajo.contributions?.find(
      (c: any) => c.user_id === user.id
    );
    return {
      id: ajo.id,
      name: ajo.name,
      created_by: ajo.created_by,
      cycle_amount: ajo.cycle_amount,
      cycle_duration: ajo.cycle_duration,
      current_cycle: ajo.current_cycle,
      joined: !!contribution,
      your_contribution: contribution?.amount || 0,
      payout_due: contribution?.payout_due || false,
    };
  });

  return NextResponse.json(result);
}
