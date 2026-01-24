"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Button from "@/components/Button";

type UserRow = {
  id: string;
  email: string;
  kyc_verified: boolean;
};

type AjoRow = {
  id: string;
  name: string;
  current_cycle: number;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [ajos, setAjos] = useState<AjoRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        if (!sessionData?.session) return;

        const [usersRes, ajosRes] = await Promise.all([
          fetch("/api/users").then((r) => r.json()),
          fetch("/api/ajos").then((r) => r.json()),
        ]);

        if (!mounted) return;
        setUsers(usersRes);
        setAjos(ajosRes);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setLoading(false);
      }
    };

    fetchData();

    // Listen for auth changes
    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setUsers([]);
          setAjos([]);
        } else {
          fetchData();
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const refresh = async () => {
    const [usersRes, ajosRes] = await Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/ajos").then((r) => r.json()),
    ]);
    setUsers(usersRes);
    setAjos(ajosRes);
  };

  const toggleKYC = async (id: string, verified: boolean) => {
    await fetch("/api/admin/toggle-kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, verified }),
    });
    await refresh();
  };

  const advanceCycle = async (ajoId: string) => {
    await fetch("/api/admin/advance-cycle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajoId }),
    });
    await refresh();
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Panel</h1>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Users</h2>
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

      <h2 className="font-semibold mb-2">Ajo Groups</h2>
      {ajos.map((a) => (
        <div
          key={a.id}
          className="border p-2 mb-2 flex justify-between items-center"
        >
          <span>
            {a.name} — Cycle {a.current_cycle}
          </span>
          <Button onClick={() => advanceCycle(a.id)}>Advance Cycle</Button>
        </div>
      ))}
    </div>
  );
}
