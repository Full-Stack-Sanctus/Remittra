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
  if (ajos.length === 0) return <p>No Ajo groups found</p>;

  return (
    <div>
      {ajos.map((a) => (
        <div
          key={a.id}
          className="border p-2 mb-2 flex flex-col md:flex-row justify-between items-start md:items-center"
        >
          <div className="flex flex-col">
            <span className="font-medium">
              {a.name} — Cycle {a.current_cycle}
            </span>

            {a.contributions && a.contributions.length > 0 ? (
              <ul className="mt-1 text-sm text-gray-700 space-y-1">
                {a.contributions.map((c) => (
                  <li key={c.user_id}>
                    User <span className="font-semibold">{c.user_id}</span>: ${c.amount} —{" "}
                    {c.payout_due ? "Payout Due" : "Not Due"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-1">No contributions yet</p>
            )}
          </div>

          <Button className="mt-2 md:mt-0" onClick={() => advanceCycle(a.id)}>
            Advance Cycle
          </Button>
        </div>
      ))}
    </div>
  );
}
