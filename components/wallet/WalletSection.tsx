"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import Button from "@/components/Button";
import { supabaseClient } from "@/lib/supabaseClient";

type Wallet = {
  available: number;
  locked: number;
  total: number;
};

export default function WalletSection() {
  const { user } = useUser();
  const [wallet, setWallet] = useState<Wallet>({
    available: 0,
    locked: 0,
    total: 0,
  });
  const [amount, setAmount] = useState("");

  const formatInput = (v: string) =>
    v.replace(/\D/g, "").replace(/^0+/, "");

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const fetchWallet = async () => {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (mounted) setWallet(data);
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

  /* ------------------ ACTIONS ------------------ */

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
      return alert("Insufficient balance");

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

  /* ------------------ UI ------------------ */

  return (
    <div className="border p-4 rounded">
      <h2 className="text-xl font-bold mb-3">My Wallet</h2>

      <p>Total: ₦{wallet.total}</p>
      <p>Available: ₦{wallet.available}</p>
      <p>Locked: ₦{wallet.locked}</p>

      <div className="flex items-center mt-3 gap-2">
        <input
          type="text"
          className="border p-2 w-32"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(formatInput(e.target.value))}
        />

        <Button onClick={deposit}>Deposit</Button>
        <Button onClick={withdraw}>Withdraw</Button>
      </div>
    </div>
  );
}
