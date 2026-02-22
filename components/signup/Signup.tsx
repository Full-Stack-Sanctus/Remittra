"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          // Pass metadata for the DB trigger
          data: {
            full_name: name,
          },
          // PKCE Flow: Redirect to our callback route
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

      if (error) throw error;

      // In enterprise apps, we check if identities are empty (email taken)
      if (data?.user?.identities?.length === 0) {
        throw new Error("Email already in use.");
      }

      alert("Check your email to confirm your account!");
      router.push("/login");
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Create Account</h1>

      <input
        className="border p-2 mb-2 w-full max-w-xs"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2 mb-2 w-full max-w-xs"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 mb-4 w-full max-w-xs"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button onClick={handleSignUp} disabled={loading} className="w-full max-w-xs mt-4">
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
    </div>
  );
  
}