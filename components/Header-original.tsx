import React from 'react';
import { ExternalLinkIcon, UploadIcon, DownloadIcon } from './icons';

interface HeaderProps {
  onShare: () => void;
  onImportExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShare, onImportExport }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Legal AI Summit</h1>
      <div className="flex items-center space-x-3">
        <button
          onClick={onImportExport}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <UploadIcon className="h-4 w-4" />
          <span>Import / Export</span>
        </button>
        <button
          onClick={onShare}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-colors"
        >
          <ExternalLinkIcon className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>
    </header>
  );
};

export default Header;