// components/admin/UsersSection/UsersSection.tsx
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

type UserRow = { id: string; email: string; kyc_verified: boolean };

export default function UsersSection() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleKYC = async (id: string, verified: boolean) => {
    try {
      const res = await fetch("/api/admin/toggle-kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, verified }),
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      alert("Error toggling KYC");
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.kyc_verified ? "✅" : "❌"}</td>
              <td className="px-4 py-2 text-right">
                <Button onClick={() => toggleKYC(user.id, !user.kyc_verified)}>
                  {user.kyc_verified ? "Revoke" : "Verify"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}