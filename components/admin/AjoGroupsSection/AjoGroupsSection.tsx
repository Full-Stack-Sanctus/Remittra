// components/admin/AjoGroupsSection/AjoGroupsSection.tsx
"use client";

import useSWR from "swr";
import Button from "@/components/Button";
import { useState } from "react";

type AjoRow = { id: string; name: string; current_cycle: number };

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AjoGroupsSection() {
  const { data: ajos = [], isLoading, mutate } = useSWR<AjoRow[]>("/api/ajos", fetcher);
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  const advanceCycle = async (ajoId: string) => {
    setAdvancingId(ajoId);
    try {
      const res = await fetch("/api/admin/advance-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ajoId }),
      });
      if (res.ok) mutate();
    } catch (err) {
      alert("Error advancing cycle");
    } finally {
      setAdvancingId(null);
    }
  };

  if (isLoading) return <AdminGridSkeleton />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {ajos.map((ajo) => (
        <div key={ajo.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-brand/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-black text-gray-800 text-lg leading-tight">{ajo.name}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mt-1">Ajo ID: {ajo.id.slice(0,8)}</p>
            </div>
            <div className="bg-brand/10 text-brand px-3 py-1 rounded-lg text-[10px] font-black uppercase">
              Cycle {ajo.current_cycle}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button 
              isLoading={advancingId === ajo.id}
              onClick={() => advanceCycle(ajo.id)}
              className="flex-1 bg-gray-900 text-white font-black py-3 rounded-xl text-xs hover:bg-brand transition-colors"
            >
              Advance to Next Cycle
            </Button>
            <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
               ⚙️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-40 bg-gray-100 rounded-[2rem] animate-pulse" />
      <div className="h-40 bg-gray-100 rounded-[2rem] animate-pulse" />
    </div>
  );
}