import { useState, useEffect } from "react";
import { supabaseClient } from "../lib/supabaseClient";

export type User = {
  id: string;
  email: string;
  wallet_balance: number;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getUser();
        if (error) throw error;

        if (!data?.user) {
          if (mounted) setUser(null);
          return;
        }

        const userId = data.user.id;

        // Fetch wallet balance
        const { data: walletData, error: walletError } = await supabaseClient
          .from("wallets")
          .select("balance")
          .eq("user_id", userId)
          .single();

        if (walletError) throw walletError;

        if (mounted) {
          setUser({
            id: userId,
            email: data.user.email ?? "",
            wallet_balance: walletData?.balance ?? 0,
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();

    // Optional: subscribe to auth changes (login/logout)
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) setUser(null);
        else fetchUser();
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
