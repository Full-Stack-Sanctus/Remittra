"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useUser } from "@/hooks/useUser";
import Button from "@/components/Button";

type Wallet = {
  balance: number;
};

type AjoRow = {
  id: string;
  name: string;
  created_by: string;
  cycle_amount: number;
  current_cycle: number;
  joined: boolean;
  your_contribution: number;
  payout_due: boolean;
};

export default function UserPage() {
  const { user, loading } = useUser();
  const [wallet, setWallet] = useState<Wallet>({ balance: 0 });
  const [amount, setAmount] = useState(0);
  const [ajos, setAjos] = useState<AjoRow[]>([]);
  const [newAjoName, setNewAjoName] = useState("");
  const [cycleAmount, setCycleAmount] = useState(0);

  // Fetch wallet and Ajo groups once user session exists
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const fetchData = async () => {
      try {
        // Verify session
        const { data: sessionData } = await supabaseClient.auth.getSession();
        if (!sessionData?.session) return;

        // Wallet
        const walletData = await fetch("/api/wallet").then((r) => r.json());
        // Ajo groups
        const ajosData = await fetch("/api/ajos").then((r) => r.json());

        if (!mounted) return;
        setWallet(walletData ?? { balance: 0 });
        setAjos(ajosData ?? []);
      } catch (err) {
        console.error("Error fetching wallet/ajos:", err);
      }
    };

    fetchData();
<<<<<<< HEAD

    // Subscribe to auth state changes (e.g., logout)
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setWallet({ balance: 0 });
        setAjos([]);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
=======
    return () => {
      mounted = false;
>>>>>>> origin/main
    };
  }, [user]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <div className="p-4">Please sign in</div>;

  // Wallet actions
  const deposit = async () => {
    if (amount <= 0) return alert("Enter a valid amount");

    await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, amount }),
    });

    setWallet((w) => ({ ...w, balance: w.balance + amount }));
    setAmount(0);
  };

  const withdraw = async () => {
    if (amount <= 0 || amount > wallet.balance)
      return alert("Invalid withdrawal amount");

    await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, amount }),
    });

    setWallet((w) => ({ ...w, balance: w.balance - amount }));
    setAmount(0);
  };

  // Ajo actions
  const refreshAjos = async () => {
    const data = await fetch("/api/ajos").then((r) => r.json());
    setAjos(data);
  };

  const createAjo = async () => {
    if (!newAjoName || cycleAmount <= 0) return alert("Enter valid details");

    await fetch("/api/ajos/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newAjoName,
        createdBy: user.id,
        cycleAmount,
      }),
    });

    setNewAjoName("");
    setCycleAmount(0);
    await refreshAjos();
  };

  const joinAjo = async (ajoId: string) => {
    await fetch("/api/ajos/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId, userId: user.id }),
    });

    alert("Joined Ajo!");
    await refreshAjos();
  };

  const contribute = async (ajoId: string) => {
    await fetch("/api/ajos/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId, userId: user.id }),
    });

    alert("Contribution successful!");
    await refreshAjos();
  };

  return (
    <div className="p-4">
      {/* Wallet Section */}
      <h1 className="text-xl font-bold mb-4">My Wallet</h1>
      <div className="border p-4 mb-6">
        <p>Balance: ₦{wallet.balance}</p>
        <input
          type="number"
          className="border p-2 mr-2"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <Button onClick={deposit}>Deposit</Button>
        <Button onClick={withdraw} className="ml-2">
          Withdraw
        </Button>
      </div>

      {/* Create New Ajo */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Create New Ajo</h2>
        <input
          className="border p-2 mr-2"
          placeholder="Ajo Name"
          value={newAjoName}
          onChange={(e) => setNewAjoName(e.target.value)}
        />
        <input
          className="border p-2 mr-2"
          type="number"
          placeholder="Cycle Amount"
          value={cycleAmount}
          onChange={(e) => setCycleAmount(Number(e.target.value))}
        />
        <Button onClick={createAjo}>Create</Button>
      </div>

      {/* Ajo List */}
      <h2 className="text-xl font-bold mb-2">Ajo Groups</h2>
      {ajos.map((ajo) => (
        <div
          key={ajo.id}
          className="border p-4 mb-2 rounded flex flex-col md:flex-row justify-between items-start md:items-center"
        >
          <div>
            <h3 className="font-semibold">{ajo.name}</h3>
            <p>Cycle Amount: ₦{ajo.cycle_amount}</p>
            <p>Current Cycle: {ajo.current_cycle}</p>
            {ajo.joined && <p>Your Contribution: {ajo.your_contribution}</p>}
          </div>
          <div className="mt-2 md:mt-0 flex space-x-2">
            {!ajo.joined && (
              <Button onClick={() => joinAjo(ajo.id)}>Join</Button>
            )}
            {ajo.joined && (
              <Button
                onClick={() => contribute(ajo.id)}
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
