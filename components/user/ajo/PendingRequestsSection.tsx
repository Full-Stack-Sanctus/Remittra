// @/components/user/ajo/PendingRequestsSection.tsx
"use client";

import { useEffect, useState } from "react";
import { Mail, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Mail, Clock } from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";


export default function PendingRequestsSection() {
  const [data, setData] = useState({ incomingRequests: [], sentRequests: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch("/api/ajos/memberships");
    if (res.ok) {
      const json = await res.json();
      setData({ incomingRequests: json.incomingRequests, sentRequests: json.sentRequests });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/ajos/requests/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    if (res.ok) fetchData();
  };

  if (loading) return <div className="animate-pulse h-20 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-10">
      {/* SECTION 1: INCOMING (For Admins) */}
      {data.incomingRequests.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="text-amber-500" /> Pending Approvals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.incomingRequests.map((req: any) => (
              <div key={req.id} className="bg-white border p-5 rounded-2xl shadow-sm">
                <p className="text-sm font-medium text-gray-500">{req.user_email} wants to join</p>
                <p className="font-bold text-gray-800 mb-4">{req.ajos?.name}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(req.id, 'approve')} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm">Accept</button>
                  <button onClick={() => handleAction(req.id, 'reject')} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: MY ACTIVITY (Sent Requests) */}
      <section>
        <h2 className="text-xl font-bold mb-4">My Join Requests</h2>
        <div className="bg-white rounded-2xl border overflow-hidden">
          {data.sentRequests.length === 0 ? (
            <p className="p-6 text-gray-400 text-center">No recent activity</p>
          ) : (
            <div className="divide-y">
              {data.sentRequests.map((req: any) => (
                <div key={req.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{req.ajos?.name}</p>
                    <p className="text-xs text-gray-500">Requested on {new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: "bg-amber-100 text-amber-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}