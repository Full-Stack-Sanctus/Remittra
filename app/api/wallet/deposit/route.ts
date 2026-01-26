// app/api/wallet/deposit/route.ts
import { getSupabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();

    // ✅ Auth via cookies
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount } = await req.json();
    const amt = Number(amount);

    if (!amt || amt <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Fetch wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Record transaction
    const { error: txError } = await supabase
      .from("wallet_transactions")
      .insert({
        user_id: user.id,
        type: "deposit",
        amount: amt,
      });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 400 });
    }

    // Update wallet
    const newBalance = wallet.total + amt;

    const { data: updatedWallet, error: updateError } = await supabase
      .from("wallets")
      .update({ total: newBalance })
      .eq("id", wallet.id)
      .select("balance")
      .single();

    if (updateError || !updatedWallet) {
      return NextResponse.json(
        { error: updateError?.message || "Failed to update wallet" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      newTotalBalance: updatedWallet.total,
      newTotalBalance: updatedWallet.total,
      locked: updatedWallet.locked_balance
    });
  } catch (err) {
    console.error("Deposit error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
