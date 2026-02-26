"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

// Enterprise standard: Define your types
interface AjoMembership {
  id: string;
  name: string;
  cycle_amount: number;
  cycle_duration: number;
  current_cycle: number;
  your_contribution: number;
}

export default function GroupListSection() {
  const [memberships, setMemberships] = useState<AjoMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/ajos/memberships");
        if (res.ok) {
          const data = await res.json();
          setMemberships(data.memberships || []);
        }
      } catch (error) {
        console.error("Group fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Defensive currency formatter
  const formatCurrency = (amount: number | undefined | null) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount ?? 0); // Using ?? 0 ensures we never call format on null
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 w-full bg-gray-100 animate-pulse rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand/10 text-brand rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Joined Groups</h2>
            <p className="text-sm text-gray-500 font-medium">Your active contributions</p>
          </div>
        </div>
      </div>

      {memberships.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="text-gray-300" />
          </div>
          <p className="text-gray-400 font-bold">No active memberships found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberships.map((ajo) => (
            <Link 
              href={`/dashboard/ajo-groups/${ajo.id}`} 
              key={ajo.id} 
              className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-brand/20 transition-all relative overflow-hidden block"
            >
              {/* Decorative Background Element */}
              <div className="absolute -top-6 -right-6 p-6 text-gray-50 group-hover:text-brand/5 transition-colors">
                <ShieldCheck size={120} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-brand transition-colors">
                      {ajo.name || "Unnamed Group"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-black text-gray-900">
                        {formatCurrency(ajo.cycle_amount)}
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase">/ Cycle</span>
                    </div>
                  </div>
                  <div className="bg-gray-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight">
                    Cycle {ajo.current_cycle ?? 1}
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-gray-50 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Duration</span>
                    <span className="text-sm font-black text-gray-700">{ajo.cycle_duration ?? 0} Days</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                    <span className="text-sm font-black text-green-600 flex items-center gap-1">
                      <ShieldCheck size={14} /> Active
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-brand group-hover:gap-3 flex items-center gap-2 transition-all">
                    Manage Contributions <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}