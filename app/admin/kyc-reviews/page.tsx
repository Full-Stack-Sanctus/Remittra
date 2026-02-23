// @/app/admin/kyc-reviews/page.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import { CheckIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";

export default function AdminKYCQueue() {
  const { data: pendingUsers, mutate } = useSWR("/api/admin/kyc/pending");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleDecision = async (userId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    const res = await fetch(`/api/admin/kyc/decide`, {
      method: 'POST',
      body: JSON.stringify({ userId, status, reason })
    });
    if (res.ok) {
      setSelectedUser(null);
      mutate(); // Refresh the list
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* List Section */}
      <div className="w-1/3 border-r bg-white overflow-y-auto">
        <div className="p-6 border-b">
          <h1 className="text-xl font-black">KYC Review Queue</h1>
          <p className="text-xs text-gray-500">{pendingUsers?.length || 0} pending applications</p>
        </div>
        {pendingUsers?.map((u: any) => (
          <div 
            key={u.id} 
            onClick={() => setSelectedUser(u)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedUser?.id === u.id ? 'bg-brand/5 border-l-4 border-l-brand' : ''}`}
          >
            <p className="font-bold text-gray-800">{u.full_name}</p>
            <p className="text-xs text-gray-500">Tier 2 -> Tier 3 • {u.submitted_at}</p>
          </div>
        ))}
      </div>

      {/* Review Detail Section */}
      <div className="flex-1 overflow-y-auto p-10">
        {selectedUser ? (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">Reviewing: {selectedUser.full_name}</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleDecision(selectedUser.id, 'REJECTED', 'Blurry ID')}
                  className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleDecision(selectedUser.id, 'APPROVED')}
                  className="px-6 py-2 bg-brand text-white font-black rounded-xl"
                >
                  Approve User
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Image Comparison */}
              <div className="space-y-4">
                <p className="text-xs font-black uppercase text-gray-400">Live Selfie</p>
                <img src={selectedUser.selfie_url} className="rounded-[2rem] border w-full h-80 object-cover" alt="Selfie" />
              </div>
              <div className="space-y-4">
                <p className="text-xs font-black uppercase text-gray-400">Government ID</p>
                <img src={selectedUser.id_card_url} className="rounded-[2rem] border w-full h-80 object-cover" alt="ID Card" />
              </div>
            </div>

            {/* Data Comparison Table */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border">
               <h3 className="font-bold mb-4">Data Cross-Check</h3>
               <table className="w-full text-sm">
                 <thead>
                   <tr className="text-left text-gray-400 border-b">
                     <th className="pb-2">Field</th>
                     <th className="pb-2">User Input</th>
                     <th className="pb-2">ID Document (OCR)</th>
                     <th className="pb-2">Match</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   <DataRow label="Full Name" input={selectedUser.full_name} doc={selectedUser.ocr_name} />
                   <DataRow label="Date of Birth" input={selectedUser.dob} doc={selectedUser.ocr_dob} />
                   <DataRow label="ID Number" input={selectedUser.id_number} doc={selectedUser.ocr_id_number} />
                 </tbody>
               </table>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 italic">
            Select a user from the left to begin verification
          </div>
        )}
      </div>
    </div>
  );
}

function DataRow({ label, input, doc }: any) {
  const isMatch = input === doc;
  return (
    <tr>
      <td className="py-3 font-bold text-gray-600">{label}</td>
      <td className="py-3">{input}</td>
      <td className="py-3">{doc}</td>
      <td className="py-3">
        {isMatch ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌ Mismatch</span>}
      </td>
    </tr>
  );
}