// app/admin/users/page.tsx
"use client";

import UserNavbar from "@/components/layout/UserNavbar";
import useSWR from "swr";
import Link from "next/link";
import { Users, Loader2, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";

type DetailedUser = { 
  id: string; 
  email: string; 
  has_pending_submission: boolean; // Computed field from your backend logic
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
          <p className="text-gray-500">Review user accounts and process KYC document submissions.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="font-medium">Fetching secure records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {users.map((user) => (
              <Link 
                key={user.id} 
                href={`/admin/users/verification/${user.id}`}
                className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-brand transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 group-hover:bg-brand/10 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-brand transition-colors">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="font-black text-gray-800">{user.email}</p>
                    <p className="text-[10px] font-mono text-gray-400 uppercase">UID: {user.id.slice(0, 12)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {user.has_pending_submission ? (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 animate-pulse">
                      <AlertCircle size={14} />
                      <span className="text-[10px] font-black uppercase">Verification Available</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-300 px-4 py-2">
                      <CheckCircle2 size={14} />
                      <span className="text-[10px] font-black uppercase">No Pending Tasks</span>
                    </div>
                  )}
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-brand transition-all group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}