import React from 'react';
import type { Sesion } from '../types/Sesion';
import { AlertTriangleIcon } from './icons';
import { exportToGoogleCalendar, exportSelectedSessions } from '../utils/calendarExport';
import { Event_Speaker } from '../types/Event_Speaker';
import { useEffect } from 'react';

interface SessionCardProps {
  session: Sesion;
  speakers: Event_Speaker[];
  onDoubleClick: (session: Sesion) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, session: Sesion) => void;
  isCompact?: boolean;
  canViewDetails?: boolean;
}
const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  speakers, 
  onDoubleClick, 
  onDragStart, 
  isCompact, 
  canViewDetails 
}) => {
  
  // Log para debug
  useEffect(() => {
    console.log("SessionCard recibió:", {
      id: session.id,
      title: session.title,
      day: session.day,
      time: session.time,
      speakersCount: speakers.length
    });
  }, [session, speakers]);

  const getBorderColor = () => {
    return session.color || '#6B7280';
  };

  /* const handleExportToGoogle = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportToGoogleCalendar(session, speakers);
  };

  const handleExportToApple = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportSelectedSessions([{...session, speakers}], `${session.title.replace(/\s+/g, '-').toLowerCase()}.ics`);
  }; */

  // Función para truncar texto si es muy largo
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Función para mostrar información adicional
  const getSessionInfo = () => {
    const info = [];
    if (session.link) info.push('🔗 Zoom disponible');
    if (session.description) info.push('📝 Tiene notas');
    if (speakers.length > 0) info.push(`👥 ${speakers.length} ponente${speakers.length > 1 ? 's' : ''}`);
    return info.join(' • ');
  };

  const tooltipText = canViewDetails 
    ? `${session.title}\n` +
      `Ponentes: ${speakers.length > 0 ? speakers.map(s => s.name).join(', ') : 'Sin ponentes'}\n` +
      `Día: ${session.day} - Hora: ${session.time}\n` +
      `${session.link ? 'Zoom: Disponible\n' : ''}` +
      `${session.description ? `Notas: ${session.description}\n` : ''}` +
      `\nClick para ver/editar detalles`
    : `${session.title}\n\nInicia sesión para ver más detalles`;
  // Remover la función getSession que agregaste
  // async function getSession() {
  //   console.log(session +"HOLA----------");
  // }
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
        className="p-1.5 rounded-lg flex flex-col cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out relative group min-h-12 hover:scale-102 hover:shadow-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(156, 163, 175, 0.3)',
          borderLeft: `4px solid ${getBorderColor()}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
        title={tooltipText}
      >
        <h4 className="font-medium text-xs leading-tight text-gray-900 dark:text-white truncate" style={{fontSize: '10px'}}>
          {truncateText(session.title, 30)}
        </h4>
        
        {canViewDetails ? (
          <>
            {speakers.length > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-400 leading-tight truncate" style={{fontSize: '9px'}}>
                {truncateText(speakers.map(s => s.name).join(', '), 25)}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              {session.link && <span className="text-green-500" title="Tiene enlace de Zoom">🔗</span>}
              {session.description && <span className="text-blue-500" title="Tiene notas">📝</span>}
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-500 leading-tight truncate italic" style={{fontSize: '9px'}}>
            Inicia sesión para ver detalles
          </p>
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
      className="h-full p-2 rounded-lg flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out relative group hover:scale-102 hover:shadow-xl"
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
        <h3 className="font-medium text-sm leading-tight text-gray-900 dark:text-white" style={{fontSize: '11px'}}>
          {truncateText(session.title, 40)}
        </h3>
        
        {canViewDetails ? (
          <>
            {speakers.length > 0 && (
              <p className="text-xs mt-1 text-gray-400 dark:text-gray-400 leading-tight" style={{fontSize: '10px'}}>
                {truncateText(speakers.map(s => s.name).join(', '), 35)}
              </p>
            )}
            
            {/* Información adicional en versión expandida */}
            <div className="mt-2 flex flex-wrap gap-1">
              {session.link && (
                <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  🔗 Zoom
                </span>
              )}
              {session.description && (
                <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  📝 Notas
                </span>
              )}
              {speakers.length > 0 && (
                <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                  👥 {speakers.length}
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="text-xs mt-1 text-gray-500 dark:text-gray-500 leading-tight italic" style={{fontSize: '10px'}}>
            Inicia sesión para ver detalles
          </p>
        )}
      </div>

      {/* Información de hora/día en la esquina (opcional) */}
      <div className="absolute top-1 right-1 text-xs text-gray-400 opacity-60" style={{fontSize: '8px'}}>
        {session.time}
      </div>
    </div>
  );
};

export default SessionCard;