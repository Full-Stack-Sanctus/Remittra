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
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (userDataError) {
      console.error("User data fetch error:", userDataError);
      return NextResponse.json({ error: "Could not fetch user data" }, { status: 400 });
    }

    const isAdmin = userData?.is_admin ?? false;

    // Fetch all Ajo groups
    const { data: ajosData, error: ajosError } = await supabase
      .from("ajos")
      .select(`
        id,
        name,
        created_by,
        cycle_amount,
        cycle_duration,
        current_cycle,
        user_ajos:user_ajos(
          user_id,
          amount,
          payout_due
        )
      `)
      .order("name", { ascending: true });

    if (ajosError) {
      console.error("Ajos fetch error:", ajosError);
      return NextResponse.json({ error: ajosError.message }, { status: 400 });
    }

    if (!Array.isArray(ajosData)) {
      return NextResponse.json([], { status: 200 });
    }

    // Map contributions properly
    const ajos = ajosData.map((ajo: any) => {
      const contributions = Array.isArray(ajo.user_ajos) ? ajo.user_ajos : [];

      if (isAdmin) {
        // Admin sees all contributions
        return {
          id: ajo.id,
          name: ajo.name,
          current_cycle: ajo.current_cycle,
          contributions,
        };
      } else {
        // Normal users see only their contribution
        const userContribution = contributions.find((c: any) => c.user_id === user.id);
        return {
          id: ajo.id,
          name: ajo.name,
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
