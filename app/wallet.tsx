import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Button from "../components/Button";
import { useUser } from "../hooks/useUser";

type WalletRow = {
  id: string;
  user_id: string;
  balance: number;
};

export default function Wallet() {
  const { user, loading } = useUser();
  const [wallet, setWallet] = useState<WalletRow | null>(null);
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    const fetchWallet = async () => {
      const { data } = await supabase
        .from("wallets")
        .select("id, user_id, balance")
        .eq("user_id", user.id)
        .single();

      if (data) setWallet(data);
    };

    fetchWallet();
  }, [user]);

  const handleDeposit = async () => {
    if (!user || !wallet || amount <= 0) return;

    // 1️⃣ Insert transaction
    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount,
    });

    // 2️⃣ Update wallet balance
    const newBalance = wallet.balance + amount;

    await supabase
      .from("wallets")
      .update({ balance: newBalance })
      .eq("id", wallet.id);

    setWallet({ ...wallet, balance: newBalance });
    setAmount(0);

    alert("Deposit successful");
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return <div className="p-4">Please sign in</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Wallet</h1>

      <p className="mb-4">
        Balance: <strong>₦{wallet?.balance ?? 0}</strong>
      </p>

      <input
        type="number"
        placeholder="Amount"
        className="border p-2 mr-2"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <Button onClick={handleDeposit} disabled={!wallet}>
        Deposit
      </Button>
    </div>
  );
}
