// @/components/user/ajo/PendingRequestsSection.tsx
"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle2, XCircle, Mail } from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";


export default function PendingRequestsSection() {
  const [data, setData] = useState({ incomingRequests: [], sentRequests: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/ajos/memberships");
      if (res.ok) {
        const json = await res.json();
        setData({
          incomingRequests: json.incomingRequests || [],
          sentRequests: json.sentRequests || []
        });
      }
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    } finally {
      setLoading(false);
    }
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

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-[2rem] w-full" />;

  return (
    <div className="space-y-12">
      {/* SECTION 1: INCOMING REQUESTS (Admin View) */}
      {data.incomingRequests.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Clock size={20}/></div>
            <h2 className="text-2xl font-black text-gray-800">Pending Approvals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.incomingRequests.map((req: any) => (
              <div key={req.id} className="bg-white border-2 border-dashed border-gray-200 p-6 rounded-[2rem] hover:border-brand/40 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Join Request for {req.ajos?.name}</p>
                    <p className="text-sm font-black text-gray-800 truncate max-w-[180px]">{req.user_email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(req.id, 'approve')} 
                    className="flex-1 bg-brand bg-black text-white text-xs py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, 'reject')} 
                    className="flex-1 bg-gray-100 text-gray-600 text-xs py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: MY SENT REQUESTS (User View) */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CheckCircle2 size={20}/></div>
          <h2 className="text-2xl font-black text-gray-800">My Activity</h2>
        </div>
        <div className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden">
          {data.sentRequests.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 font-bold">No sent requests found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.sentRequests.map((req: any) => (
                <div key={req.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="font-black text-gray-800">{req.ajos?.name || "Unknown Group"}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      {/* SAFE DATE CHECK */}
                      Requested: {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Date unavailable'}
                    </p>
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
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-600 border-amber-200",
    approved: "bg-green-100 text-green-600 border-green-200",
    declined: "bg-red-100 text-red-600 border-red-200",
  };
  
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}