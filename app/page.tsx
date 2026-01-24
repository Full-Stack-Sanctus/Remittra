"use client";

import { useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";
import Button from "../components/Button";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = async (email: string, password: string) => {
   try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) return;

    // Wait for session to be ready
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData?.session) {
      alert("Session not established. Try again.");
      return;
    }

    // Fetch user role
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("id, is_admin, kyc_verified")
      .eq("id", data.user.id)
      .single();

    if (userError || !userData) throw userError ?? new Error("User not found");

    // Redirect based on role
    if (userData.is_admin) {
      router.push("/admin");
    } else if (userData.kyc_verified) {
      router.push("/user");
    } else {
      alert("Your account is not KYC-verified yet.");
    }
   } catch (err: unknown) {
       if (err instanceof Error) {
         console.error("Login error:", err);
         alert(err.message);
       } else {
         console.error("Login error:", err);
         alert("Login failed");
       }
     }
   };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

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

      <Button onClick={() => handleSignIn(email, password)}>Sign In</Button>
    </div>
  );
}
