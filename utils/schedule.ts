import type { Schedule, Session } from '../types';

export const encodeSchedule = (schedule: Schedule): string => {
  try {
    const jsonString = JSON.stringify(schedule);
    return btoa(jsonString);
  } catch (error) {
    console.error("Failed to encode schedule:", error);
    return '';
  }
};

export const decodeSchedule = (encodedString: string): Schedule | null => {
  try {
    const jsonString = atob(encodedString);
    return JSON.parse(jsonString) as Schedule;
  } catch (error) {
    console.error("Failed to decode schedule:", error);
    return null;
  }
};

export const checkForConflicts = (schedule: Schedule): Schedule => {
  try {
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    const allSessions: Session[] = [];
    
    // Safely collect all sessions
    for (const day in newSchedule) {
      for (const time in newSchedule[day]) {
        const sessionsArray = newSchedule[day][time];
        if (Array.isArray(sessionsArray)) {
          allSessions.push(...sessionsArray);
        }
      }
    }

    // Reset all conflicts first
    allSessions.forEach(session => {
      if (session && typeof session === 'object') {
        session.hasConflict = false;
      }
    });

    // Check for conflicts
    for (let i = 0; i < allSessions.length; i++) {
      for (let j = i + 1; j < allSessions.length; j++) {
        const sessionA = allSessions[i];
        const sessionB = allSessions[j];

        if (sessionA && sessionB && 
            sessionA.day === sessionB.day && 
            sessionA.time === sessionB.time &&
            sessionA.speakers && sessionB.speakers) {
          
          const sharedSpeakers = sessionA.speakers.some(speakerA =>
            sessionB.speakers.some(speakerB => speakerA && speakerB && speakerA.id === speakerB.id)
          );

          if (sharedSpeakers) {
            sessionA.hasConflict = true;
            sessionB.hasConflict = true;
          }
        }
      }
    }
    
    return newSchedule;
  } catch (error) {
    console.error("Error in checkForConflicts:", error);
    return schedule; // Return original schedule if there's an error
  }
};