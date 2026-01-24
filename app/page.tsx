'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
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

      <Button onClick={handleSignIn}>Sign In</Button>
    </div>
  );
}
