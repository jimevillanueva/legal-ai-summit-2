import React, { useState } from 'react';
import { ExternalLinkIcon, UploadIcon, DownloadIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import EmailLoginModal from './EmailLoginModal';
import '../styles/Header.css';

interface HeaderProps {
  onShare: () => void;
  onImportExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShare, onImportExport }) => {
  const { user, signOut, loading, role, isAdmin, isUser, canViewDetails, emailUser, loginWithEmail, logoutEmail } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <div className="role-badge role-badge-admin">
          <div className="role-dot role-dot-pulse"></div>
          <span>Admin</span>
        </div>
      );
    }
    if (isUser) {
      return (
        <div className="role-badge role-badge-user">
          <div className="role-dot"></div>
          <span>Usuario</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <header className="header-container">
        <div className="header-background"></div>
        <div className="header-pattern"></div>
        
        <div className="header-content">
          <div className="header-main">
            {/* Logo y título */}
            <a href="/"> 
            <div className="logo-section">
              
              <div className="logo-container">
                <div className="logo-glow"></div>
                <div className="logo-wrapper">
                  <img src="/logos/LAIS.png" alt="Logo Cumbre IA Legal" className="h-6 sm:h-8 md:h-12 w-auto" />
                </div>
              </div>
             
              <div className="logo-title">
                <h1 className="text-xs sm:text-sm md:text-xl">LEGAL AI SUMMIT 2025</h1>
                <p className="text-xs sm:text-sm">Agenda Interactiva</p>
              </div>
            </div>
            </a>

            {/* Menú hamburguesa para móvil */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Botón hamburguesa - Solo visible en móvil */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="block sm:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                aria-label="Abrir menú"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Controles del usuario - Ocultos en móvil cuando el menú está cerrado */}
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
                {!loading && (
                  <>
                    {(user || emailUser) ? (
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Información del usuario */}
                        <div className="user-info">
                          <div className="user-avatar w-6 h-6 sm:w-10 sm:h-10 text-xs sm:text-sm">
                            {(emailUser?.email || user?.email)?.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-details hidden sm:flex">
                            <span className="user-email text-xs sm:text-sm">
                              {(emailUser?.email || user?.email)?.length > 20 
                                ? `${(emailUser?.email || user?.email)?.substring(0, 20)}...` 
                                : (emailUser?.email || user?.email)
                              }
                            </span>
                            {getRoleBadge()}
                          </div>
                        </div>
                        
                        {/* Botón de cerrar sesión */}
                        <button
                          onClick={handleLogout}
                          className="btn-base btn-logout btn-icon-hover text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                        >
                          <svg className="btn-icon w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="status-container hidden sm:block">
                          <div className="status-main text-xs sm:text-sm">
                            {canViewDetails ? 'No autenticado' : 'Vista pública'}
                          </div>
                          <div className="status-sub text-xs">
                            {canViewDetails ? 'Acceso limitado' : 'Solo lectura'}
                          </div>
                        </div>
                        {!canViewDetails && (
                          <button
                            onClick={() => setIsLoginModalOpen(true)}
                            className="btn-base btn-login btn-icon-hover text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                          >
                            <svg className="btn-icon w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:inline">Iniciar Sesión</span>
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
                
                {/* Botones de administración */}
                {isAdmin && (
                  <div className="admin-controls">
                    <a
                      href="/admin"
                      className="btn-base btn-admin btn-icon-hover text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                    >
                      <svg className="btn-icon w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="hidden sm:inline">Panel Admin</span>
                    </a>
                    
                    <button
                      onClick={onImportExport}
                      className="btn-base btn-import btn-icon-hover text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                    >
                      <UploadIcon className="btn-icon w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Importar / Exportar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menú móvil desplegable */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Menú deslizable desde la derecha */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white/10 backdrop-blur-xl border-l border-white/20 shadow-2xl">
            <div className="p-6">
              {/* Header del menú */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-lg font-semibold">Menú</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del menú */}
              <div className="space-y-4">
                {/* Información del usuario */}
                {(user || emailUser) ? (
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(emailUser?.email || user?.email)?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {emailUser?.email || user?.email}
                        </p>
                        {getRoleBadge()}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-200 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20 text-center">
                    <p className="text-white/80 text-sm mb-3">
                      {canViewDetails ? 'No autenticado' : 'Vista pública'}
                    </p>
                    {!canViewDetails && (
                      <button
                        onClick={() => {
                          setIsLoginModalOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Iniciar Sesión
                      </button>
                    )}
                  </div>
                )}

                {/* Opciones de administración */}
                {isAdmin && (
                  <div className="space-y-2">
                    <a
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Panel de Administración
                    </a>
                    
                    <button
                      onClick={() => {
                        onImportExport();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
                    >
                      <UploadIcon className="w-5 h-5" />
                      Importar / Exportar
                    </button>
                  </div>
                )}

                {/* Opciones adicionales */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onShare();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
                  >
                    <ExternalLinkIcon className="w-5 h-5" />
                    Compartir Agenda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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