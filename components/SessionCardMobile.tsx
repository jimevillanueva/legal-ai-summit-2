import React, { useState, useEffect } from 'react';
import type { Sesion } from '../types/Sesion';
import { speaker_SesionService } from '../services/Speaker_SesionService';
import { event_SpeakerService } from '../services/Event_speakersService';
import { Event_Speaker } from '../types/Event_Speaker';
// Importa iconos si los usas, por ejemplo:
// import { UsersIcon, VideoCameraIcon } from '@heroicons/react/24/solid'; 

interface SessionCardMobileProps {
  session: Sesion;
  onDoubleClick: (session: Sesion) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, session: Sesion) => void;
  canViewDetails?: boolean;
}

const SessionCardMobile: React.FC<SessionCardMobileProps> = ({
  session,
  onDoubleClick,
  onDragStart,
  canViewDetails,
}) => {
  const [speakers, setSpeakers] = useState<Event_Speaker[]>([]);

  useEffect(() => {
    const fetchSpeakers = async () => {
      // ... (Lógica de carga de speakers omitida por brevedad, se mantiene igual)
      try {
        const speakerSessiones = await speaker_SesionService.getAllSpeaker_SesionsBySesionId(session.id);
        
        if (speakerSessiones.length === 0) {
          setSpeakers([]);
          return;
        }

        const allSpeakers = await event_SpeakerService.getAllEvent_Speakers(); // Asumo que existe un getAll
        
        const fetchedSpeakers = speakerSessiones
            .map(ss => allSpeakers.find(s => s.id === ss.speaker_id))
            .filter((speaker): speaker is Event_Speaker => speaker !== undefined);

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

  // Función para truncar texto si es muy largo
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const tooltipText = canViewDetails 
    ? `${session.title}\nPonentes: ${speakers.length}\nDía: ${session.day} - Hora: ${session.time}\nClick para ver/editar detalles`
    : `${session.title}\n\nInicia sesión para ver más detalles`;

  return (
    <div
      draggable
      onDragStart={(e) => {
        onDragStart(e, session);
        e.currentTarget.style.opacity = '0.5';
        e.currentTarget.style.transform = 'rotate(2deg) scale(0.95)';
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
      }}
      onClick={() => onDoubleClick(session)}
      // CLASES TAILWIND MODIFICADAS:
      className="p-1 rounded cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out relative group hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(156, 163, 175, 0.4)',
        borderLeft: `4px solid ${getBorderColor()}`, // Borde más grueso para destacar el color
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)', // Sombra ligeramente ajustada
        minHeight: '2rem', // Mínima altura (32px) para mejor toque
        minWidth: 'unset', // Dejamos que el grid controle el ancho
        aspectRatio: '1.4 / 1', // Menos cuadrado que 1.3, para aprovechar el ancho (1.4 de ancho por 1 de alto)
      }}
      title={tooltipText}
    >
      {/* Layout de CONTENIDO - p-1 para padding interno */}
      <div className="flex flex-col justify-between h-full space-y-0.5">
        
        {/* Título: Aumentamos el tamaño y eliminamos 'truncate' si la tarjeta es más alta */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-xs leading-tight text-gray-900 dark:text-white overflow-hidden" 
              style={{maxHeight: '2.4em'}}> 
            {/* max-height para permitir 2-3 líneas de texto */}
            {session.title} 
          </h4>
        </div>
        
        {/* Info compacta (Ponentes/Zoom) - Abajo a la derecha */}
        <div className="flex justify-end items-center gap-1 mt-auto">
          {/* Cantidad de speakers - TAMAÑO AJUSTADO Y MÁS VISIBLE */}
          {canViewDetails && speakers.length > 0 && (
            <>
              {speakers.length > 1 && (
                <span className="inline-flex items-center px-0.5 sm:px-1 py-0.5 rounded text-[7px] sm:text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                  <i className="fa-solid fa-users fa-lg mr-1" style={{color: '#12609b'}}></i>
                  {truncateText(speakers.map(s => s.name).join(', '), 12)}
                </span>
              )}
              
              {speakers.length === 1 && (
                <span className="inline-flex items-center px-0.5 sm:px-1 py-0.5 rounded text-[7px] sm:text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                  <i className="fa-solid fa-user fa-lg mr-1" style={{color: '#12609b'}}></i>
                  {truncateText(speakers.map(s => s.name).join(', '), 12)}
                </span>
              )}
            </>
          )}
          
          {/* Indicador de Enlace/Zoom */}
          {session.link && (
            <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z" fill="white"/>
            <path d="M8.26667 10C7.56711 10 7 10.6396 7 11.4286V18.3571C7 20.369 8.44612 22 10.23 22L17.7333 21.9286C18.4329 21.9286 19 21.289 19 20.5V13.5C19 11.4881 17.2839 10 15.5 10L8.26667 10Z" fill="#4087FC"/>
            <path d="M20.7122 12.7276C20.2596 13.1752 20 13.8211 20 14.5V17.3993C20 18.0782 20.2596 18.7242 20.7122 19.1717L23.5288 21.6525C24.1019 22.2191 25 21.7601 25 20.9005V11.1352C25 10.2755 24.1019 9.81654 23.5288 10.3832L20.7122 12.7276Z" fill="#4087FC"/>
          </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionCardMobile;