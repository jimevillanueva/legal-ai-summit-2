import React, { useState, useEffect, useCallback } from 'react';
import type { Schedule, Session, Track } from './types';
import { SessionStatus } from './types';
import { getInitialSchedule, getDefaultTracks } from './constants';
import { encodeSchedule, decodeSchedule, checkForConflicts } from './utils/schedule';
import Header from './components/Header';
import NavigationMenu from './components/NavigationMenu';
import ScheduleGrid from './components/ScheduleGrid';
import EditSessionModal from './components/EditSessionModal';
import ImportExportModal from './components/ImportExportModal';
import TrackManagementModal from './components/TrackManagementModal';

const App: React.FC = () => {
  const [schedule, setSchedule] = useState<Schedule>(getInitialSchedule());
  const [tracks, setTracks] = useState<Track[]>(getDefaultTracks());
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('agenda');
  
  console.log('App rendering, schedule:', schedule);

  // Load initial data from URL hash or localStorage
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    let loadedSchedule: Schedule | null = null;
    
    if (hash) {
      loadedSchedule = decodeSchedule(hash);
      if (loadedSchedule) {
        console.log("Loaded schedule from URL hash.");
      }
    }
    
    if (!loadedSchedule) {
      try {
        const localData = localStorage.getItem('eventSchedule');
        if (localData) {
          loadedSchedule = JSON.parse(localData);
          console.log("Loaded schedule from localStorage.");
        }
      } catch (error) {
        console.error("Failed to parse schedule from localStorage", error);
      }
    }
    
    const finalSchedule = loadedSchedule || getInitialSchedule();
    setSchedule(checkForConflicts(finalSchedule));
    
  }, []);

  // Save to localStorage whenever schedule changes
  useEffect(() => {
    try {
      localStorage.setItem('eventSchedule', JSON.stringify(schedule));
    } catch (error) {
      console.error("Failed to save schedule to localStorage", error);
    }
  }, [schedule]);
  
  const findSessionById = useCallback((sessionId: string): [Session | null, string | null, string | null, number] => {
    for (const day in schedule) {
      for (const time in schedule[day]) {
        const sessions = schedule[day][time];
        for (let i = 0; i < sessions.length; i++) {
          if (sessions[i].id === sessionId) {
            return [sessions[i], day, time, i];
          }
        }
      }
    }
    return [null, null, null, -1];
  }, [schedule]);

  const handleSessionDrop = useCallback((sessionId: string, newDay: string, newTime: string) => {
    const [sessionToMove, oldDay, oldTime, oldIndex] = findSessionById(sessionId);

    if (sessionToMove && oldDay && oldTime && oldIndex >= 0) {
      setSchedule(prevSchedule => {
        const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
        
        // Remove from old position
        newSchedule[oldDay][oldTime].splice(oldIndex, 1);
        
        // Add to new position
        const updatedSession = { ...sessionToMove, day: newDay, time: newTime };
        newSchedule[newDay][newTime].push(updatedSession);
        
        return checkForConflicts(newSchedule);
      });
    }
  }, [schedule, findSessionById]);

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setIsEditModalOpen(true);
  };

  const handleAddSession = (day: string, time: string) => {
    const newSession: Session = {
      id: `s${Date.now()}`,
      title: '',
      speakers: [],
      trackId: 'legal-ia',
      room: '',
      day,
      time,
      status: SessionStatus.PROPOSED
    }
    setEditingSession(newSession);
    setIsEditModalOpen(true);
  };

  const handleSaveSession = (updatedSession: Session) => {
    setSchedule(prevSchedule => {
      const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
      
      // If it's an existing session, remove it from its old slot
      const [existingSession, oldDay, oldTime, oldIndex] = findSessionById(updatedSession.id);
      if (existingSession && oldDay && oldTime && oldIndex >= 0) {
        newSchedule[oldDay][oldTime].splice(oldIndex, 1);
      }

      // Add to new slot
      newSchedule[updatedSession.day][updatedSession.time].push(updatedSession);
      
      return checkForConflicts(newSchedule);
    });
    setIsEditModalOpen(false);
    setEditingSession(null);
  };
  
  const handleDeleteSession = (sessionId: string) => {
    const [sessionToDelete, day, time, index] = findSessionById(sessionId);
    if (sessionToDelete && day && time && index >= 0) {
      setSchedule(prevSchedule => {
        const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
        newSchedule[day][time].splice(index, 1);
        return checkForConflicts(newSchedule);
      });
    }
    setIsEditModalOpen(false);
    setEditingSession(null);
  };

  const handleShare = () => {
    const encoded = encodeSchedule(schedule);
    const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Shareable URL copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy URL: ', err);
      alert('Failed to copy URL.');
    });
  };
  
  const handleImport = (newSchedule: Schedule) => {
    setSchedule(checkForConflicts(newSchedule));
  };

  const handleSaveTracks = (newTracks: Track[]) => {
    setTracks(newTracks);
    try {
      localStorage.setItem('eventTracks', JSON.stringify(newTracks));
    } catch (error) {
      console.error("Failed to save tracks to localStorage", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'agenda':
        return (
          <ScheduleGrid 
            schedule={schedule}
            tracks={tracks}
            onSessionDrop={handleSessionDrop}
            onEditSession={handleEditSession}
            onAddSession={handleAddSession}
          />
        );
      case 'ponentes':
        return (
          <div className="flex-grow p-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Ponentes</h2>
              <p className="text-gray-600 dark:text-gray-300">Sección de ponentes en desarrollo</p>
            </div>
          </div>
        );
      case 'información':
        return (
          <div className="flex-grow p-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Información del Evento</h2>
              <p className="text-gray-600 dark:text-gray-300">Información general del evento en desarrollo</p>
            </div>
          </div>
        );
      default:
        return (
          <ScheduleGrid 
            schedule={schedule}
            tracks={tracks}
            onSessionDrop={handleSessionDrop}
            onEditSession={handleEditSession}
            onAddSession={handleAddSession}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header 
        onShare={handleShare} 
        onImportExport={() => setIsImportExportModalOpen(true)}
        onManageTracks={() => setIsTrackModalOpen(true)}
      />
      <NavigationMenu 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {renderContent()}
      <EditSessionModal
        isOpen={isEditModalOpen}
        session={editingSession}
        tracks={tracks}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveSession}
        onDelete={handleDeleteSession}
      />
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        schedule={schedule}
        onClose={() => setIsImportExportModalOpen(false)}
        onImport={handleImport}
      />
      <TrackManagementModal
        isOpen={isTrackModalOpen}
        tracks={tracks}
        onClose={() => setIsTrackModalOpen(false)}
        onSaveTracks={handleSaveTracks}
      />
    </div>
  );
};

export default App;