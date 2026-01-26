// /app/api/deposit/route.ts (or your specific route path)
import { withAuth } from "@/lib/withAuth";
import { getSupabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    // 1. Await the server client to ensure session/cookies are captured
    const supabase = await getSupabaseServer();
    
    try {
      const body = await req.json();
      const amount = Number(body.amount);

      if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      // 2. Fetch the wallet
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (walletError || !wallet) {
        return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
      }

      // 3. Record the transaction
      const { error: txError } = await supabase
        .from("wallet_transactions")
        .insert({ 
          user_id: user.id, 
          type: "deposit", 
          amount: amount 
        });

      if (txError) {
        return NextResponse.json({ error: txError.message }, { status: 400 });
      }

      // 4. Update the wallet balance
      const newBalance = wallet.balance + amount;
      
      const { data: updatedWallet, error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
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

    } catch (parseError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
  });
}