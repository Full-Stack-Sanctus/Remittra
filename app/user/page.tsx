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

export default function UserPage() {
  const { user, loading } = useUser();
  const [wallet, setWallet] = useState<Wallet>({
    available: 0,
    locked: 0,
    total: 0,
  });
  const [amount, setAmount] = useState<string>("");
  const [ajos, setAjos] = useState<AjoRow[]>([]);
  const [newAjoName, setNewAjoName] = useState<string>("");
  const [cycleAmount, setCycleAmount] = useState<string>("");
  const [cycleDuration, setCycleDuration] = useState<string>("1");
  

  // Helper to sanitize number input: digits only, no leading zeros
  const formatInput = (value: string) =>
    value.replace(/\D/g, "").replace(/^0+/, "");

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
      }
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
    const amt = Number(amount);
    if (amt <= 0) return alert("Enter a valid amount");

    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, amount: amt }),
    });
    if (!res.ok) return alert("Deposit failed");

    setWallet((w) => ({
      ...w,
      available: w.available + amt,
      total: w.total + amt,
    }));
    setAmount("");
  };

  const withdraw = async () => {
    const amt = Number(amount);
    if (amt <= 0 || amt > wallet.available)
      return alert("Cannot withdraw more than available balance");

    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, amount: amt }),
    });
    if (!res.ok) return alert("Withdrawal failed");

    setWallet((w) => ({
      ...w,
      available: w.available - amt,
      total: w.total - amt,
    }));
    setAmount("");
  };

  // Ajo actions
  const refreshAjos = async () => {
    const data = await fetch("/api/ajos").then((r) => r.json());
    setAjos(data ?? []);
  };

  const createAjo = async () => {
    const amt = Number(cycleAmount);
    const dur = Number(cycleDuration);
    if (!newAjoName || amt <= 0 || dur <= 0)
      return alert("Enter valid details");
    
    // ✅ Get session properly
    const { data: sessionData } = await supabaseClient.auth.getSession(); // await!
    const token = sessionData?.session?.access_token;
    if (!token) return alert("Session expired. Please login again.");
  

    const res = await fetch("/api/ajos/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`},
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

  const joinAjo = async (ajoId: string, cycleAmount: number) => {
    if (wallet.available < cycleAmount)
      return alert("Insufficient balance to join this Ajo.");

    const res = await fetch("/api/ajos/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId, userId: user id}),
    })
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to join Ajo");

    setWallet((w) => ({
      ...w,
      available: w.available - cycleAmount,
      locked: w.locked + cycleAmount,
      total: w.total,
    }));
    alert("Joined Ajo! Your contribution is now locked.");
    await refreshAjos();
  };

  const contribute = async (ajoId: string, cycleAmount: number) => {
    if (wallet.locked < cycleAmount) return alert("Insufficient locked funds");

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

  const generateInvite = async (ajoId: string) => {
    const res = await fetch("/api/ajos/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId, userId: user.id }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to generate invite");

    alert(`Invite Link (expires ${new Date(data.expiresAt).toLocaleString()}):\n${data.inviteLink}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Wallet</h1>
      <div className="border p-4 mb-6">
        <p>Total Balance: ₦{wallet.total}</p>
        <p>Available Balance: ₦{wallet.available}</p>
        <p>Locked in Ajo: ₦{wallet.locked}</p>
        <div className="flex items-center mt-2">
          <input
            type="text"
            className="border p-2 mr-2 w-32"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(formatInput(e.target.value))}
          />
          <Button onClick={deposit}>Deposit</Button>
          <Button onClick={withdraw} className="ml-2">
            Withdraw
          </Button>
        </div>
      </div>

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
            type="text"
            className="border p-2 w-32"
            placeholder="Cycle Amount"
            value={cycleAmount}
            onChange={(e) => setCycleAmount(formatInput(e.target.value))}
          />
          <input
            type="text"
            className="border p-2 w-32"
            placeholder="Cycle Duration"
            value={cycleDuration}
            onChange={(e) => setCycleDuration(formatInput(e.target.value))}
          />
          <Button onClick={createAjo}>Create</Button>
        </div>
        <p className="text-sm text-gray-500">
          Duration is in number of cycles (weeks/months)
        </p>
      </div>

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
            {!ajo.joined && ajo.created_by === user.id && (
              <Button onClick={() => generateInvite(ajo.id)}>Invite</Button>
            )}
            {!ajo.joined && ajo.created_by !== user.id && (
              <Button onClick={() => joinAjo(ajo.id, ajo.cycle_amount)}>Join</Button>
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
