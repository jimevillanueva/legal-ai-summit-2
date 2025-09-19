import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sesion } from './types/Sesion';
import { sesionService } from './services/sesionService';
import Header from './components/Header';
import ScheduleGrid from './components/ScheduleGrid';
import EditSessionModal from './components/EditSessionModal';
import ImportExportModal from './components/ImportExportModal';
import SupabaseStatus from './components/SupabaseStatus';
import NotesPanel from './components/NotesPanel';
import LoginView from './components/LoginView';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase, useSupabase } from './utils/supabaseClient';
import { db } from './utils/db';
import { checkForConflicts, decodeSchedule } from './utils/schedule'; // Cambiar de scheduleUtils a schedule
import { getInitialSchedule } from './constants'; // getInitialSchedule viene de constants

type SesionSchedule = Record<string, Record<string, Sesion[]>>;

const AppContent: React.FC = () => {
  const location = useLocation();
  const [sesiones, setSesiones] = useState<Sesion[]>([]); // Cambiar schedule por sesiones
  const [editingSession, setEditingSession] = useState<Sesion | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, canEdit, canView, canViewDetails, role } = useAuth();

  // Verificar si estamos en la ruta de callback
  const isAuthCallback = location.pathname === '/auth/callback';

  if (isAuthCallback) {
    return <AuthCallback />;
  }

  if (location.pathname === '/admin') {
    return <ProtectedRoute />;
  }

  // Cargar sesiones desde el backend
  const cargarSesiones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sesionService.getAllSesions();
      setSesiones(data);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
      setSesiones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarSesiones();

    // Configurar realtime solo si hay usuario autenticado
    if (useSupabase() && supabase && user) {
      const channel = supabase.channel('realtime-sessions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
          cargarSesiones();
        })
        .subscribe();
      
      return () => { 
        supabase.removeChannel(channel); 
      };
    }
  }, [cargarSesiones, user]); // Agregar user como dependencia

  // Schedule is now managed entirely by the database
  // No localStorage needed
  
  const findSessionById = useCallback((sessionId: string): Sesion | null => {
    return sesiones.find(s => s.id === sessionId) || null;
  }, [sesiones]);

  const handleSessionDrop = useCallback(async (sessionId: string, newDay: string, newTime: string) => {
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para editar sesiones');
      return;
    }

    const sessionToMove = findSessionById(sessionId);
    if (sessionToMove) {
      try {
        const updatedSession: Sesion = {
          ...sessionToMove,
          day: newDay,
          time: newTime
        };
        
        await sesionService.updateSesion(updatedSession);
        await cargarSesiones();
      } catch (error) {
        console.error('Error al mover sesión:', error);
      }
    }
  }, [findSessionById, canEdit, cargarSesiones]);

  const handleEditSession = (session: Sesion) => {
    setEditingSession(session);
    setIsEditModalOpen(true);
  };

  const handleAddSession = (day: string, time: string) => {
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para crear sesiones');
      return;
    }
    const newSession: Sesion = {
      id: '',
      created_at: new Date().toISOString(),
      title: '',
      description: '',
      link: '',
      color: '#6B7280',
      time,
      day
    };
    setEditingSession(newSession);
    setIsEditModalOpen(true);
  };

  const handleSaveSession = async (updatedSession: Sesion) => {
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para guardar sesiones');
      return;
    }

    try {
      if (updatedSession.id) {
        // Actualizar sesión existente
        await sesionService.updateSesion(updatedSession);
      } else {
        // Crear nueva sesión
        await sesionService.createSesion(updatedSession);
      }
      
      await cargarSesiones(); // Recargar sesiones
      setIsEditModalOpen(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Error al guardar sesión:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para eliminar sesiones');
      return;
    }

    try {
      const sessionToDelete = findSessionById(sessionId);
      if (sessionToDelete) {
        await sesionService.deleteSesion(sessionToDelete);
        await cargarSesiones(); // Recargar sesiones
      }
      setIsEditModalOpen(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Error al eliminar sesión:', error);
    }
  };

  // Convertir sesiones a formato Schedule para ScheduleGrid
  const convertirSesionesToSchedule = useCallback((): SesionSchedule => {
    const schedule: SesionSchedule = {};
    
    sesiones.forEach(sesion => {
      if (!schedule[sesion.day]) {
        schedule[sesion.day] = {};
      }
      if (!schedule[sesion.day][sesion.time]) {
        schedule[sesion.day][sesion.time] = [];
      }
      schedule[sesion.day][sesion.time].push(sesion);
    });

    return schedule;
  }, [sesiones]);

  // Mostrar loading mientras se verifica la autenticación (solo si no estamos en callback)
  if (authLoading && !isAuthCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sesiones...</p>
        </div>
      </div>
    );
  }

  // Mostrar vista de login si es necesario
  if (useSupabase() && !user && canViewDetails) {
    return <LoginView onAuthSuccess={() => {}} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header 
        onShare={() => {}} // TODO: Implementar share con sesiones
        onImportExport={() => setIsImportExportModalOpen(true)}
      />
      <ScheduleGrid 
        sesiones={sesiones}
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
      {/* Comentar temporalmente hasta actualizar estos componentes
      {canEdit && (
        <ImportExportModal
          isOpen={isImportExportModalOpen}
          schedule={convertirSesionesToSchedule()}
          onClose={() => setIsImportExportModalOpen(false)}
          onImport={() => {}}
        />
      )}
      <NotesPanel 
        isOpen={isNotesPanelOpen}
        onToggle={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
        schedule={convertirSesionesToSchedule()}
      />
      */}
      <SupabaseStatus />
      {/* <NotesPanel 
        isOpen={isNotesPanelOpen}
        onToggle={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
        schedule={convertirSesionesToSchedule()}
      /> */}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;