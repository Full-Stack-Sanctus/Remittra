// app/admin/users/verification/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/Button";
import UserNavbar from "@/components/layout/UserNavbar";
import { ShieldCheck, CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VerificationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // isLoading is the modern way to handle the initial fetch state in SWR
  const { data: user, mutate, isLoading } = useSWR(`/api/admin/users/verification/${id}`, fetcher);

  const handleAction = async (decision: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/admin/process-kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, status: decision }),
      });
      if (res.ok) {
        mutate(); 
        router.refresh();
      }
    } catch (err) {
      alert("Action failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-xl">
          
          {isLoading ? (
            <VerificationSkeleton />
          ) : !user ? (
            <div className="py-20 text-center text-gray-400 font-bold">User not found or access denied.</div>
          ) : (
            <>
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">User Details</h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>
                <div className="bg-brand/5 px-6 py-3 rounded-2xl border border-brand/10 w-full md:w-auto">
                  <span className="block text-[10px] font-black text-brand uppercase">Current Status</span>
                  <span className="text-lg font-black text-gray-700 uppercase">Level {user.verification_level}</span>
                </div>
              </div>

              {/* Submission Logic */}
              {user.pending_submission ? (
                <div className="space-y-6">
                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                        <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-amber-900">Pending KYC Submission</h3>
                      <p className="text-sm text-amber-700">
                        Submitted on {new Date(user.pending_submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => handleAction("APPROVED")}
                      className="flex-1 bg-green-600 text-white rounded-2xl py-5 font-black flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                    >
                      <CheckCircle size={20} /> Approve
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
                  <p className="text-gray-500 font-bold">No pending submissions found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// 🔹 The Modern Skeleton Component
function VerificationSkeleton() {
  return (
    <div className="animate-pulse space-y-10">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-gray-100 rounded-lg" />
          <div className="h-4 w-64 bg-gray-50 rounded-md" />
        </div>
        <div className="h-14 w-32 bg-gray-100 rounded-2xl" />
      </div>
      <div className="h-32 w-full bg-gray-50 rounded-[2rem]" />
      <div className="flex gap-4">
        <div className="h-16 flex-1 bg-gray-100 rounded-2xl" />
        <div className="h-16 flex-1 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}