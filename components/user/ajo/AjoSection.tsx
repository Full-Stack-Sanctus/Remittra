"use client";

import Button from "@/components/Button";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { useUser } from "@/context/UserContext";
import Modal from "@/components/Modal";
import { Plus, Users, Send, Wallet } from "lucide-react";

// SWR Fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AjoRow = {
  id: string;
  name: string;
  cycle_amount: number;
  cycle_duration: number;
  current_cycle: number;
  joined: boolean;
  payout_due: boolean;
  is_head: boolean;
};

export default function AjoSection() {
  const { user, loading: userLoading } = useUser();
  const [inviteCode, setInviteCode] = useState("");

  // Create Form States
  const [newAjoName, setNewAjoName] = useState("");
  const [cycleAmount, setCycleAmount] = useState("");
  const [cycleDuration, setCycleDuration] = useState("1");

  // Button States
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // 🔹 SWR Data Fetching
  const { data: ajos = [], mutate, isLoading } = useSWR<AjoRow[]>(
    user ? "/api/ajos" : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" as "success" | "error" });

  const formatInput = (v: string) => v.replace(/\D/g, "").replace(/^0+/, "");
  const showModal = (title: string, message: string, type: "success" | "error") => 
    setModal({ isOpen: true, title, message, type });

  // Filter logic
  const createdByMe = useMemo(() => ajos.filter((a) => a.is_head), [ajos]);

  /* -------------------------------
      Actions
  --------------------------------*/
  const createAjo = async () => {
    const amt = Number(cycleAmount);
    const dur = Number(cycleDuration);
    if (!newAjoName || amt <= 0 || dur <= 0) return showModal("Error", "Please provide valid details", "error");

    setIsCreating(true);
    try {
      const res = await fetch("/api/ajos/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAjoName, cycleAmount: amt, cycleDuration: dur }),
      });

      if (res.ok) {
        setNewAjoName(""); setCycleAmount(""); setCycleDuration("1");
        mutate();
        showModal("Success", "Group created successfully", "success");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const generateInviteLink = async (ajoId: string) => {
    setGeneratingId(ajoId);
    try {
      const res = await fetch("/api/ajos/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ajoId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate invite");

      showModal(
        `Invite for ${data.groupName || "Group"}`,
        "Invite link created successfully. Check your email for details.",
        "success"
      );
    } catch (err: any) {
      showModal("Invite Error", err.message || "Connection failed", "error");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleJoinViaInvite = async () => {
    if (!inviteCode) return showModal("Error", "Please enter a code", "error");
    setIsJoining(true);
    try {
      const res = await fetch("/api/ajos/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteCode("");
        mutate();
        showModal("Success", `Request sent to join ${data.groupName}`, "success");
      } else {
        showModal("Failed", data.error, "error");
      }
    } finally {
      setIsJoining(false);
    }
  };

  if (userLoading || isLoading) return <AjoSkeleton />;

  if (!user) {
    return (
      <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-gray-300">
        <p className="text-gray-500 italic">Please sign in to manage your Ajo groups.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 px-4 md:px-0 pb-20">
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        title={modal.title} message={modal.message} type={modal.type}
      />

      {/* 1. JOIN GROUP */}
      <div className="bg-gradient-to-br from-gray-900 to-brand p-8 rounded-[2.5rem] text-white shadow-xl">
        <div className="mb-6">
          <h2 className="font-black text-2xl flex items-center gap-2">
            <Send size={24} className="text-cyan-400" /> Join a Group
          </h2>
          <p className="text-white/60 text-sm">Paste an invite token to request membership.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="bg-white/10 placeholder-white/40 border border-white/10 rounded-2xl px-5 py-3.5 flex-1 font-bold outline-none focus:bg-white/20 transition-all"
            placeholder="Paste code here..."
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <Button isLoading={isJoining} onClick={handleJoinViaInvite} className="bg-white text-black font-black px-10 py-3.5 rounded-2xl hover:scale-105 transition-transform">
            Join Group
          </Button>
        </div>
      </div>

      {/* 2. CREATE GROUP */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Plus size={20}/></div>
          <h2 className="text-xl font-black text-gray-800">Start New Ajo</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input className="input-style" placeholder="Group Name" value={newAjoName} onChange={e => setNewAjoName(e.target.value)} />
          <input className="input-style" placeholder="Amount (₦)" value={cycleAmount} onChange={e => setCycleAmount(formatInput(e.target.value))} />
          <input className="input-style" placeholder="Days per cycle" value={cycleDuration} onChange={e => setCycleDuration(formatInput(e.target.value))} />
          <Button isLoading={isCreating} onClick={createAjo} className="bg-gray-900 text-white font-black rounded-2xl p-4 hover:bg-black transition-colors">
            Create Ajo
          </Button>
        </div>
      </section>

      {/* 3. GROUPS YOU LEAD */}
      <div>
        <SectionHeader title="Managed Groups" icon={<Users size={14}/>} />
        {createdByMe.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {createdByMe.map((ajo) => (
              <AjoCard
                key={ajo.id}
                ajo={ajo}
                generatingId={generatingId}
                onInvite={generateInviteLink}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No groups managed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <h3 className="text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap">{title}</h3>
      </div>
      <div className="h-[1px] w-full bg-gray-100" />
    </div>
  );
}

function AjoCard({ ajo, onInvite, generatingId }: { ajo: AjoRow, onInvite: (id: string) => void, generatingId: string | null }) {
  return (
    <div className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between min-h-[240px]">
      <div className="absolute top-0 right-8 bg-gray-900 text-white px-4 py-1.5 rounded-b-2xl text-[10px] font-black uppercase tracking-widest">
        Cycle #{ajo.current_cycle ?? 1}
      </div>
      
      <div>
        <h3 className="text-2xl font-black text-gray-800 mb-1 group-hover:text-brand transition-colors">{ajo.name}</h3>
        <p className="text-brand font-black text-2xl">
          ₦{(ajo.cycle_amount ?? 0).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-3 my-6">
        <div className="px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-500 border border-gray-100">
          {ajo.cycle_duration} DAYS
        </div>
        <div className="px-3 py-1.5 bg-green-50 rounded-xl text-[10px] font-bold text-green-600 border border-green-100">
          ACTIVE
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-gray-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-black transition-all">
          {ajo.payout_due ? "Claim Payout" : "Contribute"}
        </button>
        {ajo.is_head && (
          <Button
            isLoading={generatingId === ajo.id}
            onClick={() => onInvite(ajo.id)}
            className="bg-brand/10 text-brand p-4 rounded-2xl hover:bg-brand hover:text-white transition-all"
            title="Invite Member"
          >
            <Plus size={20} />
          </Button>
        )}
      </div>
    </div>
  );
}

function AjoSkeleton() {
  return (
    <div className="space-y-10 p-4 md:px-0">
      <div className="h-44 bg-gray-100 rounded-[2.5rem] animate-pulse" />
      <div className="h-32 bg-gray-100 rounded-[2.5rem] animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-60 bg-gray-100 rounded-[2.5rem] animate-pulse" />
        <div className="h-60 bg-gray-100 rounded-[2.5rem] animate-pulse" />
      </div>
    </div>
  );
}