// app/admin/users/page.tsx
"use client";

import UserNavbar from "@/components/layout/UserNavbar";
import useSWR from "swr";
import { Users, ShieldCheck, FileText, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Navbar at the top */}
      <UserNavbar />

      {/* Main Content Area - naturally scrolls */}
      <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full flex-1">
        
        {/* Header Section */}
        <div className="pt-2">
          <h1 className="text-3xl font-black text-gray-900">User Management</h1>
          <p className="text-gray-500">Full list of members and their verification history.</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="font-medium">Fetching users...</p>
          </div>
        )}

        {/* User List Grid */}
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-hover hover:shadow-md"
            >
              {/* Profile Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand">
                  <Users size={24} />
                </div>
                <div>
                  <p className="font-black text-gray-800 truncate max-w-[200px] md:max-w-none">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">ID: {user.id.slice(0, 8)}...</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Level Badge */}
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <ShieldCheck size={16} className="text-brand" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Level {user.verification_level}
                  </span>
                </div>

                {/* Status Badge */}
                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border tracking-tight ${
                  user.kyc_verified 
                    ? "bg-green-50 border-green-100 text-green-600" 
                    : "bg-red-50 border-red-100 text-red-600"
                }`}>
                  {user.kyc_verified ? "Fully Verified" : "Action Required"}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="flex-1 md:max-w-xs bg-gray-50 p-3 rounded-xl flex gap-2 items-start border border-gray-100">
                <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  {user.kyc_notes || "No internal notes available."}
                </p>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {!isLoading && users.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-400">No users found in the database.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}