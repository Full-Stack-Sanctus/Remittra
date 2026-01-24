// app/api/wallet/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookies() as any }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("balance, locked, available")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    return NextResponse.json({
      available: wallet.available ?? 0,
      locked: wallet.locked ?? 0,
      total: wallet.balance ?? 0,
    });
  } catch (err: any) {
    console.error("GET /api/wallet error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookies() as any }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();
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

    if (wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const { error: txError } = await supabase
      .from("wallet_transactions")
      .insert({ user_id: user.id, type: "withdrawal", amount });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 400 });
    }

    const { data: updatedWallet, error: updateError } = await supabase
      .from("wallets")
      .update({ balance: wallet.balance - amount })
      .eq("id", wallet.id)
      .select()
      .single();

    if (updateError || !updatedWallet) {
      return NextResponse.json({ error: updateError?.message || "Failed to update wallet" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, newBalance: updatedWallet.balance });
  } catch (err: any) {
    console.error("POST /api/wallet error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
