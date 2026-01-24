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

export default function AjoSection() {
  const { user, loading } = useUser();
  const [wallet, setWallet] = useState<Wallet>({
    available: 0,
    locked: 0,
    total: 0,
  });
  const [ajos, setAjos] = useState<AjoRow[]>([]);
  const [newAjoName, setNewAjoName] = useState("");
  const [cycleAmount, setCycleAmount] = useState("");
  const [cycleDuration, setCycleDuration] = useState("1");

  const formatInput = (value: string) =>
    value.replace(/\D/g, "").replace(/^0+/, "");

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const fetchData = async () => {
      try {
        const walletRes = await fetch("/api/wallet");
        const walletData = await walletRes.json();
        const ajosRes = await fetch("/api/ajos");
        const ajosData = await ajosRes.json();

        if (!mounted) return;

        setWallet(walletData);
        setAjos(ajosData ?? []);
      } catch {
        setWallet({ available: 0, locked: 0, total: 0 });
        setAjos([]);
      }
    };

    fetchData();

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setWallet({ available: 0, locked: 0, total: 0 });
          setAjos([]);
        } else {
          fetchData();
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [user]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return;

  const refreshAjos = async () => {
    const data = await fetch("/api/ajos").then((r) => r.json());
    setAjos(data ?? []);
  };

  const createAjo = async () => {
    const amt = Number(cycleAmount);
    const dur = Number(cycleDuration);
    if (!newAjoName || amt <= 0 || dur <= 0)
      return alert("Enter valid details");

    const res = await fetch("/api/ajos/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newAjoName,
        createdBy: user.id,
        cycleAmount: amt,
        cycleDuration: dur,
      }),
    });
    if (!res.ok) return alert("Failed to create Ajo");

    setNewAjoName("");
    setCycleAmount("");
    setCycleDuration("1");
    await refreshAjos();
  };

  const joinAjo = async (ajoId: string, amount: number) => {
    if (wallet.available < amount)
      return alert("Insufficient balance to join this Ajo.");

    await fetch("/api/ajos/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId }),
    });

    setWallet((w) => ({
      ...w,
      available: w.available - amount,
      locked: w.locked + amount,
    }));

    await refreshAjos();
  };

  const contribute = async (ajoId: string, amount: number) => {
    if (wallet.locked < amount) return alert("Insufficient locked funds");

    await fetch("/api/ajos/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId }),
    });

    setWallet((w) => ({
      ...w,
      locked: w.locked - amount,
    }));

    await refreshAjos();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Create New Ajo</h2>

        <input
          className="border p-2 w-40 mr-2"
          placeholder="Ajo Name"
          value={newAjoName}
          onChange={(e) => setNewAjoName(e.target.value)}
        />

        <input
          className="border p-2 w-32 mr-2"
          placeholder="Cycle Amount"
          value={cycleAmount}
          onChange={(e) => setCycleAmount(formatInput(e.target.value))}
        />

        <input
          className="border p-2 w-32 mr-2"
          placeholder="Cycle Duration"
          value={cycleDuration}
          onChange={(e) => setCycleDuration(formatInput(e.target.value))}
        />

        <Button onClick={createAjo}>Create</Button>
      </div>

      <h2 className="text-xl font-bold mb-2">Ajo Groups</h2>

      {ajos.map((ajo) => (
        <div key={ajo.id} className="border p-4 mb-2 rounded">
          <h3 className="font-semibold">{ajo.name}</h3>
          <p>Cycle Amount: ₦{ajo.cycle_amount}</p>
          <p>Cycle Duration: {ajo.cycle_duration}</p>
          <p>Current Cycle: {ajo.current_cycle}</p>

          <div className="mt-2 flex gap-2">
            {!ajo.joined && ajo.created_by !== user.id && (
              <Button onClick={() => joinAjo(ajo.id, ajo.cycle_amount)}>
                Join
              </Button>
            )}

            {ajo.joined && (
              <Button
                onClick={() => contribute(ajo.id, ajo.cycle_amount)}
                disabled={ajo.payout_due}
              >
                {ajo.payout_due ? "Payout Due" : "Contribute"}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
