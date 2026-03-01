"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

import { toast } from "sonner"; // or your preferred toast lib
import { useRouter } from "next/navigation";


type UserProfile = {
  id: string;
  email: string;
  is_admin: boolean;
  verification_level: 1 | 2 | 3;
  kyc_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
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
  
  const router = useRouter();
  

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
        .select("id, is_admin, verification_level, kyc_status")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        is_admin: profile?.is_admin ?? false,
        verification_level: profile.verification_level ?? 1,
        kyc_status: profile.kyc_status ?? 'IDLE',
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
  
  // 2. REALTIME LISTENER (New)
  useEffect(() => {
    // Only start listening if we have a logged-in user
    if (!user?.id) return;

    const channel = supabaseClient.channel(`user:${user.id}`, {
      config: { private: true },
    });

    channel
      .on("broadcast", { event: "SYSTEM_NOTIFICATION" }, ({ payload }) => {
        const { type, data } = payload;

        // Enterprise handling: Notify the user
        switch (type) {
          case 'wallet_transactions':
            toast.success(`Transaction Alert: ${data.type} of ${data.amount}`);
            break;
          case 'messages':
            toast.info(`New Message: ${data.content}`);
            break;
          default:
            toast(`Update in ${type}`);
        }

        // CRITICAL: Refresh the current page data without a full reload
        // This ensures the Transaction History table updates automatically
        router.refresh(); 
      })
      .subscribe();

    // Cleanup: Disconnect when user logs out or tab closes
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [user?.id, router]);

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
