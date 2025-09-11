import React, { useState, useEffect, useCallback } from 'react';
import type { Schedule, Session } from './types';
import { SessionStatus } from './types';
import { getInitialSchedule } from './constants';
import { encodeSchedule, decodeSchedule, checkForConflicts } from './utils/schedule';
import Header from './components/Header';
import ScheduleGrid from './components/ScheduleGrid';
import EditSessionModal from './components/EditSessionModal';
import ImportExportModal from './components/ImportExportModal';
import SupabaseStatus from './components/SupabaseStatus';
import NotesPanel from './components/NotesPanel';
import { db } from './utils/db';
import { supabase, useSupabase } from './utils/supabaseClient';

const App: React.FC = () => {
  const [schedule, setSchedule] = useState<Schedule>(getInitialSchedule());
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  
  console.log('App rendering, schedule:', schedule);

  // Load initial data: Supabase (si está activo) o fallback local
  useEffect(() => {
    const init = async () => {
      if (useSupabase()) {
        try {
          const { schedule: s } = await db.loadAll();
          setSchedule(checkForConflicts(s));
          const ch = supabase.channel('realtime-sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, async () => {
              try {
                const { schedule: ns } = await db.loadAll();
                setSchedule(checkForConflicts(ns));
              } catch (e) { console.error(e); }
            })
            .subscribe();
          return () => { supabase.removeChannel(ch); };
        } catch (e) {
          console.error('Supabase init failed, using local fallback', e);
        }
      }
      const hash = window.location.hash.substring(1);
      let loadedSchedule: Schedule | null = null;
      if (hash) loadedSchedule = decodeSchedule(hash);
      if (!loadedSchedule) {
        try {
          const localData = localStorage.getItem('eventSchedule');
          if (localData) loadedSchedule = JSON.parse(localData);
        } catch (error) {
          console.error('Failed to parse schedule from localStorage', error);
        }
      }
      const finalSchedule = loadedSchedule || getInitialSchedule();
      setSchedule(checkForConflicts(finalSchedule));
    };
    const cleanup: any = init();
    return () => { /* channel cleanup handled in init */ };
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
        
        if (useSupabase()) {
          db.upsertSession(updatedSession).catch(console.error);
        }
        
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
      room: '',
      day,
      time,
      status: SessionStatus.CONFIRMED,
      borderColor: '#6B7280'
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
      
      if (useSupabase()) {
        db.upsertSession(updatedSession).catch(console.error);
      }

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
        if (useSupabase()) db.deleteSession(sessionId).catch(console.error);
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

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header 
        onShare={handleShare} 
        onImportExport={() => setIsImportExportModalOpen(true)}
      />
      <ScheduleGrid 
        schedule={schedule}
        onSessionDrop={handleSessionDrop}
        onEditSession={handleEditSession}
        onAddSession={handleAddSession}
      />
      <EditSessionModal
        isOpen={isEditModalOpen}
        session={editingSession}
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
      <SupabaseStatus />
      <NotesPanel 
        isOpen={isNotesPanelOpen}
        onToggle={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
        schedule={schedule}
      />
    </div>
  );
};

export default App;
