import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  createStorageBucket: (bucketName: string) => Promise<{ error: any; data?: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking profile:', error);
        return false;
      }

      return !!(profile?.name?.trim());
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  };
  
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, checking profile...');
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            try {
              const isProfileComplete = await checkProfileCompletion(session.user.id);
              
              if (!isProfileComplete) {
                console.log('Profile incomplete, redirecting to onboarding');
                navigate('/onboarding');
              } else {
                console.log('Profile complete, redirecting to chats');
                navigate('/chats');
              }
            } catch (error) {
              console.error("Error checking profile:", error);
              navigate('/onboarding'); // Safe fallback
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          navigate('/auth');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const createStorageBucket = async (bucketName: string) => {
    try {
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      if (existingBuckets?.find(bucket => bucket.name === bucketName)) {
        return { error: null, data: { bucketName, message: 'Bucket already exists' } };
      }

      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      });

      if (!error) {
        console.log(`Bucket ${bucketName} created successfully`);
      } else {
        console.error(`Error creating ${bucketName} bucket:`, error);
      }

      return { data, error };
    } catch (error) {
      console.error(`Unexpected error creating ${bucketName} bucket:`, error);
      return { error };
    }
  };

  const signIn = async (email: string, password?: string) => {
    console.log("SignIn function called with:", email);
    try {
      // Check if this is a Google sign-in request
      if (email === 'google') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/chats'
          }
        });
        
        return { data, error };
      }

      // Regular email/password sign-in
      if (!password) {
        return { error: new Error('Password is required for email login') };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      console.log("SignIn result:", error ? `Error: ${error.message}` : "Success");
      
      if (error) {
        console.error("SignIn error details:", error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      }
      
      return { error, data };
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
          data: userData,
          emailRedirectTo: `${window.location.origin}/onboarding`
        }
      });
      
      console.log("SignUp result:", error ? "Error" : "Success", data?.user?.email);
      
      if (error) {
        toast({
          title: "Registration error",
          description: error.message,
          variant: "destructive"
        });
      } else if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      }
      
      return { data, error };
    } catch (error) {
      console.error("SignUp exception:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log("SignOut function called");
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign out error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signIn, 
      signUp, 
      signOut, 
      loading, 
      createStorageBucket 
    }}>
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
