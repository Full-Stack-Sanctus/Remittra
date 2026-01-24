// app/api/ajos/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Create Supabase server-side client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookies() as any }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (assumes `users` table has `is_admin` column)
    const { data: userData, error: userFetchError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (userFetchError || !userData) {
      return NextResponse.json({ error: "Unable to fetch user role" }, { status: 400 });
    }

    const isAdmin = userData.is_admin === true;

    // Fetch all ajos with contributions (LEFT JOIN)
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

    if (!Array.isArray(ajosData)) return NextResponse.json([], { status: 200 });

    // Map ajos for user/admin
    const ajos = ajosData.map((ajo: any) => {
      // Find current user's contribution (for normal users)
      const userContribution = ajo.contributions?.find(
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
        contributions: isAdmin ? ajo.contributions : undefined, // admin sees all contributions
      };
    });

    return NextResponse.json(ajos, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/ajos unexpected error:", err);
    return NextResponse.json([], { status: 200 }); // always return array
  }
}
