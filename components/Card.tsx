import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Ajo } from '../lib/types';
import Button from '../components/Button';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [ajos, setAjos] = useState<Ajo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData } = await supabase.from<User>('users').select('*');
      setUsers(usersData || []);

      const { data: ajosData } = await supabase.from<Ajo>('ajos').select('*');
      setAjos(ajosData || []);
    };
    fetchData();
  }, []);

  const toggleKYC = async (userId: string, verified: boolean) => {
    await supabase.from('users').update({ kyc_verified: !verified }).eq('id', userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, kyc_verified: !verified } : u))
    );
  };

  const advanceCycle = async (ajoId: string) => {
    // Placeholder: implement logic to rotate payouts and increment current_cycle
    await supabase
      .from('ajos')
      .update({ current_cycle: supabase.raw('current_cycle + 1') })
      .eq('id', ajoId);
    setAjos((prev) =>
      prev.map((a) => (a.id === ajoId ? { ...a, current_cycle: a.current_cycle + 1 } : a))
    );
    alert('Cycle advanced (demo)');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Panel</h1>

      <h2 className="font-semibold mb-2">Users</h2>
      <div className="mb-6">
        {users.map((user) => (
          <div key={user.id} className="border p-2 mb-2 rounded flex justify-between">
            <span>{user.email}</span>
            <span>KYC: {user.kyc_verified ? '✅' : '❌'}</span>
            <Button onClick={() => toggleKYC(user.id, user.kyc_verified)}>
              {user.kyc_verified ? 'Unverify' : 'Verify'}
            </Button>
          </div>
        ))}
      </div>

      <h2 className="font-semibold mb-2">Ajo Groups</h2>
      {ajos.map((ajo) => (
        <div key={ajo.id} className="border p-2 mb-2 rounded flex justify-between items-center">
          <span>{ajo.name} - Cycle {ajo.current_cycle}</span>
          <Button onClick={() => advanceCycle(ajo.id)}>Advance Cycle</Button>
        </div>
      ))}
    </div>
  );
}
