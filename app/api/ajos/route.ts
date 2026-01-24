// app/api/ajos/contribute/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ajoId } = await req.json();
  if (!ajoId) return NextResponse.json({ error: "Ajo ID required" }, { status: 400 });

  // Insert contribution transaction (you can expand to deduct wallet if needed)
  const { error: contribError } = await supabase.from("ajo_contributions").insert({
    ajo_id: ajoId,
    user_id: user.id,
    amount: 0, // Replace with actual contribution if needed
  });

  if (contribError) return NextResponse.json({ error: contribError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
