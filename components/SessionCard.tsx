import React, { useState } from 'react';
import type { Sesion } from '../types/Sesion';
import { AlertTriangleIcon } from './icons';
import { exportToGoogleCalendar, exportSelectedSessions } from '../utils/calendarExport';
import { Event_Speaker } from '../types/Event_Speaker';
import { useEffect } from 'react';
import { speaker_SesionService } from '../services/Speaker_SesionService';
import { event_SpeakerService } from '../services/Event_speakersService';

interface SessionCardProps {
  session: Sesion;
  onDoubleClick: (session: Sesion) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, session: Sesion) => void;
  isCompact?: boolean;
  canViewDetails?: boolean;
}
const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onDoubleClick,
  onDragStart,
  isCompact,
  canViewDetails,
}) => {
  const [speakers, setSpeakers] = useState<Event_Speaker[]>([]);
  // Log para debug
  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const speakerSessiones =
          await speaker_SesionService.getAllSpeaker_SesionsBySesionId(session.id);

        if (speakerSessiones.length === 0) {
          setSpeakers([]);
          return;
        }

        const speakerPromises = speakerSessiones.map(async (sesionRel) => {
          try {
            return await event_SpeakerService.getEvent_SpeakersById(sesionRel.speaker_id);
          } catch (error) {
            return null;
          }
        });

        const results = await Promise.allSettled(speakerPromises);
        
        const fetchedSpeakers = results
          .filter((result): result is PromiseFulfilledResult<Event_Speaker> => 
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value);

        setSpeakers(fetchedSpeakers);
      } catch (error) {
        console.error("Error cargando speakers:", error);
        setSpeakers([]);
      }
    };

    fetchSpeakers();
  }, [session.id]);

  const getBorderColor = () => {
    return session.color || "#6B7280";
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
        className="p-1 sm:p-1.5 rounded-lg flex flex-col cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out relative group min-h-10 sm:min-h-12 hover:scale-102 hover:shadow-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(156, 163, 175, 0.3)',
          borderLeft: `4px solid ${getBorderColor()}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
        title={tooltipText}
      >
        <h4 className="font-medium text-[8px] sm:text-[10px] leading-tight text-gray-900 dark:text-white truncate">
          {truncateText(session.title, 25)}
        </h4>
        
        {canViewDetails ? (
          <>
            {speakers.length > 0 && (
              <p className="text-[7px] sm:text-[9px] text-gray-400 dark:text-gray-400 leading-tight truncate">
                {truncateText(speakers.map(s => s.name).join(', '), 20)}
              </p>
            )}
            <div className="flex items-center gap-0.5 sm:gap-1 mt-1">
              {session.link && <span className="text-green-500 text-[8px] sm:text-[10px]" title="Tiene enlace de Zoom">🔗</span>}
              {session.description && <span className="text-blue-500 text-[8px] sm:text-[10px]" title="Tiene notas">📝</span>}
              {speakers.length > 0 && (
                <span className="inline-flex items-center px-0.5 sm:px-1 py-0.5 rounded text-[6px] sm:text-[8px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  👥 {speakers.length}
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="text-[7px] sm:text-[9px] text-gray-500 dark:text-gray-500 leading-tight truncate italic">
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
      className="h-full p-1.5 sm:p-2 rounded-lg flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out relative group hover:scale-102 hover:shadow-xl"
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
        <h3 className="font-medium text-[9px] sm:text-[11px] leading-tight text-gray-900 dark:text-white">
          {truncateText(session.title, 35)}
        </h3>
        
        {canViewDetails ? (
          <>
            {speakers.length > 0 && (
              <p className="text-[8px] sm:text-[10px] mt-1 text-gray-400 dark:text-gray-400 leading-tight">
                {truncateText(speakers.map(s => s.name).join(', '), 30)}
              </p>
            )}
            
            {/* Información adicional en versión expandida */}
            <div className="mt-1 sm:mt-2 flex flex-wrap gap-0.5 sm:gap-1">
              {session.link && (
                <span className="inline-flex items-center px-0.5 sm:px-1 py-0.5 rounded text-[7px] sm:text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  🔗 Zoom
                </span>
              )}
              
              <span className="inline-flex items-center px-0.5 sm:px-1 py-0.5 rounded text-[7px] sm:text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                👥 {speakers.length} - {truncateText(speakers.map(s => s.name).join(', '), 12)}
              </span>
            </div>
          </>
        ) : (
          <p className="text-[8px] sm:text-[10px] mt-1 text-gray-500 dark:text-gray-500 leading-tight italic">
            Inicia sesión para ver detalles
          </p>
        )}
      </div>

      {/* Información de hora/día en la esquina (opcional) */}
      <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 text-[6px] sm:text-[8px] text-gray-400 opacity-60">
        {session.time}
      </div>
    </div>
  );
};

export default SessionCard;