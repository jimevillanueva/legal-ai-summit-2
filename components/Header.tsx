import React, { useState } from 'react';
import { ExternalLinkIcon, UploadIcon, DownloadIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import EmailLoginModal from './EmailLoginModal';

interface HeaderProps {
  onShare: () => void;
  onImportExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShare, onImportExport }) => {
  const { user, signOut, loading, role, isAdmin, isUser, canViewDetails, emailUser, loginWithEmail, logoutEmail } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleEmailLogin = async (email: string) => {
    setLoginLoading(true);
    setLoginError(null);
    
    try {
      const result = await loginWithEmail(email);
      if (result.success) {
        setIsLoginModalOpen(false);
        setLoginError(null);
      } else {
        setLoginError(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      setLoginError('Error inesperado al iniciar sesión');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (emailUser) {
      logoutEmail();
    } else if (user) {
      signOut();
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Admin</span>
        </div>
      );
    }
    if (isUser) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span>Usuario</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <header className="relative shadow-2xl border-b border-white/10">
        {/* Fondo con gradiente y patrón */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative z-10 px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
                  <img src="/logos/LAIS.png" alt="Logo Cumbre IA Legal" className="h-12 w-auto" />
                </div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-white">Cumbre Legal AI</h1>
                <p className="text-sm text-blue-200">Agenda Interactiva</p>
              </div>
            </div>

            {/* Controles del usuario */}
            <div className="flex items-center space-x-4">
              {!loading && (
                <>
                  {(user || emailUser) ? (
                    <div className="flex items-center space-x-4">
                      {/* Información del usuario */}
                      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {(emailUser?.email || user?.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-semibold">
                            {emailUser?.email || user?.email}
                          </span>
                          {getRoleBadge()}
                        </div>
                      </div>
                      
                      {/* Botón de cerrar sesión */}
                      <button
                        onClick={handleLogout}
                        className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 rounded-xl transition-all duration-200 border border-red-400/30 hover:border-red-400/50 backdrop-blur-sm hover:shadow-lg hover:shadow-red-500/20"
                      >
                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-white text-sm font-medium">
                          {canViewDetails ? 'No autenticado' : 'Vista pública'}
                        </div>
                        <div className="text-blue-200 text-xs">
                          {canViewDetails ? 'Acceso limitado' : 'Solo lectura'}
                        </div>
                      </div>
                      {!canViewDetails && (
                        <button
                          onClick={() => setIsLoginModalOpen(true)}
                          className="group flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          <span>Iniciar Sesión</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {/* Botones de administración */}
              {isAdmin && (
                <div className="flex items-center space-x-3">
                  <a
                    href="/admin"
                    className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 rounded-xl transition-all duration-200 border border-purple-400/30 hover:border-purple-400/50 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Panel Admin</span>
                  </a>
                  
                  <button
                    onClick={onImportExport}
                    className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 rounded-xl transition-all duration-200 border border-emerald-400/30 hover:border-emerald-400/50 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/20"
                  >
                    <UploadIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Importar / Exportar</span>
                  </button>
                </div>
              )}
              
              {/* Botón de compartir */}
              <button
                onClick={onShare}
                className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 hover:from-indigo-500/30 hover:to-indigo-600/30 rounded-xl transition-all duration-200 border border-indigo-400/30 hover:border-indigo-400/50 backdrop-blur-sm hover:shadow-lg hover:shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              >
                <ExternalLinkIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <EmailLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginError(null);
        }}
        onLogin={handleEmailLogin}
        loading={loginLoading}
        error={loginError}
      />
    </>
  );
};

export default Header;