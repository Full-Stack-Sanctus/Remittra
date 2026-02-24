// components/admin/UsersSection/UsersSection.tsx
"use client";

import useSWR from "swr";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

type UserRow = { 
  id: string; 
  email: string; 
  verification_level: number; 
  has_pending_submission?: boolean 
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UsersSection() {
  const { data: users = [], isLoading } = useSWR<UserRow[]>("/api/users", fetcher);

  const previewUsers = users.slice(0, 5);

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">User Email</th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">Level</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {previewUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700">{user.email}</span>
                    {user.has_pending_submission && (
                      <span className="text-[10px] text-brand font-bold animate-pulse">Pending Submission</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-brand" />
                    <span className="font-black text-gray-600">Lvl {user.verification_level}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/admin/users/verification/${user.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-black hover:bg-brand hover:text-white transition-all"
                  >
                    View <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-2xl w-full" />
      ))}
    </div>
  );
}