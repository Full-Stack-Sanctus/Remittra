// app/api/wallet/withdraw/route.ts
import { getSupabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();

    // ✅ Get the current logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ balance: 0, locked: 0, total: 0 });
    }
    
    
    const { amount } = await req.json();
    const value = Number(amount);

    if (!value || value <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount: value,
    });

    const { data: updatedWallet } = await supabase
      .from("wallets")
      .update({ total: supabaseServer.rpc('increment', { x: value }) })
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

