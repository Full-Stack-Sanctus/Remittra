import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../hooks/useUser';
import Button from '../components/Button';
import { Ajo } from '../lib/types';

export default function AjoPage() {
  const user = useUser();
  const [ajos, setAjos] = useState<Ajo[]>([]);
  const [newAjoName, setNewAjoName] = useState('');
  const [cycleAmount, setCycleAmount] = useState(0);

  useEffect(() => {
    const fetchAjos = async () => {
      const { data } = await supabase.from<Ajo>('ajos').select('*');
      setAjos(data || []);
    };
    fetchAjos();
  }, []);

  const createAjo = async () => {
    if (!user) return;
    await supabase.from('ajos').insert({
      name: newAjoName,
      created_by: user.id,
      cycle_amount: cycleAmount,
    });
    setNewAjoName('');
    setCycleAmount(0);
    // Refresh list
    const { data } = await supabase.from<Ajo>('ajos').select('*');
    setAjos(data || []);
  };

  const joinAjo = async (ajoId: string) => {
    if (!user) return;
    await supabase.from('ajo_members').insert({ ajo_id: ajoId, user_id: user.id });
    alert('Joined Ajo successfully!');
  };

  const contribute = async (ajoId: string) => {
    if (!user) return;
    await supabase.from('ajo_contributions').insert({
      ajo_id: ajoId,
      user_id: user.id,
      cycle_number: 1, // placeholder, implement dynamic cycle later
      amount: ajos.find((a) => a.id === ajoId)?.cycle_amount || 0,
    });
    alert('Contribution successful!');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Ajo Groups</h1>

      {/* Create Ajo */}
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
        <Button onClick={createAjo}>Create</Button>
      </div>

      {/* List of Ajos */}
      <div>
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
    </div>
  );
}
