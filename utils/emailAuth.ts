import { supabase } from './supabaseClient';

export interface EmailAuthResult {
  success: boolean;
  error?: string;
  user?: {
    email: string;
    role: 'admin' | 'user';
    name: string;
  };
}

export interface SessionInfo {
  email: string;
  role: 'admin' | 'user';
  name: string;
  expiresAt: number;
}

// In-memory session storage instead of localStorage
let currentSession: SessionInfo | null = null;
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

export const emailAuth = {
  // Verificar si el email está en la base de datos
  async verifyEmail(email: string): Promise<EmailAuthResult> {
    try {
      if (!supabase) {
        return { success: false, error: 'Servicio no disponible' };
      }

      // Verificar si está en contacts (user)
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('email, name')
        .eq('email', email)
        .single();

      if (contactData && !contactError) {
        return {
          success: true,
          user: {
            email: contactData.email,
            role: 'user',
            name: contactData.name
          }
        };
      }

      // Verificar si está en user_profiles (admin)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('email, name, role')
        .eq('email', email)
        .single();

      if (profileData && !profileError) {
        return {
          success: true,
          user: {
            email: profileData.email,
            role: profileData.role as 'admin' | 'user',
            name: profileData.name
          }
        };
      }

      return { success: false, error: 'Email no autorizado' };
    } catch (error) {
      console.error('Error verifying email:', error);
      return { success: false, error: 'Error al verificar el email' };
    }
  },

  // Crear sesión local
  createSession(user: { email: string; role: 'admin' | 'user'; name: string }): void {
    const sessionInfo: SessionInfo = {
      email: user.email,
      role: user.role,
      name: user.name,
      expiresAt: Date.now() + SESSION_DURATION
    };

    currentSession = sessionInfo;
  },

  // Obtener sesión actual
  getCurrentSession(): SessionInfo | null {
    if (!currentSession) return null;
    
    // Verificar si la sesión ha expirado
    if (Date.now() > currentSession.expiresAt) {
      this.clearSession();
      return null;
    }

    return currentSession;
  },

  // Verificar si la sesión es válida
  isSessionValid(): boolean {
    const session = this.getCurrentSession();
    return session !== null;
  },

  // Limpiar sesión
  clearSession(): void {
    currentSession = null;
  },

  // Renovar sesión (extender tiempo de expiración)
  renewSession(): void {
    const session = this.getCurrentSession();
    if (session) {
      this.createSession({
        email: session.email,
        role: session.role,
        name: session.name
      });
    }
  }
};

