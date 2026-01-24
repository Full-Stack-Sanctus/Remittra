import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookies() as any }
    );

    // Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (!user || userError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    const isAdmin = userData?.is_admin;

    // Fetch all Ajo groups and their contributions
    const { data: ajosData, error: ajosError } = await supabase
      .from("ajos")
      .select(`
        id,
        name,
        created_by,
        cycle_amount,
        cycle_duration,
        current_cycle,
        contributions:user_ajos(
          user_id,
          amount,
          payout_due
        )
      `);

    if (ajosError) {
      console.error("Ajos fetch error:", ajosError);
      return NextResponse.json({ error: ajosError.message }, { status: 400 });
    }

    if (!Array.isArray(ajosData)) {
      return NextResponse.json([], { status: 200 });
    }

    const ajos = ajosData.map((ajo: any) => {
      if (isAdmin) {
        // Admin sees all contributions
        return { ...ajo };
      } else {
        // Normal user sees only their own contribution
        const userContribution = ajo.contributions.find(
          (c: any) => c.user_id === user.id
        );
        return {
          id: ajo.id,
          name: ajo.name,
          created_by: ajo.created_by,
          cycle_amount: ajo.cycle_amount,
          cycle_duration: ajo.cycle_duration,
          current_cycle: ajo.current_cycle,
          joined: !!userContribution,
          your_contribution: userContribution?.amount ?? 0,
          payout_due: userContribution?.payout_due ?? false,
        };
      }
    });

    return NextResponse.json(ajos, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/ajos unexpected error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
