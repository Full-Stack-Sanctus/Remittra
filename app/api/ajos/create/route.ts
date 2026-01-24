import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, cycleAmount, cycleDuration } = await req.json();

  const { data: ajo, error: ajoError } = await supabase
    .from("ajos")
    .insert({
      name,
      created_by: user.id,
      cycle_amount: cycleAmount,
      cycle_duration: cycleDuration,
      current_cycle: 1,
    })
    .select()
    .single();

  if (ajoError) {
    return NextResponse.json({ error: ajoError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, ajo });
}
