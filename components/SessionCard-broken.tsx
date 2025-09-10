import React, { useState } from 'react';
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
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
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

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.right + 10; // A la derecha de la tarjeta
    const y = rect.top;
    
    // Ajustar si se sale de la pantalla
    const overlayWidth = 350;
    const adjustedX = x + overlayWidth > window.innerWidth ? rect.left - overlayWidth - 10 : x;
    
    setOverlayPosition({ x: adjustedX, y });
    setShowOverlay(true);
  };

  const handleMouseLeave = () => {
    setShowOverlay(false);
  };

  const CompactCard = () => (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, session)}
      onDoubleClick={() => onDoubleClick(session)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`p-1.5 rounded-lg flex flex-col cursor-pointer transition-all duration-200 ease-in-out relative group min-h-12 hover:scale-102 hover:z-10 ${statusColor[session.status]}`}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(156, 163, 175, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      }}
    >
      <h4 className="font-medium text-xs leading-tight text-blue-900 dark:text-blue-100 truncate">{session.title}</h4>
      <p className="text-xs text-blue-700 dark:text-blue-200 opacity-60 leading-tight truncate">
        {session.speakers.map(s => s.name.split(' ')[0]).join(', ')}
      </p>
      
      {session.hasConflict && (
        <div className="absolute top-1 right-1 text-red-500" title="Conflicto de ponentes detectado!">
          <AlertTriangleIcon className="h-3 w-3" />
        </div>
      )}
    </div>
  );

  const NormalCard = () => (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, session)}
      onDoubleClick={() => onDoubleClick(session)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`h-full p-2 rounded-lg flex flex-col cursor-pointer transition-all duration-200 ease-in-out relative group hover:scale-102 hover:z-10 ${statusColor[session.status]}`}
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(156, 163, 175, 0.4)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
      }}
    >
      <h3 className="font-medium text-sm leading-tight text-blue-900 dark:text-blue-100">{session.title}</h3>
      <p className="text-xs mt-1 text-blue-700 dark:text-blue-200 opacity-70 leading-tight">
        {session.speakers.map(s => s.name.split(' ')[0]).join(', ')}
      </p>

      {session.hasConflict && (
        <div className="absolute top-2 right-2 text-red-500" title="Conflicto de ponentes detectado!">
          <AlertTriangleIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  );

  const Overlay = () => (
    showOverlay && (
      <div
        style={{
          position: 'fixed',
          top: overlayPosition.y,
          left: overlayPosition.x,
          zIndex: 1000,
          width: '350px'
        }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3"
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
      >
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-base text-blue-900 dark:text-blue-100 pr-4">{session.title}</h4>
          <div className="flex space-x-1">
            <button
              onClick={handleExportToGoogle}
              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
              title="Exportar a Google Calendar"
            >
              <img src="/logos/google.svg" alt="Google" className="w-3 h-3" />
            </button>
            <button
              onClick={handleExportToApple}
              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
              title="Exportar a Apple Calendar"
            >
              <img src="/logos/apple.svg" alt="Apple" className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Mini menú */}
        <div className="flex space-x-1 bg-gray-50 p-1 rounded">
          <span className="text-sm bg-gray-900 text-white px-3 py-1 rounded">Resumen</span>
          <span className="text-sm text-gray-500 px-3 py-1 rounded hover:bg-white">Detalles</span>
          <span className="text-sm text-gray-500 px-3 py-1 rounded hover:bg-white">Asistir</span>
        </div>

        {/* Información completa */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">👥 Ponentes:</p>
            {session.speakers.map((speaker, idx) => (
              <p key={idx} className="text-sm text-gray-600 ml-4">• {speaker.name}</p>
            ))}
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

          <div className="border-t border-gray-200 pt-3 space-y-2">
            <p className="text-sm text-gray-700">📍 <strong>Sala:</strong> {session.room}</p>
            <p className="text-sm text-gray-700">🔘 <strong>Estado:</strong> {session.status}</p>
            {session.notes && (
              <div>
                <p className="text-sm font-semibold text-gray-700">📝 Notas:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{session.notes}</p>
              </div>
            )}
            <p className="text-xs text-gray-500 italic mt-3 border-t border-gray-100 pt-2">
              💡 Doble-click para editar esta sesión
            </p>
          </div>
        </div>
      </div>
    )
  );

  return (
    <>
      {isCompact ? <CompactCard /> : <NormalCard />}
      <Overlay />
    </>
  );
};

export default SessionCard;