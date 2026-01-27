import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (email: string, password: string, options?: { displayName?: string; redirectPath?: string }) => Promise<{ error?: Error; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Check admin role - deferred to avoid deadlocks
  const checkAdminRole = useCallback((userId: string) => {
    setTimeout(async () => {
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!roleData);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      }
    }, 0);
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('AuthContext: Auth state changed:', event);
        
        // Only synchronous state updates here
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        // Defer Supabase calls with setTimeout
        if (currentSession?.user) {
          checkAdminRole(currentSession.user.id);
        } else {
          setIsAdmin(false);
        }

        // Handle navigation after auth events
        if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
          navigate('/');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);
      
      if (existingSession?.user) {
        checkAdminRole(existingSession.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole, navigate]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: Error }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });

        // Check role and navigate
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        const userIsAdmin = !!roleData;
        setIsAdmin(userIsAdmin);

        // Navigate based on role
        if (userIsAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }

      return {};
    } catch (error: any) {
      return { error: new Error(error.message || 'An unexpected error occurred') };
    }
  }, [navigate]);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    options?: { displayName?: string; redirectPath?: string }
  ): Promise<{ error?: Error; needsConfirmation?: boolean }> => {
    try {
      const redirectUrl = options?.redirectPath 
        ? `${window.location.origin}${options.redirectPath}` 
        : `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: options?.displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: "Check Your Email",
          description: "We've sent you a confirmation link. Please check your email to verify your account.",
        });
        return { needsConfirmation: true };
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome! Your account has been created successfully.",
        });
        
        // Send welcome email
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: { email, displayName: options?.displayName }
          });
        } catch (e) {
          console.error('Error sending welcome email:', e);
        }

        // Navigate to dashboard
        navigate('/dashboard');
      }

      return {};
    } catch (error: any) {
      return { error: new Error(error.message || 'An unexpected error occurred') };
    }
  }, [navigate]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // Navigation is handled by onAuthStateChange
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
