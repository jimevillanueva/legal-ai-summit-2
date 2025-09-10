import type { Track, Speaker, Schedule, Session } from './types';
import { SessionStatus } from './types';

export const DAYS = [
  '2025-09-29', // Lunes
  '2025-09-30', // Martes
  '2025-10-01', // Miércoles
  '2025-10-02', // Jueves
  '2025-10-03', // Viernes
];

export const TIMES = Array.from({ length: 13 }, (_, i) => `${8 + i}:00`); // 8:00 a 20:00 (Horario CDMX)

export const getDefaultTracks = (): Track[] => [
  { id: 'legal-ia', name: 'IA Legal', color: 'bg-blue-200 dark:bg-blue-800', textColor: 'text-blue-800 dark:text-blue-100' },
  { id: 'tecnologia', name: 'Tecnología', color: 'bg-blue-300 dark:bg-blue-700', textColor: 'text-blue-800 dark:text-blue-100' },
  { id: 'etica', name: 'Ética y Regulación', color: 'bg-blue-400 dark:bg-blue-600', textColor: 'text-blue-800 dark:text-blue-100' },
  { id: 'practica', name: 'Aplicaciones Prácticas', color: 'bg-blue-500 dark:bg-blue-500', textColor: 'text-white dark:text-blue-100' },
  { id: 'futuro', name: 'Futuro Legal', color: 'bg-blue-600 dark:bg-blue-400', textColor: 'text-white dark:text-blue-100' },
];

export const TRACKS: Track[] = getDefaultTracks();

export const SPEAKERS: Speaker[] = [
  { id: '1', name: 'Dr. María González' },
  { id: '2', name: 'Lic. Carlos Rodríguez' },
  { id: '3', name: 'Dra. Ana Martínez' },
  { id: '4', name: 'Mg. Luis Fernández' },
  { id: '5', name: 'Dr. Elena Jiménez' },
  { id: '6', name: 'Lic. Roberto Silva' },
];

const initialSessions: Session[] = [
    // Sesiones de 8:00 AM (nuevo horario CDMX)
    { id: 's10', title: 'Registro y Bienvenida', speakers: [SPEAKERS[0]], trackId: 'legal-ia', room: 'Sala Principal', day: DAYS[0], time: '8:00', status: SessionStatus.CONFIRMED, zoomLink: 'https://zoom.us/j/123456789' },
    { id: 's11', title: 'Desayuno de Networking', speakers: [SPEAKERS[1]], trackId: 'practica', room: 'Sala Networking', day: DAYS[1], time: '8:00', status: SessionStatus.CONFIRMED },
    
    // Sesiones existentes
    { id: 's1', title: 'IA en la Práctica Jurídica', speakers: [SPEAKERS[0]], trackId: 'legal-ia', room: 'Sala Conferencias 1', day: DAYS[0], time: '9:00', status: SessionStatus.CONFIRMED, zoomLink: 'https://zoom.us/j/111222333' },
    { id: 's2', title: 'Automatización de Contratos', speakers: [SPEAKERS[1]], trackId: 'tecnologia', room: 'Sala Conferencias 2', day: DAYS[0], time: '10:00', status: SessionStatus.CONFIRMED, zoomLink: 'https://zoom.us/j/444555666' },
    { id: 's3', title: 'Regulación de IA en el Derecho', speakers: [SPEAKERS[2]], trackId: 'etica', room: 'Sala Conferencias 3', day: DAYS[0], time: '11:00', status: SessionStatus.CONFIRMED },
    { id: 's4', title: 'Casos de Uso de IA Legal', speakers: [SPEAKERS[3]], trackId: 'practica', room: 'Sala Conferencias 1', day: DAYS[1], time: '9:00', status: SessionStatus.CONFIRMED, zoomLink: 'https://zoom.us/j/777888999' },
    { id: 's5', title: 'El Futuro del Derecho Digital', speakers: [SPEAKERS[1], SPEAKERS[4]], trackId: 'futuro', room: 'Sala Conferencias 2', day: DAYS[1], time: '14:00', status: SessionStatus.CONFIRMED },
    { id: 's6', title: 'Machine Learning para Abogados', speakers: [SPEAKERS[0]], trackId: 'tecnologia', room: 'Sala Conferencias 3', day: DAYS[2], time: '10:00', status: SessionStatus.CONFIRMED, zoomLink: 'https://zoom.us/j/101112131' },
    { id: 's7', title: 'Blockchain en el Sistema Legal', speakers: [SPEAKERS[5]], trackId: 'futuro', room: 'Sala Conferencias 3', day: DAYS[0], time: '14:00', status: SessionStatus.CONFIRMED },
    // Sesiones adicionales para probar múltiples sesiones por horario
    { id: 's8', title: 'Chatbots Legales Avanzados', speakers: [SPEAKERS[2]], trackId: 'tecnologia', room: 'Sala Conferencias 4', day: DAYS[0], time: '9:00', status: SessionStatus.CONFIRMED },
    { id: 's9', title: 'Análisis Predictivo en Litigios', speakers: [SPEAKERS[4]], trackId: 'legal-ia', room: 'Sala Conferencias 5', day: DAYS[0], time: '10:00', status: SessionStatus.CONFIRMED, zoomLink: 'https://zoom.us/j/151617181' },
    
    // Sesiones vespertinas (horario extendido CDMX)
    { id: 's12', title: 'Panel: Ética en IA Legal', speakers: [SPEAKERS[0], SPEAKERS[3]], trackId: 'etica', room: 'Sala Principal', day: DAYS[0], time: '18:00', status: SessionStatus.CONFIRMED, zoomLink: 'https://zoom.us/j/192021222' },
    { id: 's13', title: 'Networking y Cocktail', speakers: [SPEAKERS[5]], trackId: 'practica', room: 'Sala Networking', day: DAYS[0], time: '19:00', status: SessionStatus.CONFIRMED },
    { id: 's14', title: 'Cierre y Reflexiones', speakers: [SPEAKERS[1], SPEAKERS[2]], trackId: 'futuro', room: 'Sala Principal', day: DAYS[4], time: '20:00', status: SessionStatus.CONFIRMED, zoomLink: 'https://zoom.us/j/232425262' },
];

export const getInitialSchedule = (): Schedule => {
    console.log('getInitialSchedule called');
    const schedule: Schedule = {};
    
    // Initialize with empty arrays instead of null
    DAYS.forEach(day => {
        schedule[day] = {};
        TIMES.forEach(time => {
            schedule[day][time] = [];
        });
    });

    // Add initial sessions to their respective arrays
    initialSessions.forEach(session => {
        if (schedule[session.day] && schedule[session.day][session.time] !== undefined) {
            schedule[session.day][session.time].push(session);
        }
    });

    console.log('Initial schedule created:', schedule);
    return schedule;
};
