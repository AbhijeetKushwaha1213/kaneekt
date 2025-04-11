
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        // Update state with session data
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          console.log("User signed in event triggered");
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out event triggered");
          toast({
            title: "Signed out",
            description: "You have been signed out.",
          });
        } else if (event === 'USER_UPDATED') {
          console.log("User updated event triggered");
        }
      }
    );

    // THEN check for existing session
    console.log("Checking for existing session");
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Existing session check result:", session ? "Session found" : "No session found");
      if (session?.user) {
        console.log("User from session:", session.user.email);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
      console.error("Error getting session:", error);
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    console.log("SignIn function called with email:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log("SignIn result:", error ? "Error" : "Success", data?.user?.email);
      
      if (data?.session) {
        // Manually update state in case the listener doesn't trigger immediately
        setSession(data.session);
        setUser(data.user);
      }
      
      return { error };
    } catch (error) {
      console.error("SignIn exception:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    console.log("SignUp function called with email:", email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      console.log("SignUp result:", error ? "Error" : "Success", data?.user?.email);
      
      if (data?.session) {
        // Manually update state in case the listener doesn't trigger immediately
        setSession(data.session);
        setUser(data.user);
      }
      
      return { data, error };
    } catch (error) {
      console.error("SignUp exception:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log("SignOut function called");
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
