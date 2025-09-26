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
            <div className="flex items-center gap-0.5 bg-black/30 dark:bg-white/10 px-1 rounded-full">
              {/* Usamos un ícono real si está disponible, si no, mantenemos el emoji pero más grande */}
              <span className="text-sm" title="Ponentes">👥</span> 
              <span className="text-xs text-white/90 dark:text-gray-200 font-semibold">
                {speakers.length}
              </span>
            </div>
          )}
          
          {/* Indicador de Enlace/Zoom */}
          {session.link && (
            <span className="text-sm" title="Tiene Enlace">🔗</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionCardMobile;