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

  const validateInputs = () => {
    if (!name.trim()) {
      alert("Name is required");
      return false;
    }

    if (!email.trim()) {
      alert("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Enter a valid email address");
      return false;
    }

    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);

      // 1️⃣ Create auth user
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("User not created");

      // 2️⃣ Create user profile row
      const { error: profileError } = await supabaseClient
        .from("users")
        .insert({
          id: data.user.id,
          full_name: name,
          is_admin: false,
          kyc_verified: false,
        });

      if (profileError) throw profileError;

      alert("Signup successful! Please log in.");
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Signup error:", err);
        alert(err.message);
      } else {
        alert("Signup failed");
      }
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

      <Button onClick={handleSignUp} disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
    </div>
  );
}
