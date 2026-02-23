"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

type UserProfile = {
  id: string;
  email: string;
  is_admin: boolean;
};

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabaseClient.auth.getSession();

      if (!session) {
        setUser(null);
        return;
      }

      const { data: profile, error } = await supabaseClient
        .from("users")
        .select("id, is_admin")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        is_admin: profile?.is_admin ?? false,
      });
    } catch (err) {
      console.error("Context Error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") fetchProfile();
      if (event === "SIGNED_OUT") setUser(null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};