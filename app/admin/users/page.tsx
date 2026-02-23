// app/admin/users/page.tsx
"use client";

import useSWR from "swr";
import { Users, ShieldCheck, FileText } from "lucide-react";

type DetailedUser = { 
  id: string; 
  email: string; 
  kyc_verified: boolean;
  verification_level: number;
  kyc_notes?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useSWR<DetailedUser[]>("/api/users", fetcher);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-gray-900">User Management</h1>
        <p className="text-gray-500">Full list of members and their verification history.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand">
                <Users size={24} />
              </div>
              <div>
                <p className="font-black text-gray-800">{user.email}</p>
                <p className="text-xs text-gray-400">UUID: {user.id}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Level Badge */}
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <ShieldCheck size={16} className="text-brand" />
                <span className="text-xs font-black uppercase">Level {user.verification_level}</span>
              </div>

              {/* Status Badge */}
              <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${
                user.kyc_verified ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"
              }`}>
                {user.kyc_verified ? "Fully Verified" : "Action Required"}
              </div>
            </div>

            <div className="flex-1 md:max-w-xs bg-gray-50 p-3 rounded-xl flex gap-2 items-start">
              <FileText size={16} className="text-gray-400 mt-1 shrink-0" />
              <p className="text-xs text-gray-500 italic">
                {user.kyc_notes || "No internal notes available."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}