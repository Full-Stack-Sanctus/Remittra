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
  const [isFetching, setIsFetching] = useState(true);

  const fetchWallet = async () => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/wallet", { credentials: "include" });
      if (res.ok) setWallet(await res.json());
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { if (user?.id) fetchWallet(); }, [user?.id]);

  if (loading || isFetching) return <WalletSkeleton />;
  if (!user) return <div className="p-8 text-center bg-white rounded-3xl border italic text-gray-400">Please sign in to view wallet</div>;

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
      
      <div className="relative z-10">
        <h1 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
          Financial Overview
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BalanceCard label="Available Balance" amount={wallet.balance} primary />
          <BalanceCard label="Locked in Ajo" amount={wallet.locked} />
          <BalanceCard label="Total Net Worth" amount={wallet.total} />
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₦</span>
            <input
              type="text"
              className="w-full bg-white border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-brand rounded-xl py-3 pl-8 pr-4 font-bold text-gray-800 transition-all outline-none"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(formatInput(e.target.value))}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={deposit} className="flex-1 sm:flex-none bg-brand hover:bg-brand-dark text-white font-black px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-brand/20">
              Deposit
            </button>
            <button onClick={withdraw} className="flex-1 sm:flex-none bg-white border-2 border-brand text-brand hover:bg-brand/5 font-black px-6 py-3 rounded-xl transition-all">
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({ label, amount, primary = false }: { label: string, amount: number, primary?: boolean }) {
  return (
    <div className={`p-5 rounded-2xl ${primary ? "bg-brand text-white shadow-xl shadow-brand/20" : "bg-gray-50 text-gray-800 border border-gray-100"}`}>
      <p className={`text-xs font-bold uppercase ${primary ? "text-white/80" : "text-gray-400"}`}>{label}</p>
      <p className="text-2xl font-black mt-1">₦{amount.toLocaleString()}</p>
    </div>
  );
}

function WalletSkeleton() {
  return (
    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 space-y-6">
      <div className="h-4 w-32 skeleton rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 skeleton rounded-2xl" />
        <div className="h-24 skeleton rounded-2xl" />
        <div className="h-24 skeleton rounded-2xl" />
      </div>
    </div>
  );
}