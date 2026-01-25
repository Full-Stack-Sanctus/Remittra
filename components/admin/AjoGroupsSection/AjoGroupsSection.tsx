"use client";

import Button from "@/components/Button";

// Types
type Contribution = {
  user_id: string;
  amount: number;
  payout_due: boolean;
};

type AjoRow = {
  id: string;
  name: string;
  current_cycle: number;
  contributions?: Contribution[];
};

type AjoGroupsSectionProps = {
  ajos: AjoRow[];
  advanceCycle: (ajoId: string) => void;
};

export default function AjoGroupsSection({ ajos, advanceCycle }: AjoGroupsSectionProps) {
  if (ajos.length === 0) {
    return <p className="text-gray-500">No Ajo groups found</p>;
  }

  return (
    <div className="space-y-4">
      {ajos.map((ajo) => (
        <div
          key={ajo.id}
          className="border p-4 rounded-lg shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center"
        >
          {/* Left content: Ajo info */}
          <div className="flex flex-col">
            <span className="font-semibold text-lg">
              {ajo.name} — Cycle {ajo.current_cycle}
            </span>

            {/* Contributions list */}
            {ajo.contributions && ajo.contributions.length > 0 ? (
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                {ajo.contributions.map((c) => (
                  <li key={c.user_id}>
                    <span className="font-medium">User {c.user_id}</span>: ${c.amount} —{" "}
                    {c.payout_due ? "Payout Due" : "Not Due"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No contributions yet</p>
            )}
          </div>

          {/* Right content: Button */}
          <div className="mt-3 md:mt-0 md:ml-4">
            <Button onClick={() => advanceCycle(ajo.id)}>Advance Cycle</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
