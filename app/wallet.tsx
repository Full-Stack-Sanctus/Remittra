import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/Button';
import { useUser } from '../hooks/useUser';

export default function Wallet() {
  const user = useUser();
  const [amount, setAmount] = useState(0);

  const handleDeposit = async () => {
    if (!user) return;
    await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      type: 'deposit',
      amount,
    });
    await supabase.from('users').update({ wallet_balance: user.wallet_balance + amount }).eq('id', user.id);
    alert('Deposit successful');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Wallet</h1>
      <p>Balance: ₦{user?.wallet_balance || 0}</p>
      <input
        type="number"
        placeholder="Amount"
        className="border p-2 mr-2"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <Button onClick={handleDeposit}>Deposit</Button>
    </div>
  );
}
