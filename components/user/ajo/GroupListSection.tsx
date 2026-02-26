// @/components/user/ajo/GroupListSection.tsx
"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

// Define the simplified enterprise type
interface AjoMembership {
  id: string;
  ajo_name: string;
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
          // We ensure we are mapping the correct ID and Name from your new DB structure
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 w-full bg-gray-100 animate-pulse rounded-[2.5rem]" />
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
            <p className="text-sm text-gray-500 font-medium">Manage your active Ajo memberships</p>
          </div>
        </div>
      </div>

      {memberships.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="text-gray-300" />
          </div>
          <p className="text-gray-400 font-bold">No groups joined via invitation found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberships.map((ajo) => (
            <Link 
              href={`/dashboard/ajo-groups/${ajo.id}`} 
              key={ajo.id} 
              className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand/20 transition-all relative overflow-hidden block"
            >
              {/* Subtle Security Badge Background */}
              <div className="absolute -top-4 -right-4 p-4 text-gray-50 group-hover:text-brand/5 transition-colors">
                <ShieldCheck size={100} />
              </div>

              <div className="relative z-10">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-gray-900 group-hover:text-brand transition-colors">
                    {ajo.ajo_name || "Unnamed Group"}
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    Verified Membership
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <span className="text-xs font-black uppercase tracking-widest text-brand flex items-center gap-2 group-hover:gap-4 transition-all">
                    Manage Contributions <ArrowRight size={18} />
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