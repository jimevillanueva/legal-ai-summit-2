import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { emailAuth, EmailAuthResult, SessionInfo } from '../utils/emailAuth';

export type UserRole = 'admin' | 'user' | 'guest' | 'loading';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isUser: boolean;
  canEdit: boolean;
  canView: boolean;
  canViewDetails: boolean;
  signOut: () => Promise<void>;
  // Email authentication
  emailUser: SessionInfo | null;
  loginWithEmail: (email: string) => Promise<EmailAuthResult>;
  logoutEmail: () => void;
  // Force refresh
  refreshAuth: () => Promise<void>;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('loading');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [emailUser, setEmailUser] = useState<SessionInfo | null>(null);

  const checkUserRole = async (currentUser: User | null) => {
    console.log('=== checkUserRole START ===');
    console.log('checkUserRole called with user:', currentUser?.email);
    console.log('supabase available:', !!supabase);
    
    if (!currentUser || !supabase) {
      console.log('No user or supabase, setting guest role');
      setRole('guest');
      setIsAdmin(false);
      setIsUser(false);
      setLoading(false);
      console.log('=== checkUserRole END (no user/supabase) ===');
      return;
    }

    try {
      console.log('Checking if user is in contacts (user)...');
      // PRIMERO: Verificar si es user (está en contacts) con timeout
      const userPromise = supabase
        .from('contacts')
        .select('email')
        .eq('email', currentUser.email)
        .single();

      const userTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User check timeout')), 5000)
      );

      const { data: userData, error: userError } = await Promise.race([
        userPromise,
        userTimeoutPromise
      ]) as any;

      console.log('User check result:', { userData, userError, userEmail: currentUser.email });

      if (userData) {
        console.log('User found in contacts, setting user role');
        setRole('user');
        setIsAdmin(false);
        setIsUser(true);
        setLoading(false);
        console.log('Role set to user, loading set to false');
        return;
      } else {
        console.log('User NOT found in contacts, checking user_profiles for admin...');
      }

      console.log('Checking if user is in user_profiles (admin)...');
      // SEGUNDO: Verificar si es admin (está en user_profiles) con timeout
      const adminPromise = supabase
        .from('user_profiles')
        .select('rol')
        .eq('id', currentUser.id)
        .single();

      const adminTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Admin check timeout')), 5000)
      );

      const { data: adminData, error: adminError } = await Promise.race([
        adminPromise,
        adminTimeoutPromise
      ]) as any;

      console.log('Admin check result:', { adminData, adminError });

      if (adminData) {
        console.log('User found in user_profiles, setting admin role');
        setRole('admin');
        setIsAdmin(true);
        setIsUser(false);
        setLoading(false);
        console.log('Role set to admin, loading set to false');
        return;
      } else {
        console.log('User NOT found in user_profiles, setting guest role');
      }

      // Si no está en ninguna tabla, es guest
      console.log('User not found in any table, setting guest role');
      setRole('guest');
      setIsAdmin(false);
      setIsUser(false);
      setLoading(false);
      console.log('Role set to guest, loading set to false');

    } catch (error) {
      console.error('Error checking user role:', error);
      setRole('guest');
      setIsAdmin(false);
      setIsUser(false);
      setLoading(false);
      console.log('Error handled, role set to guest, loading set to false');
    }
    console.log('=== checkUserRole END ===');
  };

  useEffect(() => {
    // Check email session first
    const checkEmailSession = () => {
      const emailSession = emailAuth.getCurrentSession();
      if (emailSession) {
        setEmailUser(emailSession);
        if (emailSession.role === 'admin') {
          setRole('admin');
          setIsAdmin(true);
          setIsUser(false);
        } else {
          setRole('user');
          setIsAdmin(false);
          setIsUser(true);
        }
        setLoading(false);
        return true; // Email session found
      }
      return false; // No email session
    };

    // Get initial session
    const getInitialSession = async () => {
      console.log('Getting initial session...');
      
      // Check email session first
      if (checkEmailSession()) {
        return; // Email session found, no need to check Supabase
      }

      if (!supabase) {
        console.log('No supabase client');
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkUserRole(session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state change:', event, session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('Calling checkUserRole from auth state change...');
            await checkUserRole(session.user);
            console.log('checkUserRole completed from auth state change');
          } else {
            console.log('No session user, setting guest role');
            setRole('guest');
            setIsAdmin(false);
            setIsUser(false);
            setLoading(false);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  // Email authentication functions
  const loginWithEmail = async (email: string): Promise<EmailAuthResult> => {
    const result = await emailAuth.verifyEmail(email);
    if (result.success && result.user) {
      const sessionInfo = emailAuth.createSession(result.user);
      setEmailUser(sessionInfo);
      // Actualizar el rol basado en el usuario de email
      if (result.user.role === 'admin') {
        setRole('admin');
        setIsAdmin(true);
        setIsUser(false);
      } else {
        setRole('user');
        setIsAdmin(false);
        setIsUser(true);
      }
    }
    return result;
  };

  const logoutEmail = () => {
    emailAuth.clearSession();
    setEmailUser(null);
    setRole('guest');
    setIsAdmin(false);
    setIsUser(false);
  };

  const refreshAuth = async () => {
    if (!supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkUserRole(session.user);
      } else {
        setRole('guest');
        setIsAdmin(false);
        setIsUser(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    role,
    isAdmin,
    isUser,
    canEdit: isAdmin,
    canView: true, // Cualquier usuario puede ver la agenda
    canViewDetails: isAdmin || isUser || !!emailUser, // Solo usuarios autorizados pueden ver detalles
    signOut,
    // Email authentication
    emailUser,
    loginWithEmail,
    logoutEmail,
    // Force refresh
    refreshAuth,
  };

  console.log('AuthContext value:', { 
    user: user?.email, 
    emailUser: emailUser?.email,
    role, 
    isAdmin, 
    isUser, 
    canEdit: isAdmin, 
    canView: true, 
    canViewDetails: isAdmin || isUser || !!emailUser,
    loading 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};