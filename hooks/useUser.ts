import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../lib/supabaseClient";

export type User = {
  id: string;
  email: string;
  wallet_balance: number;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false); // 🔒 prevents double calls

  const fetchUser = async (session: any) => {
    if (!session?.user || fetchingRef.current) return;

    fetchingRef.current = true;

    try {
      const userId = session.user.id;

      const { data: walletData, error } = await supabaseClient
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      setUser({
        id: userId,
        email: session.user.email ?? "",
        wallet_balance: walletData?.balance ?? 0,
      });
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      if (!data.session) {
        setUser(null);
        setLoading(false);
        return;
      }

      fetchUser(data.session);
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setUser(null);
        } else {
          fetchUser(session);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

