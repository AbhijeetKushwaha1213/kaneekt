
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: any; data?: any }>;
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
          
          // Save the user to localStorage for persistence
          if (session?.user) {
            try {
              const userData = {
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
                email: session.user.email,
                username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || "user",
                avatar: session.user.user_metadata?.avatar_url || "/placeholder.svg",
                isLoggedIn: true,
                createdAt: session.user.created_at
              };
              
              localStorage.setItem("user", JSON.stringify(userData));
              
              // Initialize a user profile if it doesn't exist
              const storedProfile = localStorage.getItem("userProfile");
              if (!storedProfile) {
                const userProfile = {
                  id: session.user.id,
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
                  username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || "user",
                  avatar: session.user.user_metadata?.avatar_url || "/placeholder.svg",
                  bio: "I'm new here!",
                  location: "",
                  followers: 0,
                  following: 0,
                  interests: [],
                  isPrivate: false
                };
                localStorage.setItem("userProfile", JSON.stringify(userProfile));
              } else {
                // Update the existing profile with current user data while keeping other user settings
                try {
                  const existingProfile = JSON.parse(storedProfile);
                  const updatedProfile = {
                    ...existingProfile,
                    id: session.user.id,
                    name: session.user.user_metadata?.name || existingProfile.name,
                    email: session.user.email || existingProfile.email,
                    username: session.user.user_metadata?.username || existingProfile.username,
                  };
                  localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
                } catch (error) {
                  console.error("Error updating existing profile", error);
                }
              }
            } catch (error) {
              console.error("Error saving user data to localStorage", error);
            }
          }
          
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out event triggered");
          
          // Do NOT remove user data on signout to maintain persistence
          // Just update the isLoggedIn status
          try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              parsedUser.isLoggedIn = false;
              localStorage.setItem("user", JSON.stringify(parsedUser));
            }
          } catch (error) {
            console.error("Error updating user login status", error);
          }
          
          toast({
            title: "Signed out",
            description: "You have been signed out.",
          });
        } else if (event === 'USER_UPDATED') {
          console.log("User updated event triggered");
          
          // Update localStorage user data when user is updated
          if (session?.user) {
            try {
              const storedUser = localStorage.getItem("user");
              if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                const updatedUser = {
                  ...parsedUser,
                  name: session.user.user_metadata?.name || parsedUser.name,
                  email: session.user.email || parsedUser.email,
                  avatar: session.user.user_metadata?.avatar_url || parsedUser.avatar
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
              }
              
              // Also update profile data
              const storedProfile = localStorage.getItem("userProfile");
              if (storedProfile) {
                const parsedProfile = JSON.parse(storedProfile);
                const updatedProfile = {
                  ...parsedProfile,
                  name: session.user.user_metadata?.name || parsedProfile.name,
                  avatar: session.user.user_metadata?.avatar_url || parsedProfile.avatar
                };
                localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
              }
            } catch (error) {
              console.error("Error updating user data in localStorage", error);
            }
          }
        }
      }
    );

    // THEN check for existing session
    console.log("Checking for existing session");
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Existing session check result:", session ? "Session found" : "No session found");
      if (session?.user) {
        console.log("User from session:", session.user.email);
        
        // Save the user to localStorage for persistence
        try {
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
            email: session.user.email,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || "user",
            avatar: session.user.user_metadata?.avatar_url || "/placeholder.svg",
            isLoggedIn: true,
            createdAt: session.user.created_at
          };
          
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          console.error("Error saving user data to localStorage", error);
        }
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
