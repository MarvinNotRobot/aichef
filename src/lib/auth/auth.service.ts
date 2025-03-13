import { supabase } from '../supabase/client';
import { appLogger } from '../logger';
import type { IAuthService, User } from './types';

export class AuthService implements IAuthService {
  async signUp(email: string, password: string): Promise<void> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        appLogger.error('Sign up failed', { error: error.message });
        throw error;
      }

      appLogger.info('User signed up successfully', { userId: data.user?.id });
    } catch (error) {
      appLogger.error('Unexpected error during sign up', { error });
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        appLogger.error('Sign in failed', { error: error.message });
        throw error;
      }

      appLogger.info('User signed in successfully', { userId: data.user?.id });
    } catch (error) {
      appLogger.error('Unexpected error during sign in', { error });
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session, just clear local state
        await supabase.auth.clearSession();
        appLogger.info('No active session, cleared local state');
        return;
      }

      const { error } = await supabase.auth.signOut({
        scope: 'local' // Change to local scope to avoid session not found errors
      });
      
      if (error) {
        appLogger.error('Sign out failed', { error: error.message });
        throw error;
      }

      appLogger.info('User signed out successfully');
    } catch (error) {
      // If it's an auth session error, just clear the local session
      if (error?.message?.includes('Auth session missing')) {
        await supabase.auth.clearSession();
        appLogger.warn('Auth session missing, cleared local state');
        return;
      }
      
      appLogger.error('Unexpected error during sign out', { error });
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        appLogger.error('Error getting current user', { error: error.message });
        throw error;
      }

      if (!session?.user) {
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email!,
        created_at: session.user.created_at
      };
    } catch (error) {
      appLogger.error('Unexpected error getting current user', { error });
      throw error;
    }
  }
}