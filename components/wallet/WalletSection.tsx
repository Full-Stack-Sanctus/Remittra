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

export default function WalletSection() {
  const { user, loading } = useUser();
  const [wallet, setWallet] = useState<Wallet>({
    available: 0,
    locked: 0,
    total: 0,
  });
  const [amount, setAmount] = useState<string>("");

  const formatInput = (value: string) =>
    value.replace(/\D/g, "").replace(/^0+/, "");

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const fetchWallet = async () => {
      try {
        const walletRes = await fetch("/api/wallet");
        const walletData = await walletRes.json();

        if (!mounted) return;

        setWallet(
          walletData && typeof walletData === "object"
            ? walletData
            : { available: 0, locked: 0, total: 0 }
        );
      } catch {
        setWallet({ available: 0, locked: 0, total: 0 });
      }
    };

    fetchWallet();

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setWallet({ available: 0, locked: 0, total: 0 });
        } else {
          fetchWallet();
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

  const deposit = async () => {
    const amt = Number(amount);
    if (amt <= 0) return alert("Enter a valid amount");

    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt }),
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
      body: JSON.stringify({ amount: amt }),
    });
    if (!res.ok) return alert("Withdrawal failed");

    setWallet((w) => ({
      ...w,
      available: w.available - amt,
      total: w.total - amt,
    }));
    setAmount("");
  };

  return (
    <div className="border p-4 mb-6">
      <h1 className="text-xl font-bold mb-4">My Wallet</h1>

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
  );
}
