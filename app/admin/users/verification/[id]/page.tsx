// app/admin/users/verification/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/Button";
import UserNavbar from "@/components/layout/UserNavbar";
import { ShieldAlert, CheckCircle, XCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VerificationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: user, mutate } = useSWR(`/api/users/${id}`, fetcher);

  const handleAction = async (status: "APPROVED" | "DECLINED") => {
    const res = await fetch(`/api/admin/verify-submission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, status }),
    });
    if (res.ok) {
      mutate();
      router.refresh();
    }
  };

  if (!user) return <div className="p-10 text-center">Loading details...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <main className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl">
          <h2 className="text-2xl font-black mb-6">User Verification Profile</h2>
          
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400">Email Address</label>
              <p className="text-lg font-bold">{user.email}</p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400">Current Level</label>
              <p className="text-lg font-bold">Level {user.verification_level}</p>
            </div>
          </div>

          {/* Submission Check */}
          {user.pending_submission ? (
            <div className="bg-brand/5 border border-brand/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4 text-brand">
                <ShieldAlert size={24} />
                <h3 className="font-black uppercase tracking-widest text-sm">Pending Submission Detected</h3>
              </div>
              
              {/* Render your KYC document images/details here */}
              <div className="aspect-video bg-gray-100 rounded-2xl mb-6 flex items-center justify-center">
                 <p className="text-gray-400 text-sm italic">[KYC Document Preview]</p>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => handleAction("APPROVED")}
                  className="flex-1 bg-green-600 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-green-700"
                >
                  <CheckCircle size={18} /> Approve Submission
                </Button>
                <Button 
                  onClick={() => handleAction("DECLINED")}
                  className="flex-1 bg-white border-2 border-red-100 text-red-500 rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-red-50"
                >
                  <XCircle size={18} /> Decline
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No pending submissions for this user.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}