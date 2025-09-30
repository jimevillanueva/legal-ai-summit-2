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
import { event_SpeakerService } from './services/Event_speakersService';
import { Event_Speaker } from './types/Event_Speaker';
import AddContact from './components/AddContact';

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
  const [speakers, setSpeakers] = useState<Event_Speaker[]>([]);

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

  const cargarSpeakers = useCallback(async () => {
    const data = await event_SpeakerService.getAllEvent_Speakers();
    setSpeakers(data);
  }, []);

  useEffect(() => {
    cargarSesiones(); 
    cargarSpeakers();

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
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{background: 'linear-gradient(to right, #1e3a8a, #1e40af, #3730a3)'}}>
        {/* Patrón de fondo similar al header */}
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        
        <div className="relative text-center p-4 sm:p-8 md:p-16 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-20 border border-white/20 min-w-[280px] sm:min-w-[400px] min-h-[200px] sm:min-h-[300px] flex flex-col justify-center items-center shadow-2xl mx-4" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
          {/* Logo similar al header */}
          <div className="mb-4 sm:mb-8 relative">
            <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-white/20">
              <img src="/logos/LAIS.png" alt="Logo Cumbre IA Legal" className="h-8 sm:h-12 w-auto" />
            </div>
          </div>
          
          {/* Spinner con colores del header */}
          <div className="w-12 h-12 sm:w-20 sm:h-20 border-4 sm:border-6 border-white/20 border-t-white rounded-full mx-auto mb-4 sm:mb-8 animate-spin" style={{boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)'}}></div>
          
          {/* Texto con colores del header */}
          <h2 className="text-white text-lg sm:text-2xl font-bold mb-2">Cumbre Legal AI</h2>
          <p className="text-white/80 text-sm sm:text-lg font-medium animate-pulse" style={{letterSpacing: '1px'}}>Cargando sesiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen overflow-x-hidden">
      <Header 
        onShare={() => {}} // TODO: Implementar share con sesiones
        onImportExport={() => setIsImportExportModalOpen(true)}
      />
      <ScheduleGrid 
        speakers={speakers}
        sesiones={sesiones}
        onSessionDrop={handleSessionDrop}
        onEditSession={handleEditSession}
        onAddSession={handleAddSession}
        canEdit={canEdit}
        canViewDetails={canViewDetails}
      />
      <EditSessionModal
        speakers={speakers}
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

      {/* Ruta protegida para admin */}
      <Route path="/add-contact" element={
        <ProtectedRoute requiredRole="admin">
          <AddContact />
        </ProtectedRoute>
      } />
      
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