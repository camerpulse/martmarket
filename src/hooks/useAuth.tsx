import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: 'buyer' | 'vendor', displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userType: 'buyer' | 'vendor', displayName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data: signUpResult, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          user_type: userType,
          display_name: displayName
        }
      }
    });

    // Auto-generate PGP keys for new users
    if (!error && signUpResult.user) {
      try {
        const { data: keyData, error: keyError } = await supabase.functions.invoke('pgp-encryption', {
          body: {
            action: 'generate_keypair',
            name: displayName || email.split('@')[0],
            email: email
          }
        });

        if (!keyError && keyData) {
          await supabase.from('pgp_keys').insert({
            user_id: signUpResult.user.id,
            public_key: keyData.public_key,
            private_key_encrypted: btoa(keyData.private_key),
            key_fingerprint: keyData.fingerprint || 'auto-generated'
          });
        }
      } catch (pgpError) {
        console.error('Failed to auto-generate PGP keys:', pgpError);
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}