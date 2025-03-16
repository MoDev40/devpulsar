import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

function useUser() {
  const { setUser, setSession, user, setLoading, loading } = useAuthStore();

  useEffect(() => {
    // Initialize session
    const initializeSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      setLoading(false);
    };

    initializeSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLoading]);

  return { user, loading };
}

export default useUser;
