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
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import UserTicket from './components/UserTicket';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase, useSupabase } from './utils/supabaseClient';
import { db } from './utils/db';
import { checkForConflicts, decodeSchedule } from './utils/schedule';
import { getInitialSchedule } from './constants';
import './styles/App.css';

type SesionSchedule = Record<string, Record<string, Sesion[]>>;

const MainApp: React.FC = () => {
  const [sesiones, setSesiones] = useState<Sesion[]>([]); // Cambiar schedule por sesiones
  const [editingSession, setEditingSession] = useState<Sesion | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, canEdit, canView, canViewDetails, role } = useAuth();
  const location = useLocation();

  // Verificar si estamos en la ruta de callback
  const isAuthCallback = location.pathname === '/auth/callback';

  // Cargar sesiones desde el backend
  const cargarSesiones = useCallback(async () => {
    //console.log('Cargando sesiones en app.tsx');
    try {
      setLoading(true);
      //const inicio = performance.now();
      const data = await sesionService.getAllSesions();
      setSesiones(data);
      //const fin = performance.now();
      //console.log(`⏱ Tiempo de ejecución: ${(fin - inicio).toFixed(2)} ms`);
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
  }, [cargarSesiones, user]);

  const findSessionById = useCallback((sessionId: string): Sesion | null => {
    return sesiones.find(s => s.id === sessionId) || null;
  }, [sesiones]);

  const handleSessionDrop = useCallback(async (sessionId: string, newDay: string, newTime: string) => {
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para editar sesiones');
      return;
    }
    try{
      const updatedSession = await sesionService.updateSesionTimeAndDay(sessionId, newTime, newDay);
      await cargarSesiones();
    } catch (error) {
      console.error('Error al mover sesión:', error);
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
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando sesiones...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="app-container">
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
      {/*<SupabaseStatus />*/}
      {/* <NotesPanel 
        isOpen={isNotesPanelOpen}
        onToggle={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
        schedule={convertirSesionesToSchedule()}
      /> */}
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Ruta de callback de autenticación */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Ruta pública para tickets */}
      <Route path="/ticket/:contactId" element={<UserTicket />} />
      
      {/* Ruta protegida para admin */}
      <Route path="/admin" element={<ProtectedRoute />} />
      
      {/* Ruta principal */}
      <Route path="/" element={<MainApp />} />
    </Routes>
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