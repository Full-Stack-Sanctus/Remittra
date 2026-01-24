// app/api/ajos/route.ts
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

    // 1️⃣ Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Check if user is admin in `users` table
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (userDataError) {
      console.error("Error fetching user data:", userDataError);
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 400 });
    }

    const isAdmin = userData?.is_admin ?? false;

    // 3️⃣ Fetch Ajos and contributions
    const { data: ajosData, error: ajosError } = await supabase
      .from("ajos")
      .select(`
        id,
        name,
        created_by,
        cycle_amount,
        cycle_duration,
        current_cycle,
        contributions:user_ajos!inner(
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

    // 4️⃣ Map contributions
    const ajos = ajosData.map((ajo: any) => {
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
        contributions: isAdmin ? ajo.contributions : undefined,
      };
    });

    return NextResponse.json(ajos, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/ajos unexpected error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
