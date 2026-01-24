// scripts/seed.ts
import { getSupabaseServer } from "../lib/supabaseServer";
import type { AuthError } from "@supabase/supabase-js";

const supabaseServer = getSupabaseServer(); // uses service_role key

type AjoRow = {
  id: string;
  name: string;
  created_by: string;
  cycle_amount: number;
  current_cycle: number;
};

async function createUserIfNotExists(
  email: string,
  password: string
): Promise<string> {
  const { data, error } = await supabaseServer.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const authError = error as AuthError;

    if (authError.status === 400) {
      // User already exists → fetch from users table
      const { data: existingUser, error: fetchError } =
        await supabaseServer
          .from("users")
          .select("id")
          .eq("email", email)
          .single();

      if (fetchError || !existingUser) {
        throw fetchError ?? new Error("User exists but not found in users table");
      }

      return existingUser.id;
    }

    throw error;
  }

  if (!data.user) {
    throw new Error("User creation failed without error");
  }

  return data.user.id;
}

async function seed(): Promise<void> {
  try {
    // ----- CREATE USERS -----
    const adminId = await createUserIfNotExists(
      "admin@demo.com",
      "Admin123!"
    );

    const userId = await createUserIfNotExists(
      "user@demo.com",
      "User123!"
    );

    // ----- USERS TABLE -----
    await supabaseServer.from("users").upsert([
      {
        id: adminId,
        email: "admin@demo.com",
        is_admin: true,
        kyc_verified: true,
        wallet_balance: 100000,
      },
      {
        id: userId,
        email: "user@demo.com",
        is_admin: false,
        kyc_verified: true,
        wallet_balance: 5000,
      },
    ]);

    // ----- WALLETS -----
    await supabaseServer.from("wallets").upsert([
      { user_id: adminId, balance: 100000 },
      { user_id: userId, balance: 5000 },
    ]);

    // ----- AJOS -----
    const { data: ajosData, error: ajosError } =
      await supabaseServer
        .from("ajos")
        .upsert<AjoRow>([
          {
            name: "Team Ajo",
            created_by: adminId,
            cycle_amount: 1000,
            current_cycle: 1,
          },
          {
            name: "Weekend Ajo",
            created_by: adminId,
            cycle_amount: 500,
            current_cycle: 2,
          },
        ])
        .select();

    if (ajosError) {
      throw ajosError;
    }

    const teamAjo = ajosData?.find(
      (ajo) => ajo.name === "Team Ajo"
    );

    if (teamAjo) {
      await supabaseServer.from("user_ajos").upsert([
        {
          user_id: userId,
          ajo_id: teamAjo.id,
          your_contribution: 0,
          payout_due: false,
        },
      ]);
    }

    console.log("Seeding complete ✅");
  } catch (error) {
    console.error("Seeder error:", error);
    process.exit(1);
  }
}

seed();
