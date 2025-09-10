import React from 'react';
import type { Session, Track } from '../types';
import { AlertTriangleIcon } from './icons';
import { exportToGoogleCalendar, exportSelectedSessions } from '../utils/calendarExport';

interface SessionCardProps {
  session: Session;
  tracks: Track[];
  onDoubleClick: (session: Session) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, session: Session) => void;
  isCompact?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, tracks, onDoubleClick, onDragStart, isCompact = false }) => {
  const track = tracks.find(t => t.id === session.trackId) || tracks[0];

  const statusColor = {
    'Propuesta': 'border-l-4 border-dashed border-blue-400',
    'Confirmada': 'border-l-4 border-blue-600',
    'Anunciada': 'border-l-4 border-blue-800',
    'Cancelada': 'border-l-4 border-red-500 opacity-60',
  };

  const handleExportToGoogle = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportToGoogleCalendar(session);
  };

  const handleExportToApple = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportSelectedSessions([session], `${session.title.replace(/\s+/g, '-').toLowerCase()}.ics`);
  };

  const handleZoomClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (session.zoomLink) {
      window.open(session.zoomLink, '_blank');
    }
  };

  if (isCompact) {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, session)}
        onDoubleClick={() => onDoubleClick(session)}
        className={`p-1 rounded-md flex flex-col cursor-pointer transition-all duration-200 ease-in-out relative group hover:z-10 min-h-12 max-h-12 hover:max-h-20 ${statusColor[session.status]}`}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(156, 163, 175, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        }}
      >
        <div className="flex-1 overflow-hidden">
          <h4 className="font-medium text-xs leading-none text-blue-900 dark:text-blue-100 truncate">{session.title}</h4>
          <p className="text-xs text-blue-700 dark:text-blue-200 opacity-60 leading-none truncate">
            {session.speakers.map(s => s.name.split(' ')[0]).slice(0, 2).join(', ')}
          </p>
          
          {/* Información expandida en hover */}
          <div className="opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-12 overflow-hidden transition-all duration-200 mt-1">
            {/* Mini menú de la sesión */}
            <div className="flex space-x-0.5 mb-1">
              <span className="text-xs bg-gray-900 text-white px-1 py-0.5 rounded">Resumen</span>
              <span className="text-xs text-gray-500 px-1 py-0.5 rounded hover:bg-gray-100">Detalles</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs bg-gray-200 text-gray-700 px-1 py-0.5 rounded">
                {track.name.slice(0, 3)}
              </span>
              {session.zoomLink && (
                <button
                  onClick={handleZoomClick}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-1 py-0.5 rounded"
                >
                  Z
                </button>
              )}
            </div>
          </div>
        </div>
        {session.hasConflict && (
          <div className="absolute top-1 right-1 text-red-500" title="Conflicto de ponentes detectado!">
            <AlertTriangleIcon className="h-3 w-3" />
          </div>
        )}
        {/* Export buttons on hover */}
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-1">
          <button
            onClick={handleExportToGoogle}
            className="w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-gray-200"
            title="Exportar a Google Calendar"
          >
            <img src="/logos/google.svg" alt="Google" className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={handleExportToApple}
            className="w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-gray-200"
            title="Exportar a Apple Calendar / Outlook"
          >
            <img src="/logos/apple.svg" alt="Apple" className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, session)}
      onDoubleClick={() => onDoubleClick(session)}
      className={`h-full p-1.5 rounded-md flex flex-col cursor-pointer transition-all duration-200 ease-in-out relative group hover:z-10 ${statusColor[session.status]}`}
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(156, 163, 175, 0.4)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
      }}
    >
      <div className="flex-1">
        <h3 className="font-medium text-sm leading-tight text-blue-900 dark:text-blue-100">{session.title}</h3>
        <p className="text-xs mt-0.5 text-blue-700 dark:text-blue-200 opacity-70 leading-tight">
          {session.speakers.map(s => s.name.split(' ')[0]).join(', ')}
        </p>
        
        {/* Menú y información expandida en hover */}
        <div className="opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-300 mt-2 space-y-1.5">
          {/* Mini menú de la sesión */}
          <div className="flex space-x-1">
            <span className="text-xs font-medium bg-gray-900 text-white px-2 py-0.5 rounded">Resumen</span>
            <span className="text-xs font-medium text-gray-500 px-2 py-0.5 rounded hover:bg-gray-100">Detalles</span>
            <span className="text-xs font-medium text-gray-500 px-2 py-0.5 rounded hover:bg-gray-100">Asistir</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
              {track.name.split(' ')[0].slice(0, 4)}
            </span>
            {session.zoomLink && (
              <button
                onClick={handleZoomClick}
                className="px-2 py-0.5 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs transition-colors"
              >
                Zoom
              </button>
            )}
          </div>
          <p className="text-xs text-gray-600">📍 {session.room} • {session.status}</p>
        </div>
      </div>
      {session.hasConflict && (
        <div className="absolute top-2 right-2 text-red-500" title="Conflicto de ponentes detectado!">
          <AlertTriangleIcon className="h-4 w-4" />
        </div>
      )}
      {/* Export buttons on hover */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-1">
        <button
          onClick={handleExportToGoogle}
          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-gray-200"
          title="Exportar a Google Calendar"
        >
          <img src="/logos/google.svg" alt="Google" className="w-3 h-3" />
        </button>
        <button
          onClick={handleExportToApple}
          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-gray-200"
          title="Exportar a Apple Calendar / Outlook"
        >
          <img src="/logos/apple.svg" alt="Apple" className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default SessionCard;