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
        className={`p-1.5 rounded-lg flex flex-col cursor-pointer transition-all duration-300 ease-in-out relative group hover:scale-110 hover:z-30 min-h-12 hover:min-h-32 hover:w-72 ${statusColor[session.status]}`}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(156, 163, 175, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.18)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        }}
      >
        <div className="flex-1">
          {/* Contenido normal */}
          <h4 className="font-medium text-xs leading-tight text-blue-900 dark:text-blue-100 truncate">{session.title}</h4>
          <p className="text-xs text-blue-700 dark:text-blue-200 opacity-60 leading-tight truncate">
            {session.speakers.map(s => s.name.split(' ')[0]).join(', ')}
          </p>
          
          {/* Contenido expandido - SIN restricción de altura */}
          <div className="opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-96 overflow-hidden transition-all duration-300 mt-2 space-y-2">
            {/* Mini menú integrado */}
            <div className="flex space-x-1">
              <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded">Resumen</span>
              <span className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100">Detalles</span>
              <span className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100">Asistir</span>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">Ponentes completos:</p>
              <p className="text-xs text-blue-700">
                {session.speakers.map(s => s.name).join(', ')}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                {track.name}
              </span>
              {session.zoomLink && (
                <button
                  onClick={handleZoomClick}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm transition-colors"
                >
                  📹 Unirse a Zoom
                </button>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-600">📍 <strong>Sala:</strong> {session.room}</p>
              <p className="text-sm text-gray-600">🔘 <strong>Estado:</strong> {session.status}</p>
              {session.notes && (
                <p className="text-sm text-gray-600">📝 <strong>Notas:</strong> {session.notes}</p>
              )}
            </div>
          </div>
        </div>

        {session.hasConflict && (
          <div className="absolute top-1 right-1 text-red-500" title="Conflicto de ponentes detectado!">
            <AlertTriangleIcon className="h-3 w-3" />
          </div>
        )}

        {/* Botones de exportación en hover */}
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <button
            onClick={handleExportToGoogle}
            className="w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center shadow-sm"
            title="Exportar a Google Calendar"
          >
            <img src="/logos/google.svg" alt="Google" className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={handleExportToApple}
            className="w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center shadow-sm"
            title="Exportar a Apple Calendar"
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
      className={`h-full p-2 rounded-lg flex flex-col cursor-pointer transition-all duration-300 ease-in-out relative group hover:scale-110 hover:z-30 hover:w-80 ${statusColor[session.status]}`}
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(156, 163, 175, 0.4)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
      }}
    >
      <div className="flex-1">
        {/* Contenido normal */}
        <h3 className="font-medium text-sm leading-tight text-blue-900 dark:text-blue-100">{session.title}</h3>
        <p className="text-xs mt-1 text-blue-700 dark:text-blue-200 opacity-70 leading-tight">
          {session.speakers.map(s => s.name.split(' ')[0]).join(', ')}
        </p>
        
        {/* Contenido expandido - MUCHO más espacio */}
        <div className="opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-96 overflow-hidden transition-all duration-300 mt-3 space-y-3">
          {/* Mini menú integrado */}
          <div className="flex space-x-2">
            <span className="text-sm bg-gray-900 text-white px-3 py-1 rounded">Resumen</span>
            <span className="text-sm text-gray-500 px-3 py-1 rounded hover:bg-gray-100">Detalles</span>
            <span className="text-sm text-gray-500 px-3 py-1 rounded hover:bg-gray-100">Asistir</span>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold text-blue-900">Ponentes:</p>
              <p className="text-sm text-blue-700">
                {session.speakers.map(s => s.name).join(', ')}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                📂 {track.name}
              </span>
              {session.zoomLink && (
                <button
                  onClick={handleZoomClick}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm transition-colors flex items-center space-x-2"
                >
                  <span>📹</span>
                  <span>Unirse a Zoom</span>
                </button>
              )}
            </div>
            
            <div className="space-y-2 border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-700">📍 <strong>Sala:</strong> {session.room}</p>
              <p className="text-sm text-gray-700">🔘 <strong>Estado:</strong> {session.status}</p>
              {session.notes && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">📝 Notas:</p>
                  <p className="text-sm text-gray-600">{session.notes}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 italic">Doble-click para editar esta sesión</p>
            </div>
          </div>
        </div>
      </div>

      {session.hasConflict && (
        <div className="absolute top-2 right-2 text-red-500" title="Conflicto de ponentes detectado!">
          <AlertTriangleIcon className="h-4 w-4" />
        </div>
      )}

      {/* Botones de exportación en hover */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
        <button
          onClick={handleExportToGoogle}
          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center shadow-sm"
          title="Exportar a Google Calendar"
        >
          <img src="/logos/google.svg" alt="Google" className="w-3 h-3" />
        </button>
        <button
          onClick={handleExportToApple}
          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center shadow-sm"
          title="Exportar a Apple Calendar"
        >
          <img src="/logos/apple.svg" alt="Apple" className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default SessionCard;