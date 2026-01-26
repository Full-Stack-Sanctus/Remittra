"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useUser } from "@/hooks/useUser";
import Button from "@/components/Button";

type Wallet = {
  balance: number;
  locked: number;
  total: number;
};

const EMPTY_WALLET: Wallet = {
  balance: 0,
  locked: 0,
  total: 0,
};

export default function WalletSection() {
  const { user, loading } = useUser();
  const [wallet, setWallet] = useState<Wallet>(EMPTY_WALLET);
  const [amount, setAmount] = useState("");

  const formatInput = (value: string) => value.replace(/\D/g, "").replace(/^0+/, "");

  // 🔹 Fetch wallet for authenticated user
  const fetchWallet = async () => {
   try {
    const res = await fetch("/api/wallet", {
      credentials: "include", // 👈 important
    });

    if (!res.ok) throw new Error("Failed to fetch wallet");

    const data = await res.json();
    setWallet(data ?? EMPTY_WALLET);
   } catch (err) {
    console.error("Wallet fetch error:", err);
    setWallet(EMPTY_WALLET);
    }
  };


  useEffect(() => {
    if (user?.id) fetchWallet();
  }, [user?.id]);

  // 🔹 Reset wallet on sign-out
  useEffect(() => {
   const { data } = supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") setWallet(EMPTY_WALLET);
    if (event === "SIGNED_IN") fetchWallet();
   });
   return () => data.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <div className="p-4">Please sign in</div>;

  // 🔹 Deposit
  const deposit = async () => {
    const amt = Number(amount);
    if (amt <= 0) return alert("Enter a valid amount");

    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ amount: amt }),
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Deposit failed");
      }

      const data = await res.json();
      // Update wallet from server response
      
      setWallet({
      available: data.newBalance, 
      total: data.newBalance, // Or whatever fields your API returned
      locked: wallet.locked 
      
    });
    } catch (err) {
      console.error("Deposit error:", err);
      alert("Deposit failed");
    }
  };

  // 🔹 Withdraw
  const withdraw = async () => {
    const amt = Number(amount);
    if (amt <= 0 || amt > wallet.available) return alert("Cannot withdraw more than available balance");


    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ amount: amt }),
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Withdrawal failed");
      }

      const data = await res.json();
      setWallet((w) => ({ ...w, available: data.newBalance, total: data.newBalance }));
      setAmount("");
    } catch (err) {
      console.error("Withdrawal error:", err);
      alert("Withdrawal failed");
    }
  };

  return (
    <div className="border p-4 mb-6">
      <h1 className="text-xl font-bold mb-4">My Wallet</h1>

      <p>Total Balance: ₦{wallet.balance}</p>
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

