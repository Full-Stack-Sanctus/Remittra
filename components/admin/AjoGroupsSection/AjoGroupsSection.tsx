// components/admin/AjoGroupsSection/AjoGroupsSection.tsx
"use client";

import useSWR from "swr";
import Link from "next/link";
import { ArrowRight, Settings, Layers } from "lucide-react";

type AjoRow = { id: string; name: string; current_cycle: number };

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AjoGroupsSection() {
  const { data: ajos = [], isLoading } = useSWR<AjoRow[]>("/api/ajos", fetcher);
  
  // Show only first 4 on dashboard
  const previewAjos = ajos.slice(0, 4);

  if (isLoading) return <AdminGridSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {previewAjos.map((ajo) => (
          <Link 
            key={ajo.id} 
            href={`/admin/ajos/groups/${ajo.id}`}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-brand/30 transition-all hover:shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-gray-800 text-lg group-hover:text-brand transition-colors">{ajo.name}</h3>
                <p className="text-[10px] font-mono text-gray-400 uppercase mt-1">ID: {ajo.id.slice(0, 8)}</p>
              </div>
              <div className="bg-brand/10 text-brand px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                Cycle {ajo.current_cycle}
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-xs font-black text-gray-400 group-hover:text-brand transition-colors uppercase tracking-widest">
              Manage Group <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <Link 
        href="/admin/ajos" 
        className="flex items-center justify-center gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs font-black uppercase text-gray-500 hover:bg-gray-100 transition-all"
      >
        View All Ajo Groups <Layers size={14} />
      </Link>
    </div>
  );
}

function AdminGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {[1, 2].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-[2rem]" />)}
    </div>
  );
}