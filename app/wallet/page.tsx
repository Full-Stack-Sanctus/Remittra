"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import Button from "@/components/Button";

export default function WalletPage() {
  const { user, loading } = useUser();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const fetchWallet = async () => {
      const data = await fetch("/api/wallet").then((r) => r.json());
      if (mounted) setBalance(data.balance ?? 0);
    };

    fetchWallet();

    return () => {
      mounted = false;
    };
  }, [user]);

  const deposit = async () => {
    if (!user) return;

    await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, amount }),
    });

    setBalance((prev) => prev + amount);
    setAmount(0);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <div className="p-4">Please sign in</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Wallet</h1>
      <p>Balance: ₦{balance}</p>

      <input
        type="number"
        className="border p-2 mr-2"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <Button onClick={deposit}>Deposit</Button>
    </div>
  );
}
