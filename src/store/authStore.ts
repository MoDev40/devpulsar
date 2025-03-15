
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  signInWithGithub: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        set({ error: error.message });
        toast.error(error.message);
      }
    } catch (error: any) {
      set({ error: error.message });
      toast.error(error.message || 'Failed to sign in with GitHub');
    } finally {
      set({ loading: false });
    }
  },
  
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        set({ error: error.message });
        toast.error(error.message);
      } else {
        set({ user: null, session: null });
        toast.success('Logged out successfully');
      }
    } catch (error: any) {
      set({ error: error.message });
      toast.error(error.message || 'Failed to sign out');
    } finally {
      set({ loading: false });
    }
  },
}));
