"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useUser } from "@/hooks/useUser";
import Button from "@/components/Button";

type Wallet = {
  available: number;
  locked: number;
  total: number;
};

type AjoRow = {
  id: string;
  name: string;
  created_by: string;
  cycle_amount: number;
  cycle_duration: number;
  current_cycle: number;
  joined: boolean;
  your_contribution: number;
  payout_due: boolean;
};

const EMPTY_WALLET: Wallet = { available: 0, locked: 0, total: 0 };


export default function AjoSection() {
  const { user, loading } = useUser();
  const [isFetching, setIsFetching] = useState(true);
  const [wallet, setWallet] = useState<Wallet>(EMPTY_WALLET);
  const [ajos, setAjos] = useState<AjoRow[]>([]);
  const [newAjoName, setNewAjoName] = useState("");
  const [cycleAmount, setCycleAmount] = useState("");
  const [cycleDuration, setCycleDuration] = useState("1");
  const [inviteCode, setInviteCode] = useState("");
  
  const formatInput = (v: string) =>
    v.replace(/\D/g, "").replace(/^0+/, "");

  /* ----------------------------------
      Fetch Data
  -----------------------------------*/
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [walletRes, ajosRes] = await Promise.all([
          fetch("/api/wallet"),
          fetch("/api/ajos", { credentials: "include" }),
        ]);
        if (!walletRes.ok || !ajosRes.ok) throw new Error("Fetch failed");
        const walletData = await walletRes.json();
        const ajosData = await ajosRes.json();
        if (!cancelled) {
          setWallet(walletData ?? EMPTY_WALLET);
          setAjos(ajosData ?? []);
        }
      } catch {
        if (!cancelled) {
          setWallet(EMPTY_WALLET);
          setAjos([]);
        }
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [user?.id]);

  /* -------------------------------
      Actions
  --------------------------------*/
  const refreshAjos = async () => {
    const res = await fetch("/api/ajos");
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
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invite failed");

      // Copies the generated link to clipboard
      await navigator.clipboard.writeText(data.inviteLink);
      alert("Invite link copied! Share it with the person you want to add.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleJoinViaInvite = async () => {
    if (!inviteCode) return alert("Please enter a link or code");
    const token = inviteCode.includes("token=") ? inviteCode.split("token=")[1] : inviteCode;
    
    const res = await fetch("/api/ajos/join-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    
    if (res.ok) {
      alert("Successfully joined the group!");
      setInviteCode("");
      await refreshAjos();
    } else {
      alert("Could not join. Link may be expired.");
    }
  };

  const contribute = async (ajoId: string, amount: number) => {
    if (wallet.locked < amount) return alert("Insufficient locked funds");
    const res = await fetch("/api/ajos/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId }),
    });
    if (res.ok) {
      setWallet(w => ({ ...w, locked: w.locked - amount }));
      await refreshAjos();
    }
  };
  

  if (loading || isFetching) return <AjoSkeleton />;

  return (
    <div className="space-y-8">
      {/* SECTION INDICATOR */}
      <div className="flex items-center gap-4 px-2">
        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-gray-200" />
        <div className="bg-brand/10 text-brand px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest border border-brand/20">
          Ajo Contribution Groups
        </div>
        <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-gray-200" />
      </div>

      {/* JOIN BOX (Upgraded Colors) */}
      <div className="bg-gradient-to-br from-brand to-[#42b8d4] p-6 rounded-[2rem] text-white shadow-xl shadow-brand/20 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 text-center md:text-left">
          <h2 className="font-black text-2xl">Join a Group</h2>
          <p className="text-white/80 font-medium">Enter your invite token to start contributing with friends.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2 bg-white/20 p-2 rounded-2xl backdrop-blur-md">
          <input 
            className="bg-transparent placeholder-white/60 border-none focus:ring-0 px-4 py-2 flex-1 md:w-64 font-bold text-white outline-none" 
            placeholder="Invite token..."
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <button onClick={handleJoinViaInvite} className="bg-white text-brand font-black px-6 py-2 rounded-xl hover:bg-gray-100 transition-colors">
            Join
          </button>
        </div>
      </div>

      {/* CREATE BOX */}
      <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
          Create New Group <span className="text-brand text-2xl">+</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input className="bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-brand rounded-xl p-3 font-bold" placeholder="Group Name" value={newAjoName} onChange={e => setNewAjoName(e.target.value)} />
          <input className="bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-brand rounded-xl p-3 font-bold" placeholder="Amount (₦)" value={cycleAmount} onChange={e => setCycleAmount(formatInput(e.target.value))} />
          <input className="bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-brand rounded-xl p-3 font-bold" placeholder="Cycle Days" value={cycleDuration} onChange={e => setCycleDuration(formatInput(e.target.value))} />
          <button onClick={createAjo} className="bg-gray-900 text-white font-black rounded-xl p-3 hover:bg-black transition-all">Start Group</button>
        </div>
      </section>

      {/* GROUP LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ajos.map((ajo) => (
          <div key={ajo.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden">
             {/* Status Badge */}
             <div className="absolute top-0 right-10 bg-brand text-white px-4 py-1 rounded-b-xl text-[10px] font-black uppercase tracking-tighter">
                Cycle #{ajo.current_cycle}
             </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-800">{ajo.name}</h3>
                <p className="text-brand text-xl font-black">₦{(ajo.cycle_amount ?? 0).toLocaleString()}</p>
              </div>
              
              <button 
                onClick={() => generateInviteLink(ajo.id)}
                className="bg-gray-50 text-gray-600 hover:text-brand px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 border border-gray-100"
              >
                + MEMBER
              </button>
            </div>

            <div className="flex gap-4 mb-8">
               <div className="bg-gray-50 px-4 py-2 rounded-xl flex-1 border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Duration</p>
                  <p className="text-gray-800 font-black">{ajo.cycle_duration} Days</p>
               </div>
               <div className="bg-gray-50 px-4 py-2 rounded-xl flex-1 border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Contribution</p>
                  <p className="text-gray-800 font-black">Fixed</p>
               </div>
            </div>

            {ajo.joined && (
              <button 
                disabled={ajo.payout_due}
                onClick={() => contribute(ajo.id, ajo.cycle_amount)}
                className={`w-full py-4 rounded-2xl font-black transition-all active:scale-[0.98] ${ajo.payout_due ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-brand text-white shadow-lg shadow-brand/20 hover:bg-brand-dark"}`}
              >
                {ajo.payout_due ? "WAITING FOR PAYOUT" : "CONTRIBUTE NOW"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AjoSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 skeleton rounded-[2rem] w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 skeleton rounded-[2.5rem]" />
        <div className="h-64 skeleton rounded-[2.5rem]" />
      </div>
    </div>
  );
}