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
            <div className="logo-section">
              <div className="logo-container">
                <div className="logo-glow"></div>
                <div className="logo-wrapper">
                  <img src="/logos/LAIS.png" alt="Logo Cumbre IA Legal" className="h-12 w-auto" />
                </div>
              </div>
              <div className="logo-title">
                <h1>Cumbre Legal AI</h1>
                <p>Agenda Interactiva</p>
              </div>
            </div>

            {/* Controles del usuario */}
            <div className="user-controls">
              {!loading && (
                <>
                  {(user || emailUser) ? (
                    <div className="flex items-center space-x-4">
                      {/* Información del usuario */}
                      <div className="user-info">
                        <div className="user-avatar">
                          {(emailUser?.email || user?.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <span className="user-email">
                            {emailUser?.email || user?.email}
                          </span>
                          {getRoleBadge()}
                        </div>
                      </div>
                      
                      {/* Botón de cerrar sesión */}
                      <button
                        onClick={handleLogout}
                        className="btn-base btn-logout btn-icon-hover"
                      >
                        <svg className="btn-icon btn-icon-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <div className="status-container">
                        <div className="status-main">
                          {canViewDetails ? 'No autenticado' : 'Vista pública'}
                        </div>
                        <div className="status-sub">
                          {canViewDetails ? 'Acceso limitado' : 'Solo lectura'}
                        </div>
                      </div>
                      {!canViewDetails && (
                        <button
                          onClick={() => setIsLoginModalOpen(true)}
                          className="btn-base btn-login btn-icon-hover"
                        >
                          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="admin-controls">
                  <a
                    href="/admin"
                    className="btn-base btn-admin btn-icon-hover"
                  >
                    <svg className="btn-icon btn-icon-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Panel Admin</span>
                  </a>
                  
                  <button
                    onClick={onImportExport}
                    className="btn-base btn-import btn-icon-hover"
                  >
                    <UploadIcon className="btn-icon" />
                    <span>Importar / Exportar</span>
                  </button>
                </div>
              )}
              
              {/* Botón de compartir */}
              {/* <button
                onClick={onShare}
                className="btn-base btn-share btn-icon-hover"
              >
                <ExternalLinkIcon className="btn-icon" />
                <span>Compartir</span>
              </button> */}
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