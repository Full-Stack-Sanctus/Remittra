"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import Button from "@/components/Button";

type AjoRow = {
  id: string;
  name: string;
  created_by: string;
  cycle_amount: number;
  current_cycle: number;
};

export default function AjoSection() {
  const { user } = useUser();
  const [ajos, setAjos] = useState<AjoRow[]>([]);
  const [newAjoName, setNewAjoName] = useState("");
  const [cycleAmount, setCycleAmount] = useState(0);

  useEffect(() => {
    fetchAjos();
  }, []);

  const fetchAjos = async () => {
    const data = await fetch("/api/ajos").then((r) => r.json());
    setAjos(data ?? []);
  };

  const createAjo = async () => {
    if (!user) return;

    await fetch("/api/ajos/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newAjoName,
        createdBy: user.id,
        cycleAmount,
      }),
    });

    setNewAjoName("");
    setCycleAmount(0);
    fetchAjos();
  };

  const joinAjo = async (ajoId: string) => {
    await fetch("/api/ajos/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId }),
    });

    alert("Joined Ajo!");
    fetchAjos();
  };

  const contribute = async (ajoId: string) => {
    await fetch("/api/ajos/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId }),
    });

    alert("Contribution successful!");
    fetchAjos();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Ajo Groups</h1>

      <div className="mb-6">
        <input
          className="border p-2 mr-2"
          placeholder="Ajo Name"
          value={newAjoName}
          onChange={(e) => setNewAjoName(e.target.value)}
        />

        <input
          className="border p-2 mr-2"
          type="number"
          placeholder="Cycle Amount"
          value={cycleAmount}
          onChange={(e) => setCycleAmount(Number(e.target.value))}
        />

        <Button onClick={createAjo}>Create</Button>
      </div>

      {ajos.map((ajo) => (
        <div key={ajo.id} className="border p-4 mb-2 rounded">
          <h3 className="font-semibold">{ajo.name}</h3>
          <p>₦{ajo.cycle_amount}</p>
          <p>Cycle {ajo.current_cycle}</p>

          <Button className="mr-2" onClick={() => joinAjo(ajo.id)}>
            Join
          </Button>

          <Button onClick={() => contribute(ajo.id)}>Contribute</Button>
        </div>
      ))}
    </div>
  );
}
