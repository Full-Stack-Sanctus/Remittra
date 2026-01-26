import { getSupabaseServer } from "../lib/supabaseServer";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

// 1. Get the Supabase client (Ensure your helper uses the SERVICE_ROLE_KEY for seeding)
const supabase = await getSupabaseServer();

// Pull admin email from env or fallback to demo
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@demo.com";

/* ----------------------------- Types ------------------------------ */

type AppUserInsert = {
  id: string;
  email: string;
  is_admin: boolean;
  kyc_verified: boolean;
};

type WalletInsert = {
  user_id: string;
  total: number;
  locked_balance: number;
};

/* ----------------------------- Helpers ----------------------------- */

/**
 * restored helper to find or create auth users
 */
async function getOrCreateAuthUser(
  email: string,
  password: string,
): Promise<string> {
  // Try to create the user via Admin Auth API
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  // If successful creation
  if (data?.user?.id) {
    return data.user.id;
  }

  // If user exists (error code usually 'email_exists'), fetch them
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

  if (listError || !listData) {
    throw listError ?? new Error("Failed to list auth users");
  }

  const existingUser = listData.users.find((u) => u.email === email);

  if (!existingUser) {
    throw new Error(`Auth user not found for ${email} and could not be created.`);
  }

  return existingUser.id;
}

/* ----------------------------- Seeder ----------------------------- */

async function seed(): Promise<void> {
  try {
    console.log("🚀 Starting seed...");

    // ---- 1. AUTH USERS ----
    const adminId = await getOrCreateAuthUser(ADMIN_EMAIL, "Admin123!");
    const userId = await getOrCreateAuthUser("user@demo.com", "User123!");

    // ---- 2. APP USERS (public.users table) ----
    const users: AppUserInsert[] = [
      {
        id: adminId,
        email: ADMIN_EMAIL,
        is_admin: true,
        kyc_verified: true,
      },
      {
        id: userId,
        email: "user@demo.com",
        is_admin: false,
        kyc_verified: true,
      },
    ];

    const { error: userErr } = await supabase.from("users").upsert(users);
    if (userErr) throw userErr;

    // ---- 3. WALLETS (public.wallets table) ----
    // Note: 'balance' is a generated column, so we only touch 'total'
    const wallets: WalletInsert[] = [
      { 
        user_id: adminId, 
        total: 100000, 
        locked_balance: 0 
      },
      { 
        user_id: userId, 
        total: 5000, 
        locked_balance: 0 
      },
    ];

    const { error: walletErr } = await supabase
      .from("wallets")
      .upsert(wallets, { onConflict: "user_id" });

    if (walletErr) throw walletErr;

    console.log("✅ Seeding complete");
  } catch (error: any) {
    console.error("❌ Seeder failed:", error.message);
    process.exit(1);
  }
}

seed();