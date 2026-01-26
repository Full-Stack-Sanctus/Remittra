import { getSupabaseServer } from "../lib/supabaseServer";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

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
  total: number;         // ✅ Use 'total' instead of 'balance'
  locked_balance: number; // ✅ Added this to be explicit
};

// ... (other types stay the same)

/* ----------------------------- Helpers ----------------------------- */

// (getOrCreateAuthUser helper stays the same)

/* ----------------------------- Seeder ----------------------------- */

async function seed(): Promise<void> {
  try {
    // ---- AUTH USERS ----
    const adminId = await getOrCreateAuthUser(ADMIN_EMAIL, "Admin123!");
    const userId = await getOrCreateAuthUser("user@demo.com", "User123!");

    // ---- APP USERS ----
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

    await supabase.from("users").upsert(users);

    // ---- WALLETS ----
    // ⚠️ CRITICAL: Do NOT insert into 'balance'. Insert into 'total'.
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

    // ---- AJOS ----
    // ... (rest of the Ajo seeding logic is fine as long as table names match)

    console.log("✅ Seeding complete");
  } catch (error) {
    console.error("❌ Seeder failed:", error);
    process.exit(1);
  }
}

seed();