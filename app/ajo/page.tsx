'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import Button from '@/components/Button';

type AjoRow = {
  id: string;
  name: string;
  created_by: string;
  cycle_amount: number;
  current_cycle: number;
};

export default function AjoPage() {
  const { user, loading } = useUser();
  const [ajos, setAjos] = useState<AjoRow[]>([]);
  const [newAjoName, setNewAjoName] = useState('');
  const [cycleAmount, setCycleAmount] = useState<number>(0);

  const fetchAjos = async () => {
    const data = await fetch('/api/ajos').then(r => r.json());
    setAjos(data);
  };

  useEffect(() => { fetchAjos(); }, []);

  const createAjo = async () => {
    if (!user) return;

    await fetch('/api/ajos/create', {
      method: 'POST',
      body: JSON.stringify({ name: newAjoName, createdBy: user.id, cycleAmount }),
      headers: { 'Content-Type': 'application/json' },
    });

    setNewAjoName('');
    setCycleAmount(0);
    fetchAjos();
  };

  const joinAjo = async (ajoId: string) => {
    if (!user) return;

    await fetch('/api/ajos/join', {
      method: 'POST',
      body: JSON.stringify({ ajoId, userId: user.id }),
      headers: { 'Content-Type': 'application/json' },
    });

    alert('Joined Ajo!');
  };

  const contribute = async (ajoId: string) => {
    if (!user) return;

    await fetch('/api/ajos/contribute', {
      method: 'POST',
      body: JSON.stringify({ ajoId, userId: user.id }),
      headers: { 'Content-Type': 'application/json' },
    });

    alert('Contribution successful!');
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <div className="p-4">Please sign in</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Ajo Groups</h1>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Create New Ajo</h2>
        <input
          placeholder="Ajo Name"
          value={newAjoName}
          onChange={(e) => setNewAjoName(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Cycle Amount"
          value={cycleAmount}
          onChange={(e) => setCycleAmount(Number(e.target.value))}
          className="border p-2 mr-2"
        />
        <Button onClick={createAjo} disabled={!user}>
          Create
        </Button>
      </div>

      {ajos.map((ajo) => (
        <div key={ajo.id} className="border p-4 mb-2 rounded">
          <h3 className="font-semibold">{ajo.name}</h3>
          <p>Cycle Amount: ₦{ajo.cycle_amount}</p>
          <p>Current Cycle: {ajo.current_cycle}</p>

          <Button className="mr-2" onClick={() => joinAjo(ajo.id)}>
            Join
          </Button>
          <Button onClick={() => contribute(ajo.id)}>Contribute</Button>
        </div>
      ))}
    </div>
  );
}
