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
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Admin
        </span>
      );
    }
    if (isUser) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          Usuario
        </span>
      );
    }
    return null;
  };

  return (
    <header className="shadow-md p-4 flex justify-between items-center sticky top-0 z-20" style={{backgroundColor: '#0F1BF7'}}>
      <div className="flex items-center space-x-4">
        <img src="/logos/LAIS.png" alt="Logo Cumbre IA Legal" className="h-12 w-auto" />
      </div>
      <div className="flex items-center space-x-3">
        {!loading && (
          <>
            {(user || emailUser) ? (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-white text-sm">
                    {emailUser?.email || user?.email}
                  </span>
                  {getRoleBadge()}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors border border-red-400 border-opacity-30"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="text-white text-sm">
                  {canViewDetails ? 'No autenticado' : 'Vista pública'}
                </div>
                {!canViewDetails && (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors border border-blue-400 border-opacity-30"
                  >
                    Iniciar Sesión
                  </button>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Solo mostrar botones de administración si es admin */}
        {isAdmin && (
          <>
            <a
              href="/admin"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors border border-white border-opacity-30"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Panel Admin</span>
            </a>
            <button
              onClick={onImportExport}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors border border-white border-opacity-30"
            >
              <UploadIcon className="h-4 w-4" />
              <span>Importar / Exportar</span>
            </button>
          </>
        )}
        
        <button
          onClick={onShare}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 transition-colors border border-white border-opacity-30"
        >
          <ExternalLinkIcon className="h-4 w-4" />
          <span>Compartir</span>
        </button>
      </div>

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
    </header>
  );
};

export default Header;