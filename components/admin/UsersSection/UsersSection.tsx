// components/admin/UsersSection/UsersSection.tsx
"use client";

import useSWR from "swr";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

type UserRow = { 
  id: string; 
  email: string; 
  verification_level: number; 
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
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">Verification Level</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {previewUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-700">{user.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 bg-gray-50 w-fit px-3 py-1 rounded-lg border border-gray-100">
                    <Shield size={14} className="text-brand" />
                    <span className="font-black text-gray-600 text-xs">Level {user.verification_level}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/admin/users/verification/${user.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-xs font-black shadow-lg shadow-brand/20 hover:scale-105 transition-all"
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-center">
        <Link 
          href="/admin/users" 
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand hover:gap-3 transition-all"
        >
          View All Users <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function AdminTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-2xl w-full" />
      ))}
    </div>
  );
}