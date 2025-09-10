
import React, { useState, useEffect } from 'react';
import type { Schedule } from '../types';
import { XIcon } from './icons';

interface ImportExportModalProps {
  schedule: Schedule;
  isOpen: boolean;
  onClose: () => void;
  onImport: (newSchedule: Schedule) => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({ schedule, isOpen, onClose, onImport }) => {
  const [jsonText, setJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(schedule, null, 2));
      setImportError('');
      setCopySuccess('');
    }
  }, [isOpen, schedule]);

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      const newSchedule = JSON.parse(jsonText);
      // Basic validation could be added here
      onImport(newSchedule);
      onClose();
    } catch (error) {
      setImportError('Invalid JSON format. Please check the content and try again.');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(jsonText).then(() => {
        setCopySuccess('Copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Failed to copy.');
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Import / Export Schedule</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">You can export the current schedule as JSON, or paste a valid schedule JSON to import it.</p>
        
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="w-full h-64 p-2 font-mono text-sm border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-600"
          aria-label="Schedule JSON data"
        />

        {importError && <p className="text-red-500 text-sm mt-2">{importError}</p>}
        {copySuccess && <p className="text-green-500 text-sm mt-2">{copySuccess}</p>}

        <div className="flex justify-end mt-4 space-x-2">
            <button onClick={handleCopyToClipboard} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500">
                Copy JSON
            </button>
            <button onClick={handleImport} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500">
                Import This JSON
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;
