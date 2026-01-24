import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookies() as any }
    );

    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = data.user;

    const body = await req.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
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

    const { error: txError } = await supabase
      .from("wallet_transactions")
      .insert({ user_id: user.id, type: "deposit", amount });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 400 });
    }

    const { data: updatedWallet, error: updateError } = await supabase
      .from("wallets")
      .update({ balance: wallet.balance + amount })
      .eq("id", wallet.id)
      .select()
      .single();

    if (updateError || !updatedWallet) {
      return NextResponse.json(
        { error: updateError?.message || "Failed to update wallet" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, newBalance: updatedWallet.balance });
  } catch (err: any) {
    console.error("POST /api/wallet error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
