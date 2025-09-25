import React, { useState, useEffect } from 'react';
import { Sesion } from '../types/Sesion';
import { sesionService } from '../services/sesionService';
import { DAYS, TIMES } from '../constants';
import SessionCard from './SessionCard';
import { PlusIcon } from './icons';
import { speaker_SesionService } from '../services/Speaker_SesionService';
import { event_SpeakerService } from '../services/Event_speakersService';
import { Event_Speaker } from '../types/Event_Speaker';

interface ScheduleGridProps {
  sesiones: Sesion[]; // Agregar esta prop
  onSessionDrop: (sessionId: string, newDay: string, newTime: string) => void;
  onEditSession: (session: Sesion) => void;
  onAddSession: (day: string, time: string) => void;
  canEdit: boolean;
  canViewDetails: boolean;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  sesiones: sesionesProp, // Recibir como prop
  onSessionDrop, 
  onEditSession, 
  onAddSession, 
  canEdit, 
  canViewDetails 
}) => {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [sessionSpeakers, setSessionSpeakers] = useState<Record<string, Event_Speaker[]>>({});
  const [loading, setLoading] = useState(true);

  const normalizarSesion = (s: any) => {
    const dayNormalizado = new Date(s.day).toISOString().split("T")[0];
    const timeNormalizado = s.time; // Ya viene en formato correcto "8:00"   
    return {
      ...s,
      day: dayNormalizado,
      time: timeNormalizado
    };
  };

  // Función para cargar speakers de todas las sesiones
  const cargarSpeakersParaSesiones = async (sesiones: Sesion[]) => {
    //console.log('Cargando speakers en ScheduleGrid');
    //const inicio = performance.now();
  
    try {
      const allSpeakers = await event_SpeakerService.getAllEvent_Speakers();
  
      // Disparar todas las llamadas en paralelo
      const results = await Promise.all(
        sesiones.map(sesion => speaker_SesionService.getAllSpeaker_SesionsBySesionId(sesion.id))
      );
  
      // Armar el map
      const speakersMap: Record<string, Event_Speaker[]> = {};
      sesiones.forEach((sesion, index) => {
        const speakerSesions = results[index];
        const speakerIds = speakerSesions.map(ss => ss.speaker_id);
        speakersMap[sesion.id] = allSpeakers.filter(speaker => speakerIds.includes(speaker.id));
      });
  
      setSessionSpeakers(speakersMap);
  
      //const fin = performance.now();
      //console.log(`⏱ Tiempo de ejecución: ${(fin - inicio).toFixed(2)} ms`);
  
    } catch (error) {
      console.error('Error al cargar speakers:', error);
    }
  };

  // Organizar sesiones por día y hora para el grid
  const organizarSesionesPorDiaYHora = () => {
    //console.log('Organizando sesiones en ScheduleGrid');
    //const inicio = performance.now();
    const schedule: Record<string, Record<string, Sesion[]>> = {};
    
    // Inicializar estructura vacía
    DAYS.forEach(day => {
      schedule[day] = {};
      TIMES.forEach(time => {
        schedule[day][time] = [];
      });
    });
    // Llenar con las sesiones
    sesiones.forEach(sesion => {  
      if (schedule[sesion.day] && schedule[sesion.day][sesion.time]) {
        schedule[sesion.day][sesion.time].push(sesion);
      }
    });
    //
    // const fin = performance.now();
    //console.log(`⏱ Tiempo de ejecución: ${(fin - inicio).toFixed(2)} ms`);
    return schedule;
  };

  // Usar useEffect para actualizar cuando cambien las sesiones de la prop
  useEffect(() => {
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

 /*  useEffect(() => {
    cargarTodasLasSesiones();

  }, []); */

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
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', month: 'short', day: 'numeric' }).format(date);
  };

  if (loading) {
    return (
      <div className="flex-grow p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sesiones...</p>
        </div>
      </div>
    );
  }

  const schedule = organizarSesionesPorDiaYHora();

  return (
    <div className="flex-grow p-4 overflow-auto">
      <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1">
        <div className="sticky top-0 z-10"></div> {/* Corner */}
        {DAYS.map(day => (
          <div key={day} className="text-center font-semibold p-1 sticky top-0 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 z-10" style={{fontSize: '11px'}}>
            {formatDate(day)}
          </div>
        ))}

        {TIMES.map(time => (
          <React.Fragment key={time}>
            <div className="font-semibold sticky left-0 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center" style={{fontSize: '11px'}}>
              {time}
            </div>
            {DAYS.map(day => {
              const sessions = schedule[day]?.[time] ?? [];
              const maxSessionsPerSlot = 4;
              
              return (
                <div
                  key={`${day}-${time}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day, time)}
                  className="min-h-24 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 relative"
                >
                  {sessions.length > 0 ? (
                    <div className="h-full overflow-y-auto">
                      <div className="p-1 space-y-1">
                        {sessions.slice(0, maxSessionsPerSlot).map((session, index) => (
                          <div key={session.id} className="relative">
                            <SessionCard 
                              session={session}
                              onDoubleClick={onEditSession}
                              onDragStart={handleDragStart}
                              isCompact={sessions.length > 1}
                              canViewDetails={canViewDetails}
                            />
                          </div>
                        ))}
                        {sessions.length > maxSessionsPerSlot && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 p-1 text-center">
                            +{sessions.length - maxSessionsPerSlot} more
                          </div>
                        )}
                      </div>
                      {sessions.length < maxSessionsPerSlot && canEdit && (
                        <button 
                          onClick={() => onAddSession(day, time)} 
                          className="absolute bottom-1 right-1 w-6 h-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all opacity-60 hover:opacity-100"
                          aria-label={`Add another session on ${day} at ${time}`}
                        >
                          <PlusIcon className="h-3 w-3 transition-colors" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative">
                      {canEdit && (
                        <button 
                          onClick={() => onAddSession(day, time)} 
                          className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all opacity-40 hover:opacity-80"
                          aria-label={`Add session on ${day} at ${time}`}
                        >
                          <PlusIcon className="h-5 w-5 transition-colors" />
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