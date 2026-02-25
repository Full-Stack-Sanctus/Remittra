// app/admin/users/verification/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/Button";
import UserNavbar from "@/components/layout/UserNavbar";
import { ShieldCheck, CheckCircle, XCircle, FileText } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VerificationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: user, mutate } = useSWR(`/api/admin/users/verification/${id}`, fetcher);

  const handleAction = async (decision: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/admin/process-kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, status: decision }),
      });
      if (res.ok) {
        mutate(); // Refresh local data
        router.refresh();
      }
    } catch (err) {
      alert("Action failed. Please try again.");
    }
  };

  if (!user) return <div className="p-20 text-center font-black text-gray-400 uppercase tracking-widest">Loading User Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <main className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">User Details</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <div className="bg-brand/5 px-6 py-3 rounded-2xl border border-brand/10">
              <span className="block text-[10px] font-black text-brand uppercase">Current Status</span>
              <span className="text-lg font-black text-gray-700 uppercase">Level {user.verification_level}</span>
            </div>
          </div>

          {user.pending_submission ? (
            <div className="space-y-6">
              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center gap-4">
                <FileText className="text-amber-600" size={32} />
                <div>
                  <h3 className="font-black text-amber-900">Pending KYC Submission</h3>
                  <p className="text-sm text-amber-700">Submitted on {new Date(user.pending_submission.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Approve/Decline Section */}
              <div className="flex gap-4">
                <Button 
                  onClick={() => handleAction("APPROVED")}
                  className="flex-1 bg-green-600 text-white rounded-2xl py-5 font-black flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                >
                  <CheckCircle size={20} /> Approve Submission
                </Button>
                <Button 
                  onClick={() => handleAction("REJECTED")}
                  className="flex-1 bg-white border-2 border-red-100 text-red-500 rounded-2xl py-5 font-black flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                >
                  <XCircle size={20} /> Decline
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
              <ShieldCheck size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">No pending submissions found for this user.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}