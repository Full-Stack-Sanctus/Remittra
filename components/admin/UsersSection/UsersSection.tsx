"use client";

import Button from "@/components/Button";

// User type
type UserRow = {
  id: string;
  email: string;
  kyc_verified: boolean;
};

type UsersSectionProps = {
  users: UserRow[];
  toggleKYC: (id: string, verified: boolean) => void;
};

export default function UsersSection({ users, toggleKYC }: UsersSectionProps) {
  if (users.length === 0) return <p>No users found</p>;

  return (
    <div>
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
  );
}
