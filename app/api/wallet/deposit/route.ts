import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, amount } = await req.json();
  const supabaseServer = getSupabaseServer();
  const { data: wallet } = await supabaseServer
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (!wallet)
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

  await supabaseServer
    .from("wallet_transactions")
    .insert({ user_id: userId, type: "deposit", amount });
  await supabaseServer
    .from("wallets")
    .update({ balance: wallet.balance + amount })
    .eq("id", wallet.id);

  return NextResponse.json({ ok: true, newBalance: wallet.balance + amount });
}
