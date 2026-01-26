// components/admin/AjoGroupsSection/AjoGroupsSection.tsx
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

type AjoRow = { id: string; name: string; current_cycle: number };

export default function AjoGroupsSection() {
  const [ajos, setAjos] = useState<AjoRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAjos = async () => {
    try {
      const res = await fetch("/api/ajos");
      const data = await res.json();
      setAjos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch Ajos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAjos(); }, []);

  const advanceCycle = async (ajoId: string) => {
    try {
      const res = await fetch("/api/admin/advance-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ajoId }),
      });
      if (res.ok) fetchAjos();
    } catch (err) {
      alert("Error advancing cycle");
    }
  };

  if (loading) return <div>Loading Ajo groups...</div>;

  return (
    <div className="grid gap-4">
      {ajos.map((ajo) => (
        <div key={ajo.id} className="p-4 border rounded-lg flex justify-between items-center shadow-sm">
          <div>
            <p className="font-bold">{ajo.name}</p>
            <p className="text-sm text-gray-500">Cycle: {ajo.current_cycle}</p>
          </div>
          <Button onClick={() => advanceCycle(ajo.id)}>Advance</Button>
        </div>
      ))}
    </div>
  );
}