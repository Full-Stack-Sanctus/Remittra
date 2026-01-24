// scripts/seed.ts
import { getSupabaseServer } from "../lib/supabaseServer";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

const supabase = getSupabaseServer();

/* ----------------------------- Types ----------------------------- */

type AppUserInsert = {
  id: string;
  email: string;
  is_admin: boolean;
  kyc_verified: boolean;
  wallet_balance: number;
};

type WalletInsert = {
  user_id: string;
  balance: number;
};

type AjoInsert = {
  name: string;
  created_by: string;
  cycle_amount: number;
  current_cycle: number;
};

type AjoRow = AjoInsert & {
  id: string;
};

type UserAjoInsert = {
  user_id: string;
  ajo_id: string;
  your_contribution: number;
  payout_due: boolean;
};

/* ----------------------------- Helpers ----------------------------- */

async function getOrCreateAuthUser(
  email: string,
  password: string,
): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  // ✅ User created
  if (data?.user?.id) {
    return data.user.id;
  }

  // ⚠️ User already exists → fetch from auth.users
  const { data: listData, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError || !listData) {
    throw listError ?? new Error("Failed to list auth users");
  }

  const users = listData.users as SupabaseAuthUser[];

  const existingUser = users.find((user) => user.email === email);

  if (!existingUser) {
    throw new Error(`Auth user not found for ${email}`);
  }

  return existingUser.id;
}

/* ----------------------------- Seeder ----------------------------- */

async function seed(): Promise<void> {
  try {
    // ---- AUTH USERS ----
    const adminId = await getOrCreateAuthUser("admin@demo.com", "Admin123!");
    const userId = await getOrCreateAuthUser("user@demo.com", "User123!");

    // ---- APP USERS ----
    const users: AppUserInsert[] = [
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
    ];

    await supabase.from("users").upsert(users);

    // ---- WALLETS ----
    const wallets: WalletInsert[] = [
      { user_id: adminId, balance: 100000 },
      { user_id: userId, balance: 5000 },
    ];

    await supabase.from("wallets").upsert(wallets, {
      onConflict: "user_id",
    });

    // ---- AJOS ----
    const ajos: AjoInsert[] = [
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
    ];

    const { data: ajoRows, error: ajoError } = await supabase
      .from("ajos")
      .upsert(ajos, { onConflict: "name" })
      .select("id, name, created_by, cycle_amount, current_cycle");

    if (ajoError || !ajoRows) {
      throw ajoError ?? new Error("Failed to seed ajos");
    }

    const typedAjos = ajoRows as AjoRow[];

    // ---- USER_AJOS ----
    const teamAjo = typedAjos.find((ajo) => ajo.name === "Team Ajo");

    if (teamAjo) {
      const userAjos: UserAjoInsert[] = [
        {
          user_id: userId,
          ajo_id: teamAjo.id,
          your_contribution: 0,
          payout_due: false,
        },
      ];

      await supabase.from("user_ajos").upsert(userAjos, {
        onConflict: "user_id,ajo_id",
      });
    }

    console.log("✅ Seeding complete");
  } catch (error) {
    console.error("❌ Seeder failed:", error);
    process.exit(1);
  }
}

seed();
