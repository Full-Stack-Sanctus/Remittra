"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page refresh if used in a <form>
    
    try {
      setLoading(true);

      // 1. Authenticate with Supabase
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) return;

      // 2. Fetch user role to determine initial direction
      // Note: Middleware handles the actual security, this is just for UX
      const { data: userData, error: userError } = await supabaseClient
        .from("users")
        .select("is_admin, kyc_verified")
        .eq("id", data.user.id)
        .single();

      if (userError || !userData) throw new Error("Profile not found.");

      // 3. Optimized Redirect Logic
      if (userData.is_admin) {
        router.push("/admin");
      } else if (userData.kyc_verified) {
        router.push("/user");
      } else {
        // You might want a specific /pending or /kyc page here
        alert("Your account is awaiting KYC verification.");
        router.push("/user"); 
      }

    } catch (err: any) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form 
        onSubmit={handleSignIn} 
        className="flex flex-col w-full max-w-xs gap-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>

        <input
          className="border p-2 w-full"
          placeholder="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" disabled={loading} className="bg-[#58cee8] text-white font-bold rounded-md hover:bg-[#4ab8d1] py-2">
          {loading ? "Signing you in..." : "Sign In"}
        </Button>

        <p className="mt-4 text-sm flex items-center justify-center gap-1">
          Don’t have an account?{" "}
          
          <Button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-[#58cee8] hover:underline font-semibold p-0 bg-transparent border-none"
          >
            Create one
          </Button>
          
        </p>

      </form>
    </div>
  );
}