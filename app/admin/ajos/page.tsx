// app/admin/ajos/page.tsx
"use client";

import UserNavbar from "@/components/layout/UserNavbar";
import useSWR from "swr";
import Link from "next/link";
import Button from "@/components/Button";
import { useState } from "react";
import { Settings, Users, ChevronRight } from "lucide-react";

type AjoRow = { id: string; name: string; current_cycle: number; member_count?: number };
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AjoManagementPage() {
  const { data: ajos = [], mutate, isLoading } = useSWR<AjoRow[]>("/api/ajos", fetcher);
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  const advanceCycle = async (ajoId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the details page
    setAdvancingId(ajoId);
    try {
      const res = await fetch("/api/admin/advance-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ajoId }),
      });
      if (res.ok) mutate();
    } finally {
      setAdvancingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserNavbar />
      <main className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ajo Management</h1>
          <p className="text-gray-500">Oversee contribution circles and cycle progression.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {ajos.map((ajo) => (
            <div key={ajo.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:border-brand/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand/5 text-brand rounded-2xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-black text-gray-800 text-lg">{ajo.name}</h3>
                  <p className="text-xs font-mono text-gray-400 uppercase">UID: {ajo.id}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 text-xs font-black uppercase">
                   Cycle {ajo.current_cycle}
                </div>
                
                <Button 
                  isLoading={advancingId === ajo.id}
                  onClick={(e) => advanceCycle(ajo.id, e)}
                  className="bg-gray-900 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-brand transition-all"
                >
                  Advance Cycle
                </Button>

                <Link 
                  href={`/admin/ajos/${ajo.id}`}
                  className="p-2 bg-gray-50 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all"
                >
                  <Settings size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}