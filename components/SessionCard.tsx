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

  // Línea de color personalizable o por defecto basada en track
  const getBorderColor = () => {
    if (session.borderColor) {
      return session.borderColor;
    }
    // Colores por defecto basados en track
    const trackColors: Record<string, string> = {
      'legal-ia': '#8B5CF6',     // Púrpura
      'tecnologia': '#3B82F6',   // Azul
      'etica': '#10B981',        // Verde
      'practica': '#F59E0B',     // Naranja
      'futuro': '#EF4444',       // Rojo
    };
    return trackColors[session.trackId] || '#6B7280'; // Gris por defecto
  };

  const handleExportToGoogle = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportToGoogleCalendar(session);
  };

  const handleExportToApple = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportSelectedSessions([session], `${session.title.replace(/\s+/g, '-').toLowerCase()}.ics`);
  };

  const tooltipText = `${session.title}\nPonentes: ${session.speakers.map(s => s.name).join(', ')}\nTrack: ${track.name}\nSala: ${session.room}\nEstado: ${session.status}${session.zoomLink ? '\nZoom disponible' : ''}${session.notes ? `\nNotas: ${session.notes}` : ''}\n\nClick para editar`;

  if (isCompact) {
    return (
      <div
        draggable
        onDragStart={(e) => {
          onDragStart(e, session);
          e.currentTarget.style.opacity = '0.5';
          e.currentTarget.style.transform = 'rotate(3deg) scale(0.95)';
        }}
        onDragEnd={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
        }}
        onClick={() => onDoubleClick(session)}
        className={`p-1.5 rounded-lg flex flex-col cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out relative group min-h-12 hover:scale-102 hover:shadow-lg`}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(156, 163, 175, 0.3)',
          borderLeft: `4px solid ${getBorderColor()}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
        title={tooltipText}
      >
        <h4 className="font-medium text-xs leading-tight text-gray-900 dark:text-white truncate" style={{fontSize: '10px'}}>{session.title}</h4>
        <p className="text-xs text-gray-400 dark:text-gray-400 leading-tight truncate" style={{fontSize: '9px'}}>
          {session.speakers.map(s => s.name).join(', ')}
        </p>
        
        {session.hasConflict && (
          <div className="absolute top-1 right-1 text-red-500" title="Conflicto de ponentes detectado!">
            <AlertTriangleIcon className="h-3 w-3" />
          </div>
        )}

      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        onDragStart(e, session);
        e.currentTarget.style.opacity = '0.5';
        e.currentTarget.style.transform = 'rotate(2deg) scale(0.95)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
      }}
      onClick={() => onDoubleClick(session)}
      className={`h-full p-2 rounded-lg flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out relative group hover:scale-102 hover:shadow-xl`}
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(156, 163, 175, 0.4)',
        borderLeft: `4px solid ${getBorderColor()}`,
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
      }}
      title={tooltipText}
    >
      <div>
        <h3 className="font-medium text-sm leading-tight text-gray-900 dark:text-white" style={{fontSize: '11px'}}>{session.title}</h3>
        <p className="text-xs mt-1 text-gray-400 dark:text-gray-400 leading-tight" style={{fontSize: '10px'}}>
          {session.speakers.map(s => s.name).join(', ')}
        </p>
      </div>

      {session.hasConflict && (
        <div className="absolute top-2 right-2 text-red-500" title="Conflicto de ponentes detectado!">
          <AlertTriangleIcon className="h-4 w-4" />
        </div>
      )}

    </div>
  );
};

export default SessionCard;