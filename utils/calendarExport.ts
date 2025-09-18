import type { Schedule, Session } from '../types';

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
export const generateICS = (schedule: Schedule, eventName: string = 'Cumbre de IA Legal'): string => {
  const allSessions: Session[] = [];
  
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
    if (session.status !== 'Cancelada') {
      const startTime = formatDateForICS(session.day, session.time);
      const endTime = addOneHour(session.day, session.time);
      const speakers = session.speakers.map(s => s.name).join(', ');
      
      icsContent += '\r\n' + [
        'BEGIN:VEVENT',
        `UID:${session.id}@cumbre-ia-legal.com`,
        `DTSTART;TZID=America/Mexico_City:${startTime}`,
        `DTEND;TZID=America/Mexico_City:${endTime}`,
        `SUMMARY:${session.title}`,
        `DESCRIPTION:Ponentes: ${speakers}\\nSala: ${session.room}`,
        `LOCATION:${session.room}`,
        `STATUS:CONFIRMED`,
        `CATEGORIES:${session.trackId}`,
        'END:VEVENT'
      ].join('\r\n');
    }
  });

  icsContent += '\r\nEND:VCALENDAR';
  return icsContent;
};

// Generate Google Calendar URL
export const generateGoogleCalendarURL = (session: Session): string => {
  const startDate = formatDateForICS(session.day, session.time);
  const endDate = addOneHour(session.day, session.time);
  const speakers = session.speakers.map(s => s.name).join(', ');
  
  const googleURL = new URL('https://calendar.google.com/calendar/render');
  googleURL.searchParams.set('action', 'TEMPLATE');
  googleURL.searchParams.set('text', session.title);
  googleURL.searchParams.set('dates', `${startDate}/${endDate}`);
  googleURL.searchParams.set('details', `Ponentes: ${speakers}\nSala: ${session.room}`);
  googleURL.searchParams.set('location', session.room);
  googleURL.searchParams.set('ctz', 'America/Mexico_City');
  
  return googleURL.toString();
};

// Download ICS file
export const downloadICSFile = (schedule: Schedule, filename: string = 'cumbre-ia-legal.ics'): void => {
  const icsContent = generateICS(schedule);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Export individual session to Google Calendar
export const exportToGoogleCalendar = (session: Session, speakers: any[]) => {
  const speakerNames = speakers.map(s => s.name).join(', ');
  const startDate = formatDateForICS(session.day, session.time);
  const endDate = addOneHour(session.day, session.time);
  
  const googleURL = new URL('https://calendar.google.com/calendar/render');
  googleURL.searchParams.set('action', 'TEMPLATE');
  googleURL.searchParams.set('text', session.title);
  googleURL.searchParams.set('dates', `${startDate}/${endDate}`);
  googleURL.searchParams.set('details', `Ponentes: ${speakerNames}\nSala: ${session.room}`);
  googleURL.searchParams.set('location', session.room);
  googleURL.searchParams.set('ctz', 'America/Mexico_City');
  
  return googleURL.toString();
};

// Export all confirmed sessions to Apple Calendar
export const exportToAppleCalendar = (schedule: Schedule): void => {
  downloadICSFile(schedule, 'cumbre-ia-legal-completa.ics');
};

// Export selected sessions
export const exportSelectedSessions = (sessions: Session[], filename: string = 'sesiones-seleccionadas.ics'): void => {
  const tempSchedule: Schedule = {};
  
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
