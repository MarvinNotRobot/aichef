import { create } from 'zustand';
import type { AuthState } from './types';
import { AuthService } from './auth.service';
import { appLogger } from '../logger';
import { supabase } from '../supabase/client';

const authService = new AuthService();

export const useAuthStore = create<AuthState & {
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
}>((set) => {
  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      set({
        user: {
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at
        },
        isLoading: false
      });
    } else {
      set({ user: null, isLoading: false });
    }
  });

  return {
    user: null,
    isLoading: true,
    error: null,

    signUp: async (email: string, password: string) => {
      try {
        set({ isLoading: true, error: null });
        await authService.signUp(email, password);
        const user = await authService.getCurrentUser();
        set({ user, isLoading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },

    signIn: async (email: string, password: string) => {
      try {
        set({ isLoading: true, error: null });
        await authService.signIn(email, password);
        const user = await authService.getCurrentUser();
        set({ user, isLoading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },

    signOut: async () => {
      try {
        set({ isLoading: true, error: null });
        await authService.signOut();
        set({ user: null, isLoading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },

    loadUser: async () => {
      try {
        set({ isLoading: true, error: null });
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session?.user) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email!,
              created_at: session.user.created_at
            },
            isLoading: false
          });
        } else {
          set({ user: null, isLoading: false });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load user';
        set({ error: errorMessage, isLoading: false });
        appLogger.error('Failed to load user', { error });
      }
    }
  };
});