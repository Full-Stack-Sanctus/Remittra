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
        // Get session
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData?.session) {
          if (mounted) setUser(null);
          return;
        }

        // Get current user
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError) throw userError;
        if (!userData?.user) return;

        const userId = userData.user.id;

        // Fetch wallet
        const { data: walletData, error: walletError } = await supabaseClient
          .from("wallets")
          .select("balance")
          .eq("user_id", userId)
          .single();
        if (walletError) throw walletError;

        if (mounted) {
          setUser({
            id: userId,
            email: userData.user.email ?? "",
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

    // Subscribe to auth state changes (login/logout)
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) setUser(null);
      else fetchUser();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
