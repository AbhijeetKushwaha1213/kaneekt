import React, { createContext, useContext, useState, useEffect, ReactNode, useNavigate } from 'react';
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
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user just signed in, check if they need to complete onboarding
        if (event === 'SIGNED_IN') {
          setTimeout(async () => {
            if (session?.user) {
              try {
                const { data, error } = await supabase
                  .from('profiles')
                  .select('name')
                  .eq('id', session.user.id)
                  .maybeSingle();
                  
                if (!data?.name) {
                  navigate('/onboarding');
                }
              } catch (error) {
                console.error("Error checking for user profile:", error);
              }
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const createStorageBucket = async (bucketName: string) => {
    try {
      // First, check if the bucket already exists
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      if (existingBuckets?.find(bucket => bucket.name === bucketName)) {
        return { error: null, data: { bucketName, message: 'Bucket already exists' } };
      }

      // Create the bucket with public access
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      });

      // Add RLS policies to allow authenticated users to upload files
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
    console.log("SignIn function called");
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

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log("SignIn result:", error ? `Error: ${error.message}` : "Success", data?.user?.email);
      
      if (error) {
        console.error("SignIn error details:", error);
        
        // Handle Supabase auth errors
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email not confirmed",
            description: "Please check your email to confirm your account.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive"
          });
        }
      }
      
      if (data?.session) {
        // Manually update state in case the listener doesn't trigger immediately
        setSession(data.session);
        setUser(data.user);
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
          data: userData
        }
      });
      
      console.log("SignUp result:", error ? "Error" : "Success", data?.user?.email);
      
      if (data?.user && !error) {
        // Initialize a user profile
        const userProfile = {
          id: data.user.id,
          name: userData.name || data.user.email?.split('@')[0] || "User",
          username: userData.username || data.user.email?.split('@')[0] || "user",
          avatar: userData.avatar_url || "/placeholder.svg",
          bio: "I'm new here!",
          location: "",
          followers: 0,
          following: 0,
          interests: [],
          isPrivate: false
        };
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
      }
      
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
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
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
