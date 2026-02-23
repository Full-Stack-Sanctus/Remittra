"use client";


import Button from "@/components/Button";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { useUser } from "@/context/UserContext";
import Modal from "@/components/Modal";

// SWR Fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Wallet = {
  available: number;
  locked: number;
  total: number;
};

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

const EMPTY_WALLET: Wallet = { available: 0, locked: 0, total: 0 };


export default function AjoSection() {
  
  const { user, loading: userLoading } = useUser();
  const [inviteCode, setInviteCode] = useState("");
  
  // Create Form States
  const [newAjoName, setNewAjoName] = useState("");
  const [cycleAmount, setCycleAmount] = useState("");
  const [cycleDuration, setCycleDuration] = useState("1");
  
  //button
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  
  // 🔹 SWR Data Fetching
  const { data: ajos = [], error, isLoading, mutate } = useSWR(
    user ? "/api/ajos" : null,
    fetcher,
    { refreshInterval: 30000 }
  );
  
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" as "success" | "error" });

  const formatInput = (v: string) => v.replace(/\D/g, "").replace(/^0+/, "");
  const showModal = (title: string, message: string, type: "success" | "error") => setModal({ isOpen: true, title, message, type });
  
  
  // Filter logic
  const createdByMe = useMemo(() => ajos.filter((a: any) => a.is_head), [ajos]);

  /* -------------------------------
      Actions
  --------------------------------*/
  const createAjo = async () => {
    const amt = Number(cycleAmount);
    const dur = Number(cycleDuration);
    if (!newAjoName || amt <= 0 || dur <= 0) return alert("Invalid details");

    setIsCreating(true);
    try {
      const res = await fetch("/api/ajos/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAjoName, cycleAmount: amt, cycleDuration: dur }),
      });

      if (res.ok) {
        setNewAjoName(""); setCycleAmount(""); setCycleDuration("1");
        mutate(); // 🔥 Refresh list immediately
        showModal("Success", "Group created successfully", "success");
      }
    } finally {
      setIsCreating(false);
    }
  };
  
  const generateInviteLink = async (ajoId: string) => {
    try {
      setGeneratingId(ajoId)
      
      const res = await fetch("/api/ajos/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ajoId }),
        credentials: "include",
      });
      
      const data = await res.json();

      if (!res.ok) {
        showModal("Request Failed", data.error || "Something went wrong", "error");
        return;
      }

      showModal(
        `Invite for ${data.groupName}`, 
        "You have successfully created a link, please check your email.", 
        "success"
      );
    } catch (err) {
      showModal("Connection Error", "Check your internet and try again.", "error");
    } finally {
      // Stop loading regardless of success or failure
      setGeneratingId(null)
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
  
  
  

  // 🔹 Guard Clauses for Enterprise UX
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
      <div className="bg-gradient-to-br from-brand to-cyan-500 p-6 rounded-[2rem] text-white shadow-xl flex flex-col gap-6">
        <div>
          <h2 className="font-black text-2xl">Join a Group</h2>
          <p className="text-white/80 text-sm">Have an invite code? Paste it below.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            className="bg-white/20 placeholder-white/60 border-none rounded-2xl px-5 py-3 flex-1 font-bold outline-none" 
            placeholder="Paste token or link..."
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <Button isLoading={isJoining} onClick={handleJoinViaInvite} className="bg-white text-brand font-black px-8 py-3 rounded-2xl">
            Join
          </Button>
        </div>
      </div>

      {/* 2. CREATE GROUP */}
      <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <h2 className="text-xl font-black text-gray-800 mb-6">Start New Ajo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input className="input-style" placeholder="Group Name" value={newAjoName} onChange={e => setNewAjoName(e.target.value)} />
          <input className="input-style" placeholder="Amount (₦)" value={cycleAmount} onChange={e => setCycleAmount(formatInput(e.target.value))} />
          <input className="input-style" placeholder="Days" value={cycleDuration} onChange={e => setCycleDuration(formatInput(e.target.value))} />
          <Button isLoading={isCreating} onClick={createAjo} className="bg-gray-900 text-white font-black rounded-xl p-3">
            Create
          </Button>
        </div>
      </section>

      {/* 3. GROUPS YOU LEAD */}
      <div>
        <SectionHeader title="Groups You Lead" />
        {createdByMe.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {createdByMe.map((ajo: any) => (
              <AjoCard 
                key={ajo.id} 
                ajo={ajo} 
                generatingId={generatingId}
                onInvite={async (id) => {
                  setGeneratingId(id);
                  // Your generateInviteLink logic here...
                  setGeneratingId(null);
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-[2rem] p-12 text-center border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">You haven't created any groups yet.</p>
            <p className="text-xs text-gray-400 mt-1">Use the form above to start your first Ajo.</p>
          </div>
        )}
      </div>
    </div>
  );
}




// Sub-components for cleaner code
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">{title}</h3>
      <div className="h-[1px] w-full bg-gray-100" />
    </div>
  );
}

function AjoCard({ ajo, onInvite, generatingId }: { ajo: AjoRow, onInvite?: (id: string) => void, generatingId: string | null }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]">
      <div className="absolute top-0 right-6 bg-brand/10 text-brand px-3 py-1 rounded-b-lg text-[10px] font-bold">
        Cycle #{ajo.current_cycle}
      </div>
      
      <div>
        <h3 className="text-xl font-black text-gray-800 leading-tight">{ajo.name}</h3>
        <p className="text-brand font-black text-lg">₦{(ajo.cycle_amount ?? 0).toLocaleString()}</p>
      </div>

      <div className="flex gap-2 my-4">
        <div className="badge-gray">Duration: {ajo.cycle_duration}d</div>
        <div className="badge-gray">Status: Active</div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-brand text-white font-black py-3 rounded-xl text-sm">
          {ajo.payout_due ? "PAYOUT DUE" : "CONTRIBUTE"}
        </button>
        {ajo.is_head && onInvite && (
          <Button 
            isLoading={generatingId === ajo.id}
            onClick={() => onInvite(ajo.id)}
            className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200 transition-colors"
            title="Invite Member"
          >
            ➕
          </Button>
        )}
      </div>
      
    </div>
  );
}


function AjoSkeleton() {
  return <div className="p-8 animate-pulse space-y-8">
    <div className="h-40 bg-gray-100 rounded-[2rem]" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-48 bg-gray-100 rounded-[2rem]" />
      <div className="h-48 bg-gray-100 rounded-[2rem]" />
    </div>
  </div>;
}
