import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Create Supabase server client with type-safe cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookies() as any } // ✅ Type assertion fixes build issue
  );

  // Get logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse request body
  const { amount } = await req.json();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // Fetch wallet for the current user
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  // Check if wallet has enough balance
  if (wallet.balance < amount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  // Insert withdrawal transaction
  const { error: txError } = await supabase
    .from("wallet_transactions")
    .insert({ user_id: user.id, type: "withdrawal", amount });

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 400 });
  }

  // Update wallet balance
  const { error: updateError, data: updatedWallet } = await supabase
    .from("wallets")
    .update({ balance: wallet.balance - amount })
    .eq("id", wallet.id)
    .select()
    .single();

  if (updateError || !updatedWallet) {
    return NextResponse.json({ error: updateError?.message || "Failed to update wallet" }, { status: 400 });
  }

  // Return the new wallet balance
  return NextResponse.json({ ok: true, newBalance: updatedWallet.balance });
}
