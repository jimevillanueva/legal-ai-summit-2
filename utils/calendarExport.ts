import type { Schedule } from '../types';
import { Sesion } from '../types/Sesion';
import { Event_Speaker } from '../types/Event_Speaker';

// Utility function to format date/time for ICS format
const formatDateForICS = (day: string, time: string): string => {
  const [year, month, date] = day.split('-');
  const [hour, minute] = time.split(':');
  return `${year}${month}${date}T${hour.padStart(2, '0')}${minute}00`;
};

// Utility function to add one hour to time
const addOneHour = (day: string, time: string): string => {
  const [year, month, date] = day.split('-');
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour);
  const endHour = hourNum + 1;
  return `${year}${month}${date}T${endHour.toString().padStart(2, '0')}${minute}00`;
};

// Generate ICS content for Apple Calendar, Outlook, etc.
export const generateICS = (schedule: Record<string, Record<string, Sesion[]>>, eventName: string = 'Cumbre de IA Legal'): string => {
  const allSessions: Sesion[] = [];
  
  // Collect all sessions
  Object.values(schedule).forEach(day => 
    Object.values(day).forEach(sessions => 
      sessions.forEach(session => allSessions.push(session))
    )
  );

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cumbre IA Legal//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${eventName}`,
    'X-WR-TIMEZONE:America/Mexico_City',
    'BEGIN:VTIMEZONE',
    'TZID:America/Mexico_City',
    'BEGIN:STANDARD',
    'DTSTART:20251103T020000',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0600',
    'TZNAME:CST',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:20250309T020000',
    'TZOFFSETFROM:-0600',
    'TZOFFSETTO:-0500',
    'TZNAME:CDT',
    'END:DAYLIGHT',
    'END:VTIMEZONE'
  ].join('\r\n');

  allSessions.forEach(session => {
    const startTime = formatDateForICS(session.day, session.time);
    const endTime = addOneHour(session.day, session.time);
    
    icsContent += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:${session.id}@cumbre-ia-legal.com`,
      `DTSTART;TZID=America/Mexico_City:${startTime}`,
      `DTEND;TZID=America/Mexico_City:${endTime}`,
      `SUMMARY:${session.title}`,
      `DESCRIPTION:${session.description || 'Sesión de la Cumbre de IA Legal'}`,
      `LOCATION:En línea`,
      `STATUS:CONFIRMED`,
      'END:VEVENT'
    ].join('\r\n');
  });

  icsContent += '\r\nEND:VCALENDAR';
  return icsContent;
};

// Generate Google Calendar URL
export const generateGoogleCalendarURL = (session: Sesion): string => {
  const startDate = formatDateForICS(session.day, session.time);
  const endDate = addOneHour(session.day, session.time);
  
  const googleURL = new URL('https://calendar.google.com/calendar/render');
  googleURL.searchParams.set('action', 'TEMPLATE');
  googleURL.searchParams.set('text', session.title);
  googleURL.searchParams.set('dates', `${startDate}/${endDate}`);
  googleURL.searchParams.set('details', session.description || 'Sesión de la Cumbre de IA Legal');
  googleURL.searchParams.set('location', 'En línea');
  googleURL.searchParams.set('ctz', 'America/Mexico_City');
  
  return googleURL.toString();
};

// Download ICS file
export const downloadICSFile = (schedule: Record<string, Record<string, Sesion[]>>, filename: string = 'cumbre-ia-legal.ics'): void => {
  const icsContent = generateICS(schedule);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Export individual session to Google Calendar
export const exportToGoogleCalendar = (session: Sesion, speakers: Event_Speaker[]): string => {
  const speakerNames = speakers.map(s => s.name).join(', ');
  const startDate = formatDateForICS(session.day, session.time);
  const endDate = addOneHour(session.day, session.time);
  
  const googleURL = new URL('https://calendar.google.com/calendar/render');
  googleURL.searchParams.set('action', 'TEMPLATE');
  googleURL.searchParams.set('text', session.title);
  googleURL.searchParams.set('dates', `${startDate}/${endDate}`);
  googleURL.searchParams.set('details', `Ponentes: ${speakerNames}\n${session.description || ''}`);
  googleURL.searchParams.set('location', 'En línea');
  googleURL.searchParams.set('ctz', 'America/Mexico_City');
  
  return googleURL.toString();
};

// Export single session to Apple Calendar
export const exportToAppleCalendar = (session: Sesion): void => {
  const tempSchedule = {
    [session.day]: {
      [session.time]: [session]
    }
  };
  downloadICSFile(tempSchedule, `${session.title.replace(/[^a-zA-Z0-9]/g, '-')}.ics`);
};

// Export selected sessions
export const exportSelectedSessions = (sessions: Sesion[], filename: string = 'sesiones-seleccionadas.ics'): void => {
  const tempSchedule: Record<string, Record<string, Sesion[]>> = {};
  
  sessions.forEach(session => {
    if (!tempSchedule[session.day]) {
      tempSchedule[session.day] = {};
    }
    if (!tempSchedule[session.day][session.time]) {
      tempSchedule[session.day][session.time] = [];
    }
    tempSchedule[session.day][session.time].push(session);
  });
  
  downloadICSFile(tempSchedule, filename);
};
