"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";
import Button from "@/components/Button";

type Wallet = {
  balance: number;
};

type Ajo = {
  id: string;
  name: string;
  current_cycle: number;
  your_contribution: number;
  payout_due: boolean;
};

export default function UserPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [ajos, setAjos] = useState<Ajo[]>([]);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const user = supabaseClient.auth.getUser();

      // Wallet
      const { data: walletData } = await supabaseClient
        .from("wallets")
        .select("balance")
        .eq("user_id", (await user).data.user?.id)
        .single();

      setWallet(walletData);

      // Ajo groups
      const { data: ajosData } = await supabaseClient
        .from("user_ajos")
        .select(
          `ajo_id, name, current_cycle, your_contribution, payout_due`
        )
        .eq("user_id", (await user).data.user?.id);

      setAjos(ajosData || []);
    };

    fetchData();
  }, []);

  const fundWallet = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert("Enter a valid amount");

    const user = await supabaseClient.auth.getUser();

    await supabaseClient.rpc("fund_wallet", {
      p_user_id: user.data.user!.id,
      p_amount: amt,
    });

    setWallet((w) => w && { ...w, balance: w.balance + amt });
    setAmount("");
  };

  const withdrawWallet = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || (wallet && amt > wallet.balance))
      return alert("Invalid withdrawal amount");

    const user = await supabaseClient.auth.getUser();

    await supabaseClient.rpc("withdraw_wallet", {
      p_user_id: user.data.user!.id,
      p_amount: amt,
    });

    setWallet((w) => w && { ...w, balance: w.balance - amt });
    setAmount("");
  };

  const contributeAjo = async (ajoId: string) => {
    const user = await supabaseClient.auth.getUser();
    await supabaseClient.rpc("contribute_ajo", {
      p_user_id: user.data.user!.id,
      p_ajo_id: ajoId,
    });

    setAjos((a) =>
      a.map((ajo) =>
        ajo.id === ajoId
          ? { ...ajo, your_contribution: ajo.your_contribution + 1 }
          : ajo
      )
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Wallet</h1>
      <div className="border p-4 mb-4">
        <p>Balance: ₦{wallet?.balance ?? 0}</p>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 mr-2"
        />
        <Button onClick={fundWallet}>Fund</Button>
        <Button onClick={withdrawWallet} className="ml-2">
          Withdraw
        </Button>
      </div>

      <h2 className="text-lg font-semibold mb-2">My Ajo Groups</h2>
      {ajos.map((ajo) => (
        <div
          key={ajo.id}
          className="border p-2 mb-2 flex justify-between items-center"
        >
          <span>
            {ajo.name} — Cycle {ajo.current_cycle} — Your Contribution:{" "}
            {ajo.your_contribution}
          </span>
          <Button
            onClick={() => contributeAjo(ajo.id)}
            disabled={ajo.payout_due}
          >
            {ajo.payout_due ? "Payout Due" : "Contribute"}
          </Button>
        </div>
      ))}
    </div>
  );
}
