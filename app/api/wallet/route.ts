import { getSupabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer();  // pass req

    // ✅ Get the current logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ balance: 0, locked: 0, total: 0 });
    }

    // 2️⃣ Fetch wallet for this user
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("total, locked_balance, balance")
      .eq("user_id", user.id)
      .single();

    if (walletError) {
      console.error("Wallet fetch error:", walletError);
      return NextResponse.json({ balance: 0, locked: 0, total: 0 });
    }
    
    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from("wallets")
        .insert([{ user_id: user.id, balance: 0, locked: 0, total: 0 }])
        .select()
        .single();

      if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
    wallet = newWallet;
    }

    return NextResponse.json({
      balance: wallet?.balance ?? 0,
      locked: wallet?.locked_balance ?? 0,
      total: wallet?.total ?? 0,
    });
  } catch (err) {
    console.error("GET /api/wallet unexpected error:", err);
    return NextResponse.json({ balance: 0, locked: 0, total: 0 }, { status: 500 });
  }
}

