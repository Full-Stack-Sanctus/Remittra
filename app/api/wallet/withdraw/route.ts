import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabaseServer = getSupabaseServer();

    // ⚠️ DEV ONLY
    const userId = "PUT_A_REAL_USER_ID_HERE";

    const { amount } = await req.json();
    const value = Number(amount);

    if (!value || value <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const { data: wallet, error: walletError } = await supabaseServer
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    await supabaseServer.from("wallet_transactions").insert({
      user_id: userId,
      type: "deposit",
      amount: value,
    });

    const { data: updatedWallet } = await supabaseServer
      .from("wallets")
      .update({ total: wallet.total + value })
      .eq("id", wallet.id)
      .select()
      .single();

    return NextResponse.json({
      ok: true,
      newTotalBalance: updatedWallet.total,
      balance: updatedWallet.balance,
      locked: updatedWallet.locked_balance
    });
  } catch (err) {
    console.error("POST /api/wallet:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

