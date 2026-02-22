import { getSupabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer();

    // 1. Get the current logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ balance: 0, locked: 0, total: 0 });
    }

    // 2. Fetch wallet using maybeSingle() 
    // This allows the code to continue even if the row doesn't exist yet
    let { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("total, locked_balance, balance")
      .eq("user_id", user.id)
      .maybeSingle(); 

    if (walletError) {
      console.error("Database error:", walletError);
      return NextResponse.json({ balance: 0, locked: 0, total: 0 }, { status: 500 });
    }

    // 3. If wallet is null, create it now
    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from("wallets")
        .insert([{ 
          user_id: user.id, 
          balance: 0, 
          locked_balance: 0, // Ensure column names match your DB
          total: 0 
        }])
        .select()
        .single();

      if (createError) {
        console.error("Error creating wallet:", createError);
        return NextResponse.json({ error: "Failed to initialize wallet" }, { status: 500 });
      }
      wallet = newWallet;
    }

    // 4. Return the data
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