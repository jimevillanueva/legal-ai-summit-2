import React from 'react';
import type { Schedule, Session, Track } from '../types';
import { DAYS, TIMES } from '../constants';
import SessionCard from './SessionCard';
import { PlusIcon } from './icons';

interface ScheduleGridProps {
  schedule: Schedule;
  tracks: Track[];
  onSessionDrop: (sessionId: string, newDay: string, newTime: string) => void;
  onEditSession: (session: Session) => void;
  onAddSession: (day: string, time: string) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ schedule, tracks, onSessionDrop, onEditSession, onAddSession }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, session: Session) => {
    e.dataTransfer.setData('sessionId', session.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: string, time: string) => {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData('sessionId');
    if (sessionId) {
      onSessionDrop(sessionId, day, time);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div className="flex-grow p-4 overflow-auto">
      <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1">
        <div className="sticky top-0 z-10"></div> {/* Corner */}
        {DAYS.map(day => (
          <div key={day} className="text-center font-semibold text-sm p-1 sticky top-0 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 z-10">
            {formatDate(day)}
          </div>
        ))}

        {TIMES.map(time => (
          <React.Fragment key={time}>
            <div className="font-semibold text-sm sticky left-0 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center">
              {time}
            </div>
            {DAYS.map(day => {
              const sessions = schedule[day]?.[time] ?? [];
              const maxSessionsPerSlot = 4; // Limit to avoid overcrowding
              
              return (
                <div
                  key={`${day}-${time}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day, time)}
                  className="min-h-24 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200 relative"
                >
                  {sessions.length > 0 ? (
                    <div className="h-full overflow-y-auto">
                      <div className="p-1 space-y-1">
                        {sessions.slice(0, maxSessionsPerSlot).map((session, index) => (
                          <div key={session.id} className="relative">
                            <SessionCard 
                              session={session} 
                              tracks={tracks}
                              onDoubleClick={onEditSession}
                              onDragStart={handleDragStart}
                              isCompact={sessions.length > 1}
                            />
                          </div>
                        ))}
                        {sessions.length > maxSessionsPerSlot && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 p-1 text-center">
                            +{sessions.length - maxSessionsPerSlot} more
                          </div>
                        )}
                      </div>
                      {sessions.length < maxSessionsPerSlot && (
                        <button 
                          onClick={() => onAddSession(day, time)} 
                          className="absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
                          aria-label={`Add another session on ${day} at ${time}`}
                        >
                          <PlusIcon className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => onAddSession(day, time)} 
                      className="w-full h-full flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group"
                      aria-label={`Add session on ${day} at ${time}`}
                    >
                      <PlusIcon className="h-8 w-8 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                    </button>
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