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

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      
      {/* JOIN BOX */}
      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <h2 className="text-indigo-900 font-bold text-lg">Have an invite?</h2>
          <p className="text-indigo-700 text-sm">Paste the link or code below to join a group.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <input 
            className="border rounded-xl px-4 py-2 flex-1 md:w-64" 
            placeholder="Invite code..."
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <Button onClick={handleJoinViaInvite}>Join</Button>
        </div>
      </div>

      {/* CREATE BOX */}
      <section className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Start a New Ajo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input className="border rounded-lg p-2" placeholder="Name" value={newAjoName} onChange={e => setNewAjoName(e.target.value)} />
          <input className="border rounded-lg p-2" placeholder="Amount (₦)" value={cycleAmount} onChange={e => setCycleAmount(formatInput(e.target.value))} />
          <input className="border rounded-lg p-2" placeholder="Days" value={cycleDuration} onChange={e => setCycleDuration(formatInput(e.target.value))} />
          <Button onClick={createAjo} className="bg-black text-white">Create</Button>
        </div>
      </section>

      {/* GROUP LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ajos.map((ajo) => (
          <div key={ajo.id} className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{ajo.name}</h3>
                <p className="text-blue-600 font-bold">₦{(ajo.cycle_amount ?? 0).toLocaleString()}</p>
              </div>
              
              {/* THE ADD BUTTON */}
              <button 
                onClick={() => generateInviteLink(ajo.id)}
                className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-1"
              >
                <span>+</span> Add Member
              </button>
            </div>

            <div className="flex gap-10 text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-2xl">
              <div>
                <p className="text-xs uppercase font-semibold">Duration</p>
                <p className="text-gray-900 font-bold">{ajo.cycle_duration} Days</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold">Status</p>
                <p className="text-gray-900 font-bold">Cycle #{ajo.current_cycle}</p>
              </div>
            </div>

            {ajo.joined && (
              <Button 
                disabled={ajo.payout_due}
                onClick={() => contribute(ajo.id, ajo.cycle_amount)}
                className="w-full justify-center mt-auto"
              >
                {ajo.payout_due ? "Wait for Payout" : "Contribute Now"}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}