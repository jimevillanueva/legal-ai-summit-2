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
import LoginView from './components/LoginView';
import AuthCallback from './components/AuthCallback';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { db } from './utils/db';
import { supabase, useSupabase } from './utils/supabaseClient';

const AppContent: React.FC = () => {
  const [schedule, setSchedule] = useState<Schedule>(getInitialSchedule());
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const { user, loading: authLoading, canEdit, canView, canViewDetails, role } = useAuth();
  
  console.log('App rendering - user:', user?.email, 'role:', role, 'canEdit:', canEdit, 'canView:', canView, 'loading:', authLoading);

  // Verificar si estamos en la ruta de callback
  const isAuthCallback = window.location.pathname === '/auth/callback';

  // Si estamos en la ruta de callback, mostrar el componente de callback
  if (isAuthCallback) {
    return <AuthCallback />;
  }

  // Load initial data: Supabase (si está activo y usuario autenticado) o fallback local
  useEffect(() => {
    const init = async () => {
      if (useSupabase() && supabase && user && canViewDetails) {
        try {
          const { schedule: s } = await db.loadAll();
          
          // Verificar si el schedule de Supabase está vacío
          const hasSessions = Object.keys(s).some(day => 
            Object.keys(s[day]).some(time => s[day][time].length > 0)
          );
          
          if (hasSessions) {
            setSchedule(checkForConflicts(s));
          } else {
            const initialSchedule = getInitialSchedule();
            setSchedule(checkForConflicts(initialSchedule));
          }
          
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
      
      console.log('Loading local data...');
      const hash = window.location.hash.substring(1);
      let loadedSchedule: Schedule | null = null;
      if (hash) loadedSchedule = decodeSchedule(hash);
      
      const finalSchedule = loadedSchedule || getInitialSchedule();
      console.log('Final schedule to set:', finalSchedule);
      setSchedule(checkForConflicts(finalSchedule));
      console.log('=== INIT EFFECT END ===');
    };
    const cleanup: any = init();
    return () => { /* channel cleanup handled in init */ };
  }, [user, canViewDetails]);

  // Schedule is now managed entirely by the database
  // No localStorage needed
  
  const findSessionById = useCallback((sessionId: string): [Session | null, string | null, string | null, number] => {
    for (const day of Object.keys(schedule)) {
      for (const time of Object.keys(schedule[day])) {
        const index = schedule[day][time].findIndex(s => s.id === sessionId);
        if (index >= 0) {
          return [schedule[day][time][index], day, time, index];
        }
      }
    }
    return [null, null, null, -1];
  }, [schedule]);

  const handleSessionDrop = useCallback((sessionId: string, newDay: string, newTime: string) => {
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para editar sesiones');
      return;
    }

    const [sessionToMove, oldDay, oldTime, oldIndex] = findSessionById(sessionId);
    if (sessionToMove && oldDay && oldTime && oldIndex >= 0) {
      setSchedule(prevSchedule => {
        const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
        
        // Remove from old position
        newSchedule[oldDay][oldTime].splice(oldIndex, 1);
        
        // Add to new position
        const updatedSession = { ...sessionToMove, day: newDay, time: newTime };
        newSchedule[newDay][newTime].push(updatedSession);
        
        if (useSupabase() && user && canEdit) {
          db.upsertSession(updatedSession).catch(console.error);
        }
        
        return checkForConflicts(newSchedule);
      });
    }
  }, [schedule, findSessionById, canEdit, user]);

  const handleEditSession = (session: Session) => {
    // Permitir que todos los usuarios puedan ver la sesión, pero con restricciones según permisos
    setEditingSession(session);
    setIsEditModalOpen(true);
  };

  const handleAddSession = (day: string, time: string) => {
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para crear sesiones');
      return;
    }
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
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para guardar sesiones');
      return;
    }

    setSchedule(prevSchedule => {
      const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
      
      // If it's an existing session, remove it from its old slot
      const [existingSession, oldDay, oldTime, oldIndex] = findSessionById(updatedSession.id);
      if (existingSession && oldDay && oldTime && oldIndex >= 0) {
        newSchedule[oldDay][oldTime].splice(oldIndex, 1);
      }

      // Add to new slot
      newSchedule[updatedSession.day][updatedSession.time].push(updatedSession);
      
      if (useSupabase() && user && canEdit) {
        db.upsertSession(updatedSession).catch(console.error);
      }

      return checkForConflicts(newSchedule);
    });
    setIsEditModalOpen(false);
    setEditingSession(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para eliminar sesiones');
      return;
    }

    const [sessionToDelete, day, time, index] = findSessionById(sessionId);
    if (sessionToDelete && day && time && index >= 0) {
      setSchedule(prevSchedule => {
        const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
        newSchedule[day][time].splice(index, 1);
        if (useSupabase() && user && canEdit) db.deleteSession(sessionId).catch(console.error);
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
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para importar datos');
      return;
    }
    setSchedule(checkForConflicts(newSchedule));
  };

  // Mostrar loading mientras se verifica la autenticación (solo si no estamos en callback)
  if (authLoading && !isAuthCallback) {
    console.log('Showing loading screen...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Mostrar vista de login solo si se requiere autenticación para ver detalles
  // (esto se puede personalizar según las necesidades)
  if (useSupabase() && !user && canViewDetails) {
    console.log('Showing login view - user:', !!user, 'canViewDetails:', canViewDetails);
    return <LoginView onAuthSuccess={() => {}} />;
  }

  console.log('Showing main app...');
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
        canEdit={canEdit}
        canViewDetails={canViewDetails}
      />
      <EditSessionModal
        isOpen={isEditModalOpen}
        session={editingSession}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveSession}
        onDelete={handleDeleteSession}
        canEdit={canEdit}
        canViewDetails={canViewDetails}
      />
      {canEdit && (
        <ImportExportModal
          isOpen={isImportExportModalOpen}
          schedule={schedule}
          onClose={() => setIsImportExportModalOpen(false)}
          onImport={handleImport}
        />
      )}
      <SupabaseStatus />
      <NotesPanel 
        isOpen={isNotesPanelOpen}
        onToggle={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
        schedule={schedule}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;