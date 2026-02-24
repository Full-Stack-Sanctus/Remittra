// app/admin/users/page.tsx
"use client";

import UserNavbar from "@/components/layout/UserNavbar";
import useSWR from "swr";
import { Users, ShieldCheck, FileText, Loader2, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

type DetailedUser = { 
  id: string; 
  email: string; 
  kyc_status?: string; // Made optional to prevent crashes if missing
  verification_level: number;
  kyc_notes?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useSWR<DetailedUser[]>("/api/users", fetcher);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserNavbar />

      <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full flex-1">
        
        <div className="pt-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500">Monitoring verification levels and KYC compliance.</p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="font-medium">Loading records...</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => {
            // Normalize status for comparison
            const status = user.kyc_status?.toUpperCase() || "NONE";

            return (
              <div 
                key={user.id} 
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-brand/20 transition-all"
              >
                {/* Profile Section */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand/5 rounded-2xl flex items-center justify-center text-brand">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="font-black text-gray-800">{user.email}</p>
                    <p className="text-[10px] font-mono text-gray-400 uppercase">UID: {user.id.slice(0, 8)}</p>
                  </div>
                </div>

                {/* Status Logic Section */}
                <div className="flex flex-wrap gap-3 items-center">
                  {/* Level Display */}
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <ShieldCheck size={16} className="text-brand" />
                    <span className="text-xs font-black uppercase">
                      Level {user.verification_level}
                    </span>
                  </div>

                  {/* KYC Status Badge */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase border tracking-wide ${
                    status === 'FULL' 
                      ? "bg-green-50 border-green-100 text-green-600" 
                      : status === 'PARTIAL'
                      ? "bg-amber-50 border-amber-100 text-amber-600"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}>
                    {status === 'FULL' ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>KYC Completed</span>
                      </>
                    ) : status === 'PARTIAL' ? (
                      <>
                        <AlertCircle size={12} />
                        <span>Action Required</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle size={12} />
                        <span>No Verification</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="flex-1 md:max-w-xs bg-gray-50/50 p-3 rounded-xl flex gap-2 items-start border border-dashed border-gray-200">
                  <FileText size={16} className="text-gray-300 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-500 italic leading-relaxed">
                    {user.kyc_notes || "No internal logs available."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {!isLoading && users.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-medium">No users found.</p>
          </div>
        )}
      </main>
    </div>
  );
}