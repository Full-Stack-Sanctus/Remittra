import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../lib/types';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: userData } = await supabase
          .from<User>('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        setUser(userData || null);
      }
    };
    fetchUser();

    const { subscription } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return user;
};
