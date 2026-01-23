'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Button from '@/components/Button';

export default function WalletPage() {
  const { user, loading } = useUser();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0);

  const fetchWallet = async () => {
    if (!user) return;
    const wallet = await fetch('/api/ajos').then(r => r.json()); // replace with actual wallet API route
    setBalance(wallet?.balance ?? 0);
  };

  useEffect(() => { fetchWallet(); }, [user]);

  const deposit = async () => {
    if (!user) return;
    await fetch('/api/wallet/deposit', { method: 'POST', body: JSON.stringify({ userId: user.id, amount }), headers: { 'Content-Type': 'application/json' } });
    setBalance(prev => prev + amount);
    setAmount(0);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Wallet</h1>
      <p>Balance: ₦{balance}</p>
      <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(Number(e.target.value))} className="border p-2 mr-2" />
      <Button onClick={deposit}>Deposit</Button>
    </div>
  );
}
