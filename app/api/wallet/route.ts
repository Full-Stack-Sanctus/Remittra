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

    if (walletError) {
      console.error("Wallet fetch error:", walletError);
      return NextResponse.json({ error: walletError.message }, { status: 400 });
    }

    if (!wallet) {
      return NextResponse.json({ available: 0, locked: 0, total: 0 });
    }

    return NextResponse.json({
      available: wallet.available ?? 0,
      locked: wallet.locked ?? 0,
      total: wallet.balance ?? 0,
    });
  } catch (err: any) {
    console.error("GET /api/wallet unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
