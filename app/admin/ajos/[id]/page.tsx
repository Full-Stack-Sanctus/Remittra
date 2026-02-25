// app/admin/ajos/[id]/page.tsx
import UserNavbar from "@/components/layout/UserNavbar";
import { getSupabaseServer } from "@/lib/supabaseServerClient";
import { notFound } from "next/navigation";

type PageParams = { params: Promise<{ id: string }> };

export default async function AjoDetailPage({ params }: PageParams) {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: ajo } = await supabase
    .from("ajos")
    .select("*, ajo_members(*, users(email))")
    .eq("id", id)
    .single();

  if (!ajo) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <main className="p-8 max-w-5xl mx-auto">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl">
           <header className="mb-10">
              <h1 className="text-4xl font-black text-gray-900">{ajo.name}</h1>
              <p className="text-gray-400 font-mono mt-2">Group ID: {ajo.id}</p>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <StatCard label="Current Cycle" value={ajo.current_cycle} />
              <StatCard label="Total Members" value={ajo.ajo_members?.length || 0} />
              <StatCard label="Status" value="Active" />
           </div>

           {/* Add your member lists or specific group logic here */}
           <h3 className="font-black text-xl mb-4">Member Directory</h3>
           <div className="divide-y divide-gray-50 border rounded-3xl overflow-hidden">
             {ajo.ajo_members?.map((m: any) => (
               <div key={m.id} className="p-4 bg-white flex justify-between">
                  <span className="font-bold text-gray-700">{m.users?.email}</span>
                  <span className="text-[10px] font-black uppercase text-gray-400">Joined: {new Date(m.created_at).toLocaleDateString()}</span>
               </div>
             ))}
           </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</p>
      <p className="text-2xl font-black text-gray-800 mt-1">{value}</p>
    </div>
  );
}