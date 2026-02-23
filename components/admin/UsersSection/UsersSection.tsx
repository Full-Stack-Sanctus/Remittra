// components/admin/UsersSection/UsersSection.tsx
"use client";

import useSWR from "swr";
import Button from "@/components/Button";
import { useState } from "react";
import Link from "next/link"; // Import Link for navigation
import { ArrowRight } from "lucide-react";

type UserRow = { id: string; email: string; kyc_verified: boolean };

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UsersSection() {
  const { data: users = [], isLoading, mutate } = useSWR<UserRow[]>("/api/users", fetcher);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Take only the first 5 users for the dashboard view
  const previewUsers = users.slice(0, 5);

  const toggleKYC = async (id: string, verified: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch("/api/admin/toggle-kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, verified }),
      });
      if (res.ok) mutate();
    } catch (err) {
      alert("Error toggling KYC");
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">User Email</th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">KYC Status</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-400">Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {previewUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-700">{user.email}</td>
                <td className="px-6 py-4">
                  {user.kyc_verified ? (
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Verified</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">Pending</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    isLoading={togglingId === user.id}
                    onClick={() => toggleKYC(user.id, !user.kyc_verified)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        user.kyc_verified 
                        ? "bg-white border border-red-100 text-red-500 hover:bg-red-50" 
                        : "bg-brand text-white shadow-lg shadow-brand/20"
                    }`}
                  >
                    {user.kyc_verified ? "Revoke" : "Verify"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer Link to Full User Page */}
      <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-center">
        <Link 
          href="/admin/users" 
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand hover:gap-3 transition-all"
        >
          View All Users & KYC Details <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function AdminTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-2xl w-full" />
      ))}
    </div>
  );
}