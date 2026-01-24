"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Button from "@/components/Button";

// User type
type UserRow = {
  id: string;
  email: string;
  kyc_verified: boolean;
};

// Ajo type (matches the new API)
type Contribution = {
  user_id: string;
  amount: number;
  payout_due: boolean;
};

type AjoRow = {
  id: string;
  name: string;
  current_cycle: number;
  contributions?: Contribution[]; // present for admins
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [ajos, setAjos] = useState<AjoRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const session = (await supabaseClient.auth.getSession()).data.session;
      if (!session) return;

      const [usersRes, ajosRes] = await Promise.all([
        fetch("/api/users").then((r) => r.json()),
        fetch("/api/ajos").then((r) => r.json()),
      ]);

      setUsers(usersRes ?? []);
      setAjos(ajosRes ?? []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setUsers([]);
      setAjos([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = async () => await fetchData();

  const toggleKYC = async (id: string, verified: boolean) => {
    try {
      const res = await fetch("/api/admin/toggle-kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, verified }),
      });
      if (!res.ok) throw new Error("Failed to toggle KYC");
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Error toggling KYC status");
    }
  };

  const advanceCycle = async (ajoId: string) => {
    try {
      const res = await fetch("/api/admin/advance-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ajoId }),
      });
      if (!res.ok) throw new Error("Failed to advance cycle");
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Error advancing Ajo cycle");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Panel</h1>

      {/* Users Section */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Users</h2>
        {users.length === 0 && <p>No users found</p>}
        {users.map((u) => (
          <div
            key={u.id}
            className="border p-2 mb-2 flex justify-between items-center"
          >
            <span>{u.email}</span>
            <span>KYC: {u.kyc_verified ? "✅" : "❌"}</span>
            <Button onClick={() => toggleKYC(u.id, !u.kyc_verified)}>
              {u.kyc_verified ? "Unverify" : "Verify"}
            </Button>
          </div>
        ))}
      </div>

      {/* Ajo Groups Section */}
      <div>
        <h2 className="font-semibold mb-2">Ajo Groups</h2>
        {ajos.length === 0 && <p>No Ajo groups found</p>}
        {ajos.map((a) => (
          <div
            key={a.id}
            className="border p-2 mb-2 flex flex-col md:flex-row justify-between items-start md:items-center"
          >
            <div>
              <span>
                {a.name} — Cycle {a.current_cycle}
              </span>
              {/* Show contributions count for admins */}
              {a.contributions && a.contributions.length > 0 && (
                <p className="text-sm text-gray-500">
                  Contributions: {a.contributions.length}
                </p>
              )}
            </div>
            <Button className="mt-2 md:mt-0" onClick={() => advanceCycle(a.id)}>
              Advance Cycle
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
