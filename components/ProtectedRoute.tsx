import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, useSupabase } from '../utils/supabaseClient';
import AdminLogin from './AdminLogin';
import AdminWelcome from './AdminWelcome';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return;

      if (!user) {
        setIsAdmin(false);
        setIsChecking(false);
        setShowLogin(true);
        return;
      }

      try {
        // Verificar que Supabase esté disponible
        if (!useSupabase() || !supabase) {
          setIsAdmin(false);
          setShowLogin(true);
          return;
        }

        // Verificar si el usuario es admin en user_profiles
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('rol')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError || !profileData) {
          setIsAdmin(false);
          setShowLogin(true);
        } else if (profileData.rol === 'admin') {
          setIsAdmin(true);
          setShowLogin(false);
          // Mostrar pantalla de bienvenida para admin autenticado
          return;
        } else {
          setIsAdmin(false);
          setShowLogin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setShowLogin(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setShowLogin(false);
  };

  const handleBackToMain = () => {
    window.location.href = '/';
  };

  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <AdminLogin 
        onLoginSuccess={handleLoginSuccess}
        onBack={handleBackToMain}
      />
    );
  }

  if (isAdmin) {
    return <AdminWelcome />;
  }

  // Fallback - no debería llegar aquí
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Acceso Denegado
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No tienes permisos para acceder a esta sección.
        </p>
        <button
          onClick={handleBackToMain}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default ProtectedRoute;
