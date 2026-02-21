// @/components/user/ajo/PendingRequestsSection.tsx
"use client";

import { useEffect, useState } from "react";
import { Mail, Clock } from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

export default function PendingRequestsSection() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" as "success" | "error" });

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/ajos/memberships");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/ajos/requests/${action}`, {
      method: "POST",
      body: JSON.stringify({ requestId }),
    });
    if (res.ok) {
      setModal({ isOpen: true, title: "Success", message: `Request ${action}ed successfully`, type: "success" });
      fetchRequests();
    }
  };

  if (loading || requests.length === 0) return null;

  return (
    <section>
      <Modal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Clock size={20}/></div>
        <h2 className="text-2xl font-black text-gray-800">Pending Approvals</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((req: any) => (
          <div key={req.id} className="bg-white border-2 border-dashed border-gray-200 p-6 rounded-[2rem] hover:border-brand/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">New Request from</p>
                <p className="text-sm font-black text-gray-800 truncate max-w-[180px]">{req.user_email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleAction(req.id, 'approve')} className="flex-1 bg-brand text-white text-xs py-2 rounded-xl">Accept</Button>
              <button onClick={() => handleAction(req.id, 'reject')} className="flex-1 bg-gray-100 text-gray-600 text-xs py-2 rounded-xl font-bold">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}