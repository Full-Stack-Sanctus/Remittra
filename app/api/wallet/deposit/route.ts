import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabaseServer = getSupabaseServer();

    // 1️⃣ Get the authenticated user
    const { data: usersData, error: userError } = await supabaseServer
      .from("users")
      .select("id")
      .limit(1); // demo: pick first user, replace with your auth logic

    if (userError || !usersData?.[0]) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = usersData[0];

    // 2️⃣ Parse request body
    const body = await req.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 3️⃣ Fetch user's wallet
    const { data: wallet, error: walletError } = await supabaseServer
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // 4️⃣ Insert wallet transaction
    const { error: txError } = await supabaseServer
      .from("wallet_transactions")
      .insert({ user_id: user.id, type: "deposit", amount });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 400 });
    }

    // 5️⃣ Update wallet balance
    const { data: updatedWallet, error: updateError } = await supabaseServer
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
