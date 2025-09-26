import React, { useState, useEffect } from 'react';
import { Sesion } from '../types/Sesion';
import { sesionService } from '../services/sesionService';
import { DAYS, TIMES } from '../constants';
import SessionCard from './SessionCard';
import SessionCardMobile from './SessionCardMobile';
import { PlusIcon } from './icons';
import { speaker_SesionService } from '../services/Speaker_SesionService';
import { event_SpeakerService } from '../services/Event_speakersService';
import { Event_Speaker } from '../types/Event_Speaker';

interface ScheduleGridProps {
  sesiones: Sesion[];
  onSessionDrop: (sessionId: string, newDay: string, newTime: string) => void;
  onEditSession: (session: Sesion) => void;
  onAddSession: (day: string, time: string) => void;
  canEdit: boolean;
  canViewDetails: boolean;
  speakers: Event_Speaker[];
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  sesiones: sesionesProp, 
  onSessionDrop, 
  onEditSession, 
  onAddSession, 
  canEdit, 
  canViewDetails,
  speakers
}) => {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [sessionSpeakers, setSessionSpeakers] = useState<Record<string, Event_Speaker[]>>({});
  const [loading, setLoading] = useState(true);
  const [allSpeakers, setAllSpeakers] = useState<Event_Speaker[]>([]);

  // ... (normalizarSesion, cargarSpeakersParaSesiones, organizarSesionesPorDiaYHora se mantienen igual)
  const normalizarSesion = (s: any) => {
    const dayNormalizado = new Date(s.day).toISOString().split("T")[0];
    const timeNormalizado = s.time;  
    return {
      ...s,
      day: dayNormalizado,
      time: timeNormalizado
    };
  };

  const cargarSpeakersParaSesiones = async (sesiones: Sesion[]) => {
    try {
      const results = await Promise.all(
        sesiones.map(sesion => speaker_SesionService.getAllSpeaker_SesionsBySesionId(sesion.id))
      );
      const speakersMap: Record<string, Event_Speaker[]> = {};
      sesiones.forEach((sesion, index) => {
        const speakerSesions = results[index];
        const speakerIds = speakerSesions.map(ss => ss.speaker_id);
        speakersMap[sesion.id] = allSpeakers.filter(speaker => speakerIds.includes(speaker.id));
      });
      setSessionSpeakers(speakersMap);
    } catch (error) {
      console.error('Error al cargar speakers:', error);
    }
  };

  const organizarSesionesPorDiaYHora = () => {
    const schedule: Record<string, Record<string, Sesion[]>> = {};
    
    DAYS.forEach(day => {
      schedule[day] = {};
      TIMES.forEach(time => {
        schedule[day][time] = [];
      });
    });

    sesiones.forEach(sesion => {  
      if (schedule[sesion.day] && schedule[sesion.day][sesion.time]) {
        schedule[sesion.day][sesion.time].push(sesion);
      }
    });
    
    return schedule;
  };

  useEffect(() => {
    setAllSpeakers(speakers);
    if (sesionesProp && sesionesProp.length > 0) {
      const data = sesionesProp.map(normalizarSesion);
      setSesiones(data);
      setLoading(false);
    } else {
      setSesiones([]);
      setSessionSpeakers({});
      setLoading(false);
    }
  }, [sesionesProp]);

  // ... (handleDragStart, handleDragOver, handleDragLeave, handleDrop se mantienen igual)
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, session: Sesion) => {
    e.dataTransfer.setData('sessionId', session.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    e.currentTarget.style.borderColor = '#3B82F6';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.borderColor = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: string, time: string) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.borderColor = '';
    const sessionId = e.dataTransfer.getData('sessionId');
    if (sessionId) {
      onSessionDrop(sessionId, day, time);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('es-ES', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  };

  const formatDateMobile = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric' }).format(date);
  };

  if (loading) {
    return (
      <div className="flex-grow p-1 sm:p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-4 h-4 sm:w-8 sm:h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2 sm:mb-4"></div>
          <p className="text-gray-600 text-xs sm:text-base">Cargando sesiones...</p>
        </div>
      </div>
    );
  }

  const schedule = organizarSesionesPorDiaYHora();
  // El número de días determina la configuración del grid.
  const numDays = DAYS.length; 

  return (
    <div className="flex-grow p-0 overflow-auto">
      
      {/* CLAVE: Usamos 'fr' para TODAS las columnas. 
        - La primera columna (tiempo) tiene un peso menor (ej: 0.5fr) para que sea estrecha.
        - Las 5 columnas de días tienen un peso de 1fr cada una.
        - Esto garantiza que la suma de todos los anchos sea el 100% del contenedor.
      */}
      <div className={`grid gap-0.5 sm:gap-1 
                      grid-cols-[0.5fr_repeat(${numDays},1fr)] 
                      lg:grid-cols-[0.8fr_repeat(${numDays},1fr)]`}>
        
        {/* Corner vacío */}
        <div className="sticky top-0 z-10"></div>
        
        {/* Headers de días */}
        {DAYS.map(day => (
          <div 
            key={day} 
            className="text-center font-semibold p-0.5 sm:p-1 sticky top-0 
                       bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 z-10 
                       text-[8px] sm:text-xs leading-none" 
          >
            {/* Solo el día del mes en móviles pequeños */}
            <div className="block sm:hidden">
              {formatDateMobile(day)}
            </div>
            {/* Día completo en pantallas más grandes */}
            <div className="hidden sm:block">
              {formatDate(day)}
            </div>
          </div>
        ))}

        {/* Filas de tiempo */}
        {TIMES.map(time => (
          <React.Fragment key={time}>
            {/* Header de tiempo - Ahora usa un padding ajustado y se vuelve más compacto por el 0.5fr */}
            <div className="font-semibold sticky left-0 
                            bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                            flex items-center justify-center 
                            text-[8px] sm:text-xs px-0.5" 
            >
              {time}
            </div>
            
            {/* Celdas de sesiones para cada día */}
            {DAYS.map(day => {
              const sessions = schedule[day]?.[time] ?? [];
              const maxSessionsPerSlot = 5; 
              
              return (
                <div
                  key={`${day}-${time}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day, time)}
                  className="min-h-12 sm:min-h-16 md:min-h-20 lg:min-h-24 
                             border border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-800 transition-all duration-200 relative"
                >
                  {sessions.length > 0 ? (
                    <div className="h-full overflow-y-auto">
                      <div className="p-0.5 space-y-0.5"> 
                        {sessions.slice(0, maxSessionsPerSlot).map((session, index) => (
                          <div key={session.id} className="relative">
                            {/* Uso condicional de SessionCardMobile */}
                            <div className="block lg:hidden">
                              <SessionCardMobile 
                                session={session}
                                onDoubleClick={onEditSession}
                                onDragStart={handleDragStart}
                                canViewDetails={canViewDetails}
                              />
                            </div>
                            <div className="hidden lg:block">
                              <SessionCard 
                                session={session}
                                onDoubleClick={onEditSession}
                                onDragStart={handleDragStart}
                                isCompact={sessions.length > 1}
                                canViewDetails={canViewDetails}
                              />
                            </div>
                          </div>
                        ))}
                        {sessions.length > maxSessionsPerSlot && (
                          <div className="text-[7px] sm:text-xs text-gray-500 dark:text-gray-400 p-0.5 text-center">
                            +{sessions.length - maxSessionsPerSlot} more
                          </div>
                        )}
                      </div>
                      {sessions.length < maxSessionsPerSlot && canEdit && (
                        <button 
                          onClick={() => onAddSession(day, time)} 
                          className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 
                                     w-3 h-3 sm:w-5 sm:h-5 lg:w-6 lg:h-6 
                                     bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 
                                     rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 
                                     transition-all opacity-60 hover:opacity-100"
                          aria-label={`Add another session on ${day} at ${time}`}
                        >
                          <PlusIcon className="h-2 w-2 sm:h-3 sm:w-3 transition-colors" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative">
                      {canEdit && (
                        <button 
                          onClick={() => onAddSession(day, time)} 
                          className="w-4 h-4 sm:w-8 sm:h-8 lg:w-10 lg:h-10 
                                     bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 
                                     rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 
                                     transition-all opacity-40 hover:opacity-80"
                          aria-label={`Add session on ${day} at ${time}`}
                        >
                          <PlusIcon className="h-2 w-2 sm:h-4 sm:w-4 lg:h-5 lg:w-5 transition-colors" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ScheduleGrid;