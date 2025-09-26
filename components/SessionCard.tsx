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
        className="p-1 sm:p-1.5 rounded-lg flex flex-col cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out relative group min-h-10 sm:min-h-12 hover:scale-102 hover:shadow-lg bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-200/60 dark:border-blue-700/40"
        style={{
          borderLeft: `4px solid ${getBorderColor()}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        title={tooltipText}
      >
        <div className="flex items-center justify-between gap-1">
          <h4 className="font-semibold text-xs sm:text-sm leading-tight text-gray-900 dark:text-gray-100 flex-1">
            {session.title}
          </h4>
          {session.link && canViewDetails && (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z" fill="white"/>
              <path d="M8.26667 10C7.56711 10 7 10.6396 7 11.4286V18.3571C7 20.369 8.44612 22 10.23 22L17.7333 21.9286C18.4329 21.9286 19 21.289 19 20.5V13.5C19 11.4881 17.2839 10 15.5 10L8.26667 10Z" fill="#4087FC"/>
              <path d="M20.7122 12.7276C20.2596 13.1752 20 13.8211 20 14.5V17.3993C20 18.0782 20.2596 18.7242 20.7122 19.1717L23.5288 21.6525C24.1019 22.2191 25 21.7601 25 20.9005V11.1352C25 10.2755 24.1019 9.81654 23.5288 10.3832L20.7122 12.7276Z" fill="#4087FC"/>
            </svg>
          )}
        </div>
        
        {canViewDetails ? (
          <>
            {speakers.length > 0 && (
              <div className="flex flex-wrap gap-0.5 mt-1">
                {speakers.slice(0, 2).map((speaker, index) => (
                  <span 
                    key={speaker.id} 
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs sm:text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 font-medium"
                  >
                    <i className="fa-solid fa-user mr-0.5 text-gray-600 dark:text-gray-300"></i>
                    {truncateText(speaker.name, 25)}
                  </span>
                ))}
                {speakers.length > 2 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs sm:text-sm bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 font-medium">
                    +{speakers.length - 2}
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 leading-tight truncate italic font-medium">
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
      className={`h-full w-full rounded-lg flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out relative group hover:scale-102 hover:shadow-xl bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-200/60 dark:border-blue-700/40 ${isCompact ? 'p-1.5 sm:p-2' : 'p-0'}`}
      style={{
        borderLeft: `4px solid ${getBorderColor()}`,
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
      }}
      title={tooltipText}
    >
      
      <div className={`flex flex-col justify-between h-full ${isCompact ? '' : 'p-1.5 sm:p-2'}`}>
        <div className="flex items-center justify-between gap-1">
          <h3 className="font-semibold text-xs sm:text-sm leading-tight text-gray-900 dark:text-gray-100 flex-1">
            {session.title}
          </h3>
          {session.link && canViewDetails && (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z" fill="white"/>
              <path d="M8.26667 10C7.56711 10 7 10.6396 7 11.4286V18.3571C7 20.369 8.44612 22 10.23 22L17.7333 21.9286C18.4329 21.9286 19 21.289 19 20.5V13.5C19 11.4881 17.2839 10 15.5 10L8.26667 10Z" fill="#4087FC"/>
              <path d="M20.7122 12.7276C20.2596 13.1752 20 13.8211 20 14.5V17.3993C20 18.0782 20.2596 18.7242 20.7122 19.1717L23.5288 21.6525C24.1019 22.2191 25 21.7601 25 20.9005V11.1352C25 10.2755 24.1019 9.81654 23.5288 10.3832L20.7122 12.7276Z" fill="#4087FC"/>
            </svg>
          )}
        </div>
        
        {canViewDetails ? (
          <>
            {speakers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {speakers.slice(0, 3).map((speaker, index) => (
                  <span 
                    key={speaker.id} 
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs sm:text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 font-medium"
                  >
                    <i className="fa-solid fa-user mr-1 text-gray-600 dark:text-gray-300"></i>
                    {truncateText(speaker.name, 30)}
                  </span>
                ))}
                {speakers.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs sm:text-sm bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 font-medium">
                    +{speakers.length - 3}
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-xs sm:text-sm mt-1 text-gray-500 dark:text-gray-300 leading-tight italic font-medium">
            Inicia sesión para ver detalles
          </p>
        )}
      </div>
    </div>
  );
};

export default SessionCard;