import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    console.log("AUTH ERROR", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, cycleAmount, cycleDuration } = await req.json();

  const { data, error: insertError } = await supabase
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

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, ajo: data });
}
