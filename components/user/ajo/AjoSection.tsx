"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { supabaseClient } from "@/lib/supabaseClient";
import Button from "@/components/Button";

import Modal from "@/components/Modal";

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
  const [isFetching, setIsFetching] = useState(true);
  const [wallet, setWallet] = useState<Wallet>(EMPTY_WALLET);
  const [ajos, setAjos] = useState<AjoRow[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  
  // Create Form States
  const [newAjoName, setNewAjoName] = useState("");
  const [cycleAmount, setCycleAmount] = useState("");
  const [cycleDuration, setCycleDuration] = useState("1");
  
  //button
  const [isJoining, setIsJoining] = useState(false);
  
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" as "success" | "error" });
  
  const showModal = (title: string, message: string, type: "success" | "error") => {
    setModal({ isOpen: true, title, message, type });
  };
  
  const formatInput = (v: string) =>
    v.replace(/\D/g, "").replace(/^0+/, "");

  /* ----------------------------------
      Fetch Data
  -----------------------------------*/
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsFetching(true);
      const res = await fetch("/api/ajos", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAjos(data);
      }
    } catch (err) {
      console.error("Failed to load ajos", err);
    } finally {
      setIsFetching(false);
    }
  }, [user?.id]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Sectioning Logic
  const createdByMe = useMemo(() => ajos.filter(a => a.is_head), [ajos]);
  const joinedByMe = useMemo(() => ajos.filter(a => !a.is_head), [ajos]);

  /* -------------------------------
      Actions
  --------------------------------*/
  const refreshAjos = async () => {
    const res = await fetch("/api/ajos", { credentials: "include" }); // Add credentials
    if (res.ok) setAjos(await res.json());
  };

  const createAjo = async () => {
    const amt = Number(cycleAmount);
    const dur = Number(cycleDuration);
    if (!newAjoName || amt <= 0 || dur <= 0) return alert("Invalid details");

    const res = await fetch("/api/ajos/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newAjoName, cycleAmount: amt, cycleDuration: dur }),
    });

    if (res.ok) {
      setNewAjoName(""); setCycleAmount(""); setCycleDuration("1");
      await refreshAjos();
    }
  };

  const generateInviteLink = async (ajoId: string) => {
    try {
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
    }
  };

  const handleJoinViaInvite = async (inviteCode: string) => {
      
    
      
    const error = "Please enter a link or code";
    
    if (!inviteCode) {
        showModal("Request Failed", error || "Something went wrong", "error");
        return;
      }
    
    try {
      setIsJoining(true);
      
      const res = await fetch("/api/ajos/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
    
      const data = await res.json();

      if (!res.ok) {
        showModal("Request Failed", data.error || "Something went wrong", "error");
        return;
      }
      
      showModal(
        `Request to join ${data.groupName}`,
        `You have Successfully made a request to join the group ${data.groupName}.`, 
        "success"
      );
    } catch (err) {
      showModal("Connection Error", "Check your internet and try again.", "error");
    } finally {
      // Stop loading regardless of success or failure
      setIsJoining(false);
    }
  };
    

  const contribute = async (ajoId: string, amount: number) => {
    if (wallet.available < amount) return alert("Insufficient funds"); // Check available
  
    const res = await fetch("/api/ajos/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId }),
    });

    if (res.ok) {
      // Better: Refetch everything to ensure balances are sync'd
      await Promise.all([refreshAjos()]); 
    }
  };
  

  if (userLoading || isFetching) return <AjoSkeleton />;

  return (
    <div className="space-y-10 px-4 md:px-0 pb-20">
      
      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      
      
      {/* 1. JOIN GROUP - Mobile Responsive */}
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
          <Button isLoading={isJoining} onClick={() => handleJoinViaInvite(inviteCode)} className="bg-white text-brand font-black px-8 py-3 rounded-2xl hover:scale-105 transition-transform">
            Join
          </Button>
        </div>
      </div>

      {/* 2. CREATE GROUP - Grid for Mobile */}
      <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <h2 className="text-xl font-black text-gray-800 mb-6">Start New Ajo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input className="input-style" placeholder="Group Name" value={newAjoName} onChange={e => setNewAjoName(e.target.value)} />
          <input className="input-style" placeholder="Amount (₦)" value={cycleAmount} />
          <input className="input-style" placeholder="Days" value={cycleDuration} />
          <button className="bg-gray-900 text-white font-black rounded-xl p-3">Create</button>
        </div>
      </section>

      {/* 3. CREATED BY USER SECTION */}
      {createdByMe.length > 0 && (
        <div>
          <SectionHeader title="Groups You Lead" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {createdByMe.map(ajo => <AjoCard key={ajo.id} ajo={ajo} onInvite={() => generateInviteLink(ajo.id)} />)}
          </div>
        </div>
      )}

      {/* 4. JOINED SECTION */}
      {joinedByMe.length > 0 && (
        <div>
          <SectionHeader title="Member Groups" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {joinedByMe.map(ajo => <AjoCard key={ajo.id} ajo={ajo} />)}
          </div>
        </div>
      )}
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

function AjoCard({ ajo, onInvite }: { ajo: AjoRow, onInvite?: (id: string) => void }) {
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
          <button 
            onClick={() => onInvite(ajo.id)}
            className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200 transition-colors"
            title="Invite Member"
          >
            ➕
          </button>
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

