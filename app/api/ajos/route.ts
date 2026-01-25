import { NextResponse, NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServerClient"; // Using your existing path

export async function GET(req: NextRequest) {
  try {
    // 1. Await the client creation so it can read cookies
    const supabase = await getSupabaseServer(); 

    // 2. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ... (rest of your admin/non-admin logic remains the same)
    const { data: userData } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    const isAdmin = !!userData?.is_admin;

    if (isAdmin) {
        const { data, error } = await supabase
          .from("ajos")
          .select(`id, name, current_cycle, user_ajos(user_id, your_contribution, payout_due, is_head)`)
          .order("name", { ascending: true });
        
        return NextResponse.json(data || []);
    } else {
        // Optimized fetch for non-admins
        const { data, error } = await supabase
          .from("user_ajos")
          .select(`your_contribution, payout_due, is_head, ajos(id, name, current_cycle)`)
          .eq("user_id", user.id);

        const flattened = (data || []).map((item: any) => ({
            ...item.ajos,
            your_contribution: item.your_contribution,
            payout_due: item.payout_due,
            is_head: item.is_head
        }));

        return NextResponse.json(flattened);
    }

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}