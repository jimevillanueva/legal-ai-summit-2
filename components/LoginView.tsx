import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface LoginViewProps {
  onAuthSuccess: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const verifyEmailInContacts = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Error verifying email:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error verifying email:', error);
      return false;
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Verificar que el email esté en la tabla contacts
      const isEmailValid = await verifyEmailInContacts(email);
      
      if (!isEmailValid) {
        setError('Este email no está autorizado para acceder al cronograma. Contacta al administrador.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) throw error;
      
      setEmailSent(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar nuevamente que el email esté en contacts
      const isEmailValid = await verifyEmailInContacts(email);
      
      if (!isEmailValid) {
        setError('Este email no está autorizado para acceder al cronograma. Contacta al administrador.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) throw error;
      
      setEmailSent(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <img 
              src="/logos/LAIS.png" 
              alt="Logo Cumbre IA Legal" 
              className="mx-auto h-16 w-auto mb-6" 
            />
            <h2 className="text-3xl font-bold text-white mb-4">
              ¡Revisa tu email!
            </h2>
            <p className="text-blue-100 mb-6">
              Te hemos enviado un enlace mágico a <strong className="text-white">{email}</strong>
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-lg text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Enlace enviado
              </h3>
              <p className="text-gray-600 text-sm">
                Haz clic en el enlace que te enviamos por email para acceder a tu cuenta.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                {loading ? 'Reenviando...' : 'Reenviar email'}
              </button>
              
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setError(null);
                }}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Usar otro email
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="text-center text-xs text-blue-200">
            <p>¿No recibiste el email? Revisa tu carpeta de spam</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <img 
            src="/logos/LAIS.png" 
            alt="Logo Cumbre IA Legal" 
            className="mx-auto h-16 w-auto mb-6" 
          />
          <h2 className="text-3xl font-bold text-white">
            Acceder al Cronograma
          </h2>
          <p className="mt-2 text-sm text-blue-100">
            Ingresa tu email autorizado para recibir un enlace mágico
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleMagicLink} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Autorizado
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                Solo emails previamente autorizados pueden acceder
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Verificando...' : 'Enviar enlace mágico'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Acceso seguro sin contraseña</span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-blue-200">
          <p>Al continuar, aceptas nuestros términos de servicio y política de privacidad</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;