import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabaseServer = getSupabaseServer(); // pass req

    // ✅ Get the current logged-in user
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ available: 0, locked: 0, total: 0 });
    }

    // 2️⃣ Fetch wallet for this user
    const { data: wallet, error: walletError } = await supabaseServer
      .from("wallets")
      .select("available, locked, balance")
      .eq("user_id", user.id)
      .single();

    if (walletError) {
      console.error("Wallet fetch error:", walletError);
      return NextResponse.json({ available: 0, locked: 0, total: 0 });
    }

    return NextResponse.json({
      available: wallet?.available ?? 0,
      locked: wallet?.locked ?? 0,
      total: wallet?.balance ?? 0,
    });
  } catch (err) {
    console.error("GET /api/wallet unexpected error:", err);
    return NextResponse.json({ available: 0, locked: 0, total: 0 }, { status: 500 });
  }
}

