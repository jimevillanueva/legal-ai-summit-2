import React, { useState } from 'react';
import { supabase, useSupabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { refreshAuth } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verificar que Supabase esté disponible
      if (!useSupabase() || !supabase) {
        setError('Supabase no está configurado. Por favor, configura las variables de entorno VITE_USE_SUPABASE=true, VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en un archivo .env');
        setLoading(false);
        return;
      }

      // Autenticar con Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('No se pudo autenticar el usuario');
        setLoading(false);
        return;
      }
      console.log('data.user', data.user);
      // Verificar si el usuario es admin en user_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('rol')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData) {
        setError('Usuario no autorizado. Solo los administradores pueden acceder.');
        await supabase.auth.signOut(); // Cerrar sesión si no es admin
        setLoading(false);
        return;
      }

      if (profileData.rol !== 'admin') {
        setError('Usuario no autorizado. Solo los administradores pueden acceder.');
        await supabase.auth.signOut(); // Cerrar sesión si no es admin
        setLoading(false);
        return;
      }

      
      // Forzar actualización del contexto de autenticación
      await refreshAuth();
      
      // Esperar un momento adicional para asegurar que el contexto se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onLoginSuccess();
      
      // Mostrar mensaje de éxito y redirigir
      setError(''); // Limpiar errores
      setLoading(false);
      
      // Mostrar mensaje de éxito temporal
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md z-50';
      successMessage.textContent = '¡Login exitoso! Redirigiendo...';
      document.body.appendChild(successMessage);
      
      // Redirigir después de un momento
      setTimeout(() => {
        document.body.removeChild(successMessage);
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError('Error inesperado durante el login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si Supabase está configurado
  const isSupabaseConfigured = useSupabase() && supabase;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Acceso Administrativo
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Inicia sesión con tu cuenta de administrador
          </p>
          {!isSupabaseConfigured && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Supabase no está configurado.</strong><br />
                Configura las variables de entorno en un archivo .env:
                <br />• VITE_USE_SUPABASE=true
                <br />• VITE_SUPABASE_URL=tu_url
                <br />• VITE_SUPABASE_ANON_KEY=tu_key
              </p>
            </div>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={!isSupabaseConfigured}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={!isSupabaseConfigured}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Tu contraseña"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
            
            <button
              type="button"
              onClick={onBack}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver al inicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
