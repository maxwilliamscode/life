import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAdmin: boolean;
  checkAdminStatus: () => Promise<boolean>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
};

interface UpdateProfileData {
  avatar_url?: string | null;
  // ...other profile fields...
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// List of admin emails
const ADMIN_EMAILS = ['admin@example.com', 'jbakshatbagdi@gmail.com'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to check admin status - made available in context
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // 1. Check if user's email is in the client-side admin list
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        return true;
      }
      
      // 2. Double-check with the database for extra security
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      } 
      
      if (data) {
        setIsAdmin(true);
        return true;
      }
      
      setIsAdmin(false);
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  };

  // Check for admin role based on email and directly from the database
  useEffect(() => {
    if (user?.id) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, !!session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Check admin status whenever auth state changes
        if (session?.user) {
          // Use setTimeout to avoid potential Supabase deadlocks
          setTimeout(() => {
            checkAdminStatus();
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Check admin status on initial load
      if (session?.user) {
        checkAdminStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshSession = async () => {
    const { data } = await supabase.auth.refreshSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin,
          // For this demo, we'll disable email confirmation
          data: {
            confirmed_at: new Date().toISOString()
          }
        }
      });
      
      if (error) throw error;
      
      // Check if user already exists
      if (data.user?.identities?.length === 0) {
        throw new Error('This email is already registered');
      }
      
      toast({
        title: "Sign up successful",
        description: "Welcome to LifestyleAqua! You are now signed in.",
      });
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user?.user_metadata,
          ...data
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signIn, 
      signUp, 
      signOut, 
      refreshSession,
      isAdmin,
      checkAdminStatus,
      updateProfile
    }}>
      {!isLoading && children}
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
