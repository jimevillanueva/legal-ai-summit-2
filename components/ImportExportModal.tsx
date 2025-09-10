import React, { useState, useEffect } from 'react';
import type { Schedule } from '../types';
import { XIcon } from './icons';
import { exportToAppleCalendar, downloadICSFile } from '../utils/calendarExport';

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
  const [activeTab, setActiveTab] = useState<'json' | 'calendar'>('calendar');

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
      onImport(newSchedule);
      onClose();
    } catch (error) {
      setImportError('Formato JSON inválido. Por favor verifica el contenido e intenta de nuevo.');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(jsonText).then(() => {
        setCopySuccess('¡Copiado al portapapeles!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Error al copiar.');
    });
  };

  const handleExportToApple = () => {
    exportToAppleCalendar(schedule);
    setCopySuccess('¡Archivo .ics descargado para Apple Calendar!');
    setTimeout(() => setCopySuccess(''), 3000);
  };

  const handleExportToOutlook = () => {
    downloadICSFile(schedule, 'cumbre-ia-legal-outlook.ics');
    setCopySuccess('¡Archivo .ics descargado para Outlook!');
    setTimeout(() => setCopySuccess(''), 3000);
  };

  const handleExportToGoogleCalendarAll = () => {
    // Generate a single Google Calendar URL with the first session as template
    const allSessions = Object.values(schedule)
      .flatMap(day => Object.values(day))
      .flat()
      .filter(session => session.status !== 'Cancelada');
    
    if (allSessions.length > 0) {
      const googleURL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Cumbre+de+IA+Legal+2025&dates=20250929T080000/20251003T170000&details=Evento+completo+de+${allSessions.length}+sesiones&location=Ciudad+de+México&ctz=America/Mexico_City`;
      window.open(googleURL, '_blank');
      setCopySuccess('¡Abriendo Google Calendar!');
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-100">Importar / Exportar Agenda</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'calendar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            📅 Exportar a Calendarios
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'json' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            💾 JSON Import/Export
          </button>
        </div>

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">Exporta toda la agenda a tu aplicación de calendario favorita:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Apple Calendar / iCal */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🍎</span>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Apple Calendar</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Compatible con Apple Calendar, iCal, y la mayoría de aplicaciones de calendario.
                </p>
                <button
                  onClick={handleExportToApple}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Descargar .ics
                </button>
              </div>

              {/* Google Calendar */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Google Calendar</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Abre Google Calendar directamente en tu navegador.
                </p>
                <button
                  onClick={handleExportToGoogleCalendarAll}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Abrir en Google
                </button>
              </div>

              {/* Outlook */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">📧</span>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Outlook</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Compatible con Microsoft Outlook y otras aplicaciones.
                </p>
                <button
                  onClick={handleExportToOutlook}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Descargar .ics
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-100 mb-2">💡 Exportación Individual</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Para exportar sesiones individuales, pasa el mouse sobre cualquier sesión y usa los botones "G" (Google) o "📅" (Apple/Outlook).
              </p>
            </div>
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">Puedes exportar la agenda actual como JSON, o pegar un JSON válido para importarlo.</p>
            
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full h-64 p-2 font-mono text-sm border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-600"
              aria-label="Datos JSON de la agenda"
            />

            {importError && <p className="text-red-500 text-sm">{importError}</p>}
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleCopyToClipboard} 
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Copiar JSON
              </button>
              <button 
                onClick={handleImport} 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Importar JSON
              </button>
            </div>
          </div>
        )}

        {copySuccess && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-md text-sm">
            {copySuccess}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportExportModal;