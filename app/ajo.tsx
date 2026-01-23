import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../hooks/useUser";
import Button from "../components/Button";

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
  const [newAjoName, setNewAjoName] = useState("");
  const [cycleAmount, setCycleAmount] = useState<number>(0);

  useEffect(() => {
    const fetchAjos = async () => {
      const { data, error } = await supabase
        .from("ajos")
        .select("id, name, created_by, cycle_amount, current_cycle");

      if (!error && data) {
        setAjos(data);
      }
    };

    fetchAjos();
  }, []);

  const refreshAjos = async () => {
    const { data } = await supabase
      .from("ajos")
      .select("id, name, created_by, cycle_amount, current_cycle");

    if (data) setAjos(data);
  };

  const createAjo = async () => {
    if (!user) return;

    await supabase.from("ajos").insert({
      name: newAjoName,
      created_by: user.id,
      cycle_amount: cycleAmount,
      current_cycle: 1,
    });

    setNewAjoName("");
    setCycleAmount(0);
    refreshAjos();
  };

  const joinAjo = async (ajoId: string) => {
    if (!user) return;

    await supabase.from("ajo_members").insert({
      ajo_id: ajoId,
      user_id: user.id,
    });

    alert("Joined Ajo successfully!");
  };

  const contribute = async (ajoId: string) => {
    if (!user) return;

    const ajo = ajos.find((a) => a.id === ajoId);
    if (!ajo) return;

    await supabase.from("ajo_contributions").insert({
      ajo_id: ajoId,
      user_id: user.id,
      cycle_number: ajo.current_cycle,
      amount: ajo.cycle_amount,
    });

    alert("Contribution successful!");
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

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
        <Button onClick={createAjo} disabled={!user}>
          Create
        </Button>
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
