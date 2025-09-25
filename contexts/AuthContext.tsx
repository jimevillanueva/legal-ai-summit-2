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
  // User metadata helper
  getUserMetadata: () => {
    contact_id?: string;
    user_role?: string;
    user_name?: string;
    uid?: string;
  } | null;
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
        .maybeSingle();

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
        .maybeSingle();

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
    let isMounted = true;
    let authCheckTimeout: NodeJS.Timeout;

    // Check email session first
    const checkEmailSession = () => {
      const emailSession = emailAuth.getCurrentSession();
      if (emailSession && isMounted) {
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
      if (!isMounted) return;
      
      // Check email session first
      if (checkEmailSession()) {
        return; // Email session found, no need to check Supabase
      }

      if (!supabase) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await checkUserRole(session.user);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes with debouncing
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;
          
          // Debounce auth changes to prevent rapid re-evaluation
          clearTimeout(authCheckTimeout);
          authCheckTimeout = setTimeout(async () => {
            if (!isMounted) return;
            
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
          }, 100); // 100ms debounce
        }
      );

      return () => {
        isMounted = false;
        clearTimeout(authCheckTimeout);
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
      clearTimeout(authCheckTimeout);
    };
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
      
      // Solo actualizar si hay cambios
      if (session?.user?.id !== user?.id) {
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
    } catch (error) {
      console.error('Error refreshing auth:', error);
    }
  };

  // Función para obtener metadata del usuario desde diferentes fuentes
  const getUserMetadata = () => {
    // Primero intentar obtener desde localStorage (donde guardamos los datos del login)
    const contactId = localStorage.getItem('user_contact_id');
    const userRole = localStorage.getItem('user_role');
    const userName = localStorage.getItem('user_name');
    
    if (contactId) {
      return {
        contact_id: contactId,
        user_role: userRole || 'user',
        user_name: userName || '',
        uid: user?.id || contactId, // Usar contactId como fallback del UID
      };
    }
    
    // Fallback: si hay sesión de Supabase, usar esos datos
    if (session?.user?.user_metadata) {
      const metadata = session.user.user_metadata;
      return {
        contact_id: metadata.contact_id,
        user_role: metadata.user_role,
        user_name: metadata.user_name,
        uid: session.user.id,
      };
    }
    
    return null;
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
    // User metadata
    getUserMetadata,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};