import { getSupabaseServer } from "./supabaseServer";
import { NextResponse } from "next/server";

export async function withAuth(req: Request, handler: (user: any) => Promise<NextResponse>) {
  const supabaseServer = getSupabaseServer();
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user }, error } = await supabaseServer.auth.getUser(token);

  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Call the actual handler with the authenticated user
  return handler(user);
}

