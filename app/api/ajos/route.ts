import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseServer = getSupabaseServer();

    // 1️⃣ Get logged-in user (demo: pick first user)
    const { data: usersData, error: userError } = await supabaseServer
      .from("users")
      .select("id, is_admin")
      .limit(1);

    if (userError) {
      console.error("Error fetching user info:", userError);
      return NextResponse.json({ error: "Unable to fetch user" }, { status: 400 });
    }

    const user = usersData?.[0];
    const isAdmin = user?.is_admin ?? false;

    // 2️⃣ Fetch all Ajo groups with contributions
    const { data: ajosData, error: ajosError } = await supabaseServer
      .from("ajos")
      .select(`
        id,
        name,
        current_cycle,
        user_ajos:user_ajos(
          user_id,
          your_contribution,
          payout_due
        )
      `)
      .order("name", { ascending: true });

    if (ajosError) {
      console.error("Error fetching Ajo groups:", ajosError);
      return NextResponse.json({ error: ajosError.message }, { status: 400 });
    }

    if (!Array.isArray(ajosData)) {
      return NextResponse.json([], { status: 200 });
    }

    // 3️⃣ Map contributions properly
    const ajos = ajosData.map((ajo: any) => {
      const contributions = Array.isArray(ajo.user_ajos) ? ajo.user_ajos : [];

      if (isAdmin) {
        return {
          id: ajo.id,
          name: ajo.name,
          current_cycle: ajo.current_cycle,
          contributions,
        };
      } else {
        const userContribution = contributions.find((c: any) => c.user_id === user.id);
        return {
          id: ajo.id,
          name: ajo.name,
          current_cycle: ajo.current_cycle,
          joined: !!userContribution,
          your_contribution: userContribution?.your_contribution ?? 0,
          payout_due: userContribution?.payout_due ?? false,
        };
      }
    });

    console.log("User info:", user);
    console.log("Is admin:", isAdmin);
    console.log("Ajos raw data:", ajosData);

    return NextResponse.json(ajos, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
