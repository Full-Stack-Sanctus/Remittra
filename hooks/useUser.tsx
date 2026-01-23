import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export type User = {
  id: string;
  email: string;
  wallet_balance: number;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? "",
          wallet_balance: 0, // placeholder, fetch from your wallet table
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return { user, loading };
}
