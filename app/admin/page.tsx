"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import UsersSection from "@/components/admin/UsersSection";
import AjoGroupsSection from "@/components/admin/AjoGroupsSection";
import Button from "@/components/Button";

// Types
type UserRow = { id: string; email: string; kyc_verified: boolean };
type Contribution = { user_id: string; amount: number; payout_due: boolean };
type AjoRow = { id: string; name: string; current_cycle: number; contributions?: Contribution[] };

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

      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setAjos(Array.isArray(ajosRes) ? ajosRes : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setUsers([]);
      setAjos([]);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Users</h2>
        <UsersSection users={users} toggleKYC={toggleKYC} />
      </div>

      <div>
        <h2 className="font-semibold mb-2">Ajo Groups</h2>
        <AjoGroupsSection ajos={ajos} advanceCycle={advanceCycle} />
      </div>
    </div>
  );
}
