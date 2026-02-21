// @/components/user/ajo/GroupListSection.tsx
"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, ArrowRight } from "lucide-react";

export default function GroupListSection() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/ajos/memberships");
      if (res.ok) {
        const data = await res.json();
        setMemberships(data.memberships || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 animate-pulse text-brand font-black">Loading Ajo Groups...</div>;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand/10 text-brand rounded-lg"><Users size={20}/></div>
        <h2 className="text-2xl font-black text-gray-800">Groups I've Joined</h2>
      </div>
      
      {memberships.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold">You haven't joined any groups yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberships.map((ajo: any) => (
            <div key={ajo.id} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                <ShieldCheck size={80} />
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-1">{ajo.name}</h3>
                  <p className="text-brand font-black text-lg">₦{ajo.cycle_amount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">
                  Cycle {ajo.current_cycle}
                </div>
              </div>
              
              <div className="flex gap-4 items-center text-gray-500 text-sm font-bold">
                <span>Duration: {ajo.cycle_duration} Days</span>
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="text-green-600">Member Status: Verified</span>
              </div>

              <div className="mt-8 flex items-center justify-between text-brand">
                <span className="font-black text-sm uppercase tracking-widest">View details</span>
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}