// app/api/wallet/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  // Create Supabase server client with type-safe cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookies() as any, // ✅ Type assertion fixes build issue
    }
  );

  // Get the current logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch wallet for the current user
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("balance, locked, available")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  // Return wallet data safely
  return NextResponse.json({
    available: wallet.available ?? 0,
    locked: wallet.locked ?? 0,
    total: wallet.balance ?? 0,
  });
}
