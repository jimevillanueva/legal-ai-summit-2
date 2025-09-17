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

    if (!currentUser || !supabase) {

      setRole('guest');
      setIsAdmin(false);
      setIsUser(false);
      setLoading(false);

      return;
    }

    try {

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


      if (userData) {
       setRole('user');
        setIsAdmin(false);
        setIsUser(true);
        setLoading(false);

        return;
      } 


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


      if (adminData) {

        setRole('admin');
        setIsAdmin(true);
        setIsUser(false);
        setLoading(false);
     
        return;
      } 

      // Si no está en ninguna tabla, es guest

      setRole('guest');
      setIsAdmin(false);
      setIsUser(false);
      setLoading(false);


    } catch (error) {

      setRole('guest');
      setIsAdmin(false);
      setIsUser(false);
      setLoading(false);

    }

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

      
      // Check email session first
      if (checkEmailSession()) {
        return; // Email session found, no need to check Supabase
      }

      if (!supabase) {

        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

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
      emailAuth.createSession(result.user);
      setEmailUser(result.user);
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
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};