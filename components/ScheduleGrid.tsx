import React from 'react';
import type { Schedule, Session } from '../types';
import { DAYS, TIMES } from '../constants';
import SessionCard from './SessionCard';
import { PlusIcon } from './icons';

interface ScheduleGridProps {
  schedule: Schedule;
  onSessionDrop: (sessionId: string, newDay: string, newTime: string) => void;
  onEditSession: (session: Session) => void;
  onAddSession: (day: string, time: string) => void;
  canEdit: boolean;
  canViewDetails: boolean;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ schedule, onSessionDrop, onEditSession, onAddSession, canEdit, canViewDetails }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, session: Session) => {
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
              const maxSessionsPerSlot = 4; // Limit to avoid overcrowding
              
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