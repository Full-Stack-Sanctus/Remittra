// seed.ts
import { getSupabaseServer } from "../lib/supabaseServer";

const supabaseServer = getSupabaseServer(); // uses service_role key

async function seed() {
  try {
    // ----- CREATE USERS VIA AUTH -----
    const { data: adminData, error: adminError } =
      await supabaseServer.auth.admin.createUser({
        email: "admin@demo.com",
        password: "Admin123!",
        email_confirm: true,
      });

    if (adminError) {
      if ((adminError as any).statusCode === 400) {
        console.log("Admin already exists, skipping creation");
      } else throw adminError;
    }

    const { data: userData, error: userError } =
      await supabaseServer.auth.admin.createUser({
        email: "user@demo.com",
        password: "User123!",
        email_confirm: true,
      });

    if (userError) {
      if ((userError as any).statusCode === 400) {
        console.log("User already exists, skipping creation");
      } else throw userError;
    }

    // ----- GET OR FALLBACK TO EXISTING USER IDS -----
    const adminId =
      adminData?.user?.id ??
      (
        await supabaseServer
          .from("users")
          .select("id")
          .eq("email", "admin@demo.com")
          .single()
      ).data.id;

    const userId =
      userData?.user?.id ??
      (
        await supabaseServer
          .from("users")
          .select("id")
          .eq("email", "user@demo.com")
          .single()
      ).data.id;

    // ----- UPSERT INTO USERS TABLE -----
    await supabaseServer.from("users").upsert([
      {
        id: adminId,
        email: "admin@demo.com",
        kyc_verified: true,
        is_admin: true,
        wallet_balance: 100000,
      },
      {
        id: userId,
        email: "user@demo.com",
        kyc_verified: true,
        is_admin: false,
        wallet_balance: 5000,
      },
    ]);

    // ----- UPSERT INTO WALLETS TABLE -----
    await supabaseServer.from("wallets").upsert([
      { user_id: adminId, balance: 100000 },
      { user_id: userId, balance: 5000 },
    ]);

    // ----- UPSERT INTO AJOS TABLE -----
    const { data: ajosData } = await supabaseServer
      .from("ajos")
      .upsert([
        { name: "Team Ajo", created_by: adminId, cycle_amount: 1000, current_cycle: 1 },
        { name: "Weekend Ajo", created_by: adminId, cycle_amount: 500, current_cycle: 2 },
      ])
      .select("*");

    // ----- OPTIONAL: INITIAL USER_AJOS -----
    const teamAjoId = ajosData?.find((a: any) => a.name === "Team Ajo")?.id;
    if (teamAjoId) {
      await supabaseServer.from("user_ajos").upsert([
        { user_id: userId, ajo_id: teamAjoId, your_contribution: 0, payout_due: false },
      ]);
    }

    console.log("Seeding complete ✅");
  } catch (err) {
    console.error("Seeder error:", err);
  }
}

seed();
