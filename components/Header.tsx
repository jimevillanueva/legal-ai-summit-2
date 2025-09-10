import React from 'react';
import { ExternalLinkIcon, UploadIcon, DownloadIcon } from './icons';

interface HeaderProps {
  onShare: () => void;
  onImportExport: () => void;
  onManageTracks: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShare, onImportExport, onManageTracks }) => {
  return (
    <header className="shadow-md p-4 flex justify-between items-center sticky top-0 z-20" style={{backgroundColor: '#0F1BF7'}}>
      <div className="flex items-center space-x-4">
        <img src="/logos/LAIS.png" alt="Logo Cumbre IA Legal" className="h-12 w-auto" />
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={onManageTracks}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors border border-white border-opacity-30"
        >
          <span>🏷️</span>
          <span>Tracks</span>
        </button>
        <button
          onClick={onImportExport}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors border border-white border-opacity-30"
        >
          <UploadIcon className="h-4 w-4" />
          <span>Importar / Exportar</span>
        </button>
        <button
          onClick={onShare}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 transition-colors border border-white border-opacity-30"
        >
          <ExternalLinkIcon className="h-4 w-4" />
          <span>Compartir</span>
        </button>
      </div>
    </header>
  );
};

export default Header;