import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export type UserRole = 'admin' | 'user' | 'guest' | 'loading';

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>('loading');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user || !supabase) {
        setRole('guest');
        setIsAdmin(false);
        setIsUser(false);
        setLoading(false);
        return;
      }

      try {
        // Verificar si es admin
        const { data: adminData, error: adminError } = await supabase
          .from('user_profiles')
          .select('rol')
          .eq('id', user.id)
          .single();

        if (adminData && adminData.role === 'admin') {
          setRole('admin');
          setIsAdmin(true);
          setIsUser(false);
          setLoading(false);
          return;
        }

        // Verificar si es user (está en contacts)
        const { data: userData, error: userError } = await supabase
          .from('contacts')
          .select('email')
          .eq('email', user.email)
          .single();

        if (userData) {
          setRole('user');
          setIsAdmin(false);
          setIsUser(true);
          setLoading(false);
          return;
        }

        // Si no está en ninguna tabla, es guest
        setRole('guest');
        setIsAdmin(false);
        setIsUser(false);
        setLoading(false);

      } catch (error) {
        console.error('Error checking user role:', error);
        setRole('guest');
        setIsAdmin(false);
        setIsUser(false);
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  return {
    role,
    isAdmin,
    isUser,
    loading,
    canEdit: isAdmin,
    canView: isAdmin || isUser,
  };
};


