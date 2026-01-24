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
  cycle_duration: number; // new
  current_cycle: number;
  joined: boolean;
  your_contribution: number;
  payout_due: boolean;
};

export default function UserPage() {
  const { user, loading } = useUser();
  const [wallet, setWallet] = useState<Wallet>({
    available: 0,
    locked: 0,
    total: 0,
  });
  const [amount, setAmount] = useState<number>(0);
  const [ajos, setAjos] = useState<AjoRow[]>([]);
  const [newAjoName, setNewAjoName] = useState<string>("");
  const [cycleAmount, setCycleAmount] = useState<number>(0);
  const [cycleDuration, setCycleDuration] = useState<number>(1); // in months/weeks

  // Fetch wallet and Ajo groups
  useEffect(() => {
    if (!user) return;

    let mounted = true;

    const fetchData = async () => {
      try {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        if (!sessionData?.session) return;

        const walletData = await fetch("/api/wallet").then((r) => r.json());
        const ajosData = await fetch("/api/ajos").then((r) => r.json());

        if (!mounted) return;
        setWallet(walletData ?? { available: 0, locked: 0, total: 0 });
        setAjos(ajosData ?? []);
      } catch (err) {
        console.error("Error fetching wallet/ajos:", err);
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
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [user]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <div className="p-4">Please sign in</div>;

  // Wallet actions
  const deposit = async () => {
    if (amount <= 0) return alert("Enter a valid amount");

    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, amount }),
    });

    if (!res.ok) return alert("Deposit failed");

    setWallet((w) => ({
      ...w,
      available: w.available + amount,
      total: w.total + amount,
    }));
    setAmount(0);
  };

  const withdraw = async () => {
    if (amount <= 0 || amount > wallet.available)
      return alert("Cannot withdraw more than available balance");

    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, amount }),
    });

    if (!res.ok) return alert("Withdrawal failed");

    setWallet((w) => ({
      ...w,
      available: w.available - amount,
      total: w.total - amount,
    }));
    setAmount(0);
  };

  // Ajo actions
  const refreshAjos = async () => {
    const data = await fetch("/api/ajos").then((r) => r.json());
    setAjos(data);
  };

  const createAjo = async () => {
    if (!newAjoName || cycleAmount <= 0 || cycleDuration <= 0)
      return alert("Enter valid details");

    const res = await fetch("/api/ajos/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newAjoName,
        createdBy: user.id,
        cycleAmount,
        cycleDuration,
      }),
    });

    if (!res.ok) return alert("Failed to create Ajo");

    setNewAjoName("");
    setCycleAmount(0);
    setCycleDuration(1);
    await refreshAjos();
  };

  const joinAjo = async (ajoId: string, cycleAmount: number) => {
    if (wallet.available < cycleAmount) {
      return alert("Insufficient wallet balance to join this Ajo.");
    }

    const res = await fetch("/api/ajos/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId, userId: user.id }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to join Ajo");

    setWallet((w) => ({
      ...w,
      available: w.available - cycleAmount,
      locked: (w.locked || 0) + cycleAmount,
      total: w.total,
    }));

    alert("Joined Ajo! Your contribution is now locked.");
    await refreshAjos();
  };

  const contribute = async (ajoId: string, cycleAmount: number) => {
    if (wallet.locked < cycleAmount) {
      return alert("Insufficient locked funds to contribute");
    }

    const res = await fetch("/api/ajos/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId, userId: user.id }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Contribution failed");

    setWallet((w) => ({
      ...w,
      locked: w.locked - cycleAmount,
      total: w.total,
    }));

    alert("Contribution successful!");
    await refreshAjos();
  };

  return (
    <div className="p-4">
      {/* Wallet Section */}
      <h1 className="text-xl font-bold mb-4">My Wallet</h1>
      <div className="border p-4 mb-6">
        <p>Total Balance: ₦{wallet.total}</p>
        <p>Available Balance: ₦{wallet.available}</p>
        <p>Locked in Ajo: ₦{wallet.locked}</p>
        <div className="flex items-center mt-2">
          <input
            type="number"
            min={1}
            step={100}
            className="border p-2 mr-2 w-32"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <Button onClick={deposit}>Deposit</Button>
          <Button onClick={withdraw} className="ml-2">
            Withdraw
          </Button>
        </div>
      </div>

      {/* Create New Ajo */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Create New Ajo</h2>
        <div className="flex flex-wrap items-center space-x-2 mb-2">
          <input
            type="text"
            className="border p-2 w-40"
            placeholder="Ajo Name"
            value={newAjoName}
            onChange={(e) => setNewAjoName(e.target.value)}
          />
          <input
            type="number"
            min={1}
            step={100}
            className="border p-2 w-32"
            placeholder="Cycle Amount"
            value={cycleAmount}
            onChange={(e) => setCycleAmount(Number(e.target.value))}
          />
          <input
            type="number"
            min={1}
            step={1}
            className="border p-2 w-32"
            placeholder="Cycle Duration"
            value={cycleDuration}
            onChange={(e) => setCycleDuration(Number(e.target.value))}
          />
          <Button onClick={createAjo}>Create</Button>
        </div>
        <p className="text-sm text-gray-500">
          Duration is in number of cycles (weeks/months)
        </p>
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
            <p>Cycle Duration: {ajo.cycle_duration}</p>
            <p>Current Cycle: {ajo.current_cycle}</p>
            {ajo.joined && <p>Your Contribution: ₦{ajo.your_contribution}</p>}
          </div>
          <div className="mt-2 md:mt-0 flex space-x-2">
            {!ajo.joined && (
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
