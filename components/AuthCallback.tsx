import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('Procesando enlace mágico...');
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...');
        console.log('Current URL:', window.location.href);
        
        // Obtener los parámetros de la URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        console.log('URL params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, error, errorDescription });

        if (error) {
          console.error('Auth error from URL:', error, errorDescription);
          throw new Error(errorDescription || error);
        }

        if (accessToken && refreshToken) {
          console.log('Setting session with tokens...');
          setCurrentStep('Estableciendo sesión...');
          
          // Intercambiar el código por la sesión
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          console.log('Session result:', { data: !!data.session, error: sessionError });

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }

          if (data.session) {
            console.log('Session created successfully');
            setCurrentStep('Sesión establecida correctamente...');
            // No redirigir aquí, dejar que el useEffect detecte el cambio de usuario
            // Limpiar la URL para evitar bucles
            window.history.replaceState({}, document.title, '/');
          } else {
            throw new Error('No se pudo crear la sesión');
          }
        } else {
          // Si no hay tokens en la URL, verificar si ya hay una sesión activa
          console.log('No tokens in URL, checking current session...');
          setCurrentStep('Verificando sesión existente...');
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Error getting current session:', sessionError);
            throw sessionError;
          }

          if (session) {
            console.log('Current session found');
            setCurrentStep('Sesión encontrada, configurando...');
            // No redirigir aquí, dejar que el useEffect detecte el cambio de usuario
            // Limpiar la URL para evitar bucles
            window.history.replaceState({}, document.title, '/');
          } else {
            throw new Error('No hay sesión activa. El enlace puede haber expirado.');
          }
        }
      } catch (err: any) {
        console.error('Error en callback de autenticación:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    // Solo procesar si hay parámetros en la URL o si es la primera vez
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hasTokens = hashParams.get('access_token') || hashParams.get('refresh_token');
    const hasError = hashParams.get('error');
    
    if (hasTokens || hasError) {
      handleAuthCallback();
    } else {
      // Si no hay parámetros, verificar sesión actual y redirigir
      console.log('No auth parameters, checking current session...');
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (session) {
          console.log('Session found');
          // No redirigir aquí, dejar que el useEffect detecte el cambio de usuario
          window.history.replaceState({}, document.title, '/');
        } else {
          console.log('No session found, redirecting to login...');
          setError('No hay sesión activa');
          setStatus('error');
        }
      });
    }
  }, []);

  // Efecto para detectar cuando el usuario se ha autenticado exitosamente
  useEffect(() => {
    if (user && !loading && status === 'loading') {
      console.log('User authenticated successfully, redirecting...');
      setCurrentStep('Configurando tu perfil...');
      setStatus('success');
      // Limpiar la URL antes de redirigir
      window.history.replaceState({}, document.title, '/');
      setTimeout(() => {
        window.location.replace('/');
      }, 1000);
    }
  }, [user, loading, status]);

  // Mostrar loading mientras se procesa la autenticación
  if (status === 'loading' || (user && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Verificando acceso...
          </h2>
          <p className="text-blue-100 mb-6">
            {currentStep}
          </p>
          
          {/* Indicador de progreso */}
          <div className="w-full bg-blue-800 rounded-full h-2 mb-4">
            <div className="bg-white h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
          
          <p className="text-blue-200 text-sm">
            Esto puede tomar unos segundos...
          </p>
        </div>
      </div>
    );
  }


  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <img 
              src="/logos/LAIS.png" 
              alt="Logo Cumbre IA Legal" 
              className="mx-auto h-16 w-auto mb-6" 
            />
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <h3 className="font-semibold mb-2">Error de autenticación</h3>
              <p className="text-sm">{error}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Volver al inicio
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          ¡Acceso exitoso!
        </h2>
        <p className="text-blue-100 mb-4">
          Te estamos redirigiendo al cronograma...
        </p>
        <div className="animate-pulse text-blue-200 text-sm">
          Redirigiendo en unos segundos...
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;