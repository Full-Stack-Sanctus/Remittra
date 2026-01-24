import { createServerClient } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = nextCookies(); // ✅ call the function

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore } // pass the object, not the function
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance, locked_balance")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    return NextResponse.json({ available: 0, locked: 0, total: 0 });
  }

  const total = wallet.balance + wallet.locked_balance;

  return NextResponse.json({
    available: wallet.balance,
    locked: wallet.locked_balance,
    total,
  });
}
