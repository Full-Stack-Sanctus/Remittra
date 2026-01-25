import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = await cookies();

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

  // ✅ Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, cycleAmount, cycleDuration } = await req.json();

  // ✅ Validate inputs
  if (cycleAmount <= 0 || cycleDuration <= 0) {
    return NextResponse.json({ error: "Cycle amount and duration must be greater than 0" }, { status: 400 });
  }

  const totalContribution = cycleAmount * cycleDuration;
  const MIN_TOTAL = 1000; // Example minimum, adjust as needed
  if (totalContribution < MIN_TOTAL) {
    return NextResponse.json({
      error: `Total contribution (cycleAmount x cycleDuration) must be at least ${MIN_TOTAL}`,
    }, { status: 400 });
  }

  // 1️⃣ Create the ajo
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

  // 2️⃣ Add the user as head in user_ajos
  const { error: userAjoError } = await supabase
    .from("user_ajos")
    .insert({
      ajo_id: ajo.id,
      user_id: user.id,
      is_head: true,
    });

  if (userAjoError) {
    return NextResponse.json({ error: userAjoError.message }, { status: 400 });
  }

  // ✅ Success response
  return NextResponse.json({ ok: true, ajo });
}

