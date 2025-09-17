import React, { useState, useEffect } from 'react';
import type { Session, Speaker } from '../types';
import { SessionStatus } from '../types';
import { DAYS, TIMES } from '../constants';
import { XIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { event_SpeakerService } from '../services/Event_speakers';
import { speaker_SesionService } from '../services/Speaker_SesionService';
import { sesionService } from '../services/sesionService';
import { Event_Speaker } from '@/types/Event_Speaker';
import { Sesion } from '../types/Sesion';
import { Speaker_Sesion } from '../types/Speaker_Sesion';

interface EditSessionModalProps {
  session: Sesion | null;  // Cambiar de Session a Sesion
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Sesion) => void;  // Cambiar de Session a Sesion
  onDelete: (sessionId: string) => void;
  canEdit: boolean;
  canViewDetails: boolean;
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({ session, isOpen, onClose, onSave, onDelete, canEdit, canViewDetails }) => {
  const [formData, setFormData] = useState<Partial<Session>>({});
  const [speakersText, setSpeakersText] = useState('');
  const [speakers, setSpeakers] = useState<Event_Speaker[]>([]);
  const { isAdmin, isUser, emailUser } = useAuth();

  // Usar el contexto como fallback si las props no están correctas
  const effectiveCanViewDetails = canViewDetails || isAdmin || isUser || !!emailUser;
  const effectiveCanEdit = canEdit || isAdmin;



  useEffect(() => {
    if (session) {
      obtenerSpeakers();
      // Solo cargar speakers si la sesión tiene ID (no es nueva)
      if (session.id) {
        cargarSpeakersDeSesion(session.id);
      }
      setFormData({
        title: session.title, // Ya no es 'tittle'
        notes: session.description,
        zoomLink: session.link,
        borderColor: session.color,
        time: session.time,
        day: session.day
      });
    } else {
      setFormData({});
      setSpeakersText('');
    }
  }, [session]);

  const cargarSpeakersDeSesion = async (sesionId: string) => {
    try {
      // Obtener las relaciones speaker-session
      const speakerSesions = await speaker_SesionService.getAllSpeaker_SesionsBySesionId(sesionId);
      
      // Obtener los speakers completos basados en los IDs
      const speakerIds = speakerSesions.map(ss => ss.speaker_id);
      const allSpeakers = await event_SpeakerService.getAllEvent_Speakers();
      const sessionSpeakers = allSpeakers.filter(speaker => speakerIds.includes(speaker.id));
      
      // Actualizar formData con los speakers cargados
      setFormData(prev => ({
        ...prev,
        speakers: sessionSpeakers
      }));
      
      setSpeakersText(sessionSpeakers.map(s => s.name).join(', '));
    } catch (error) {
      console.error('Error al cargar speakers de la sesión:', error);
    }
  };

  const obtenerSpeakers = async () => {
    console.log("obteniendo speakers");
    const data = await event_SpeakerService.getAllEvent_Speakers();
    setSpeakers(data);
    console.log(speakers);
  }
  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSpeakerToggle = (speakerId: string) => {
    const isSelected = formData.speakers?.some(s => s.id === speakerId) || false;
    
    if (isSelected) {
      // Quitar el speaker de la lista
      setFormData(prev => ({
        ...prev,
        speakers: prev.speakers?.filter(s => s.id !== speakerId) || []
      }));
    } else {
      // Agregar el speaker a la lista
      const speakerToAdd = speakers.find(s => s.id === speakerId);
      if (speakerToAdd) {
        setFormData(prev => ({
          ...prev,
          speakers: [...(prev.speakers || []), speakerToAdd]
        }));
      }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('formData', formData);
    // Solo validar campos que realmente existen en Sesion
    if (formData.title && formData.speakers) {
      try {
        // Mapear SOLO los campos que existen en Sesion
        const sesionToSave: Omit<Sesion, 'id' | 'created_at'> = {// Necesitas obtener el user_id real
          title: formData.title, // Ya no es 'tittle'
          description: formData.notes || '',
          link: formData.zoomLink || '',
          color: formData.borderColor || '#6B7280',
          time: formData.time || '',
          day: formData.day || ''
        };

        let sessionId: string;

        if (session?.id) {
          // Actualizar sesión existente
          const updatedSesion = await sesionService.updateSesion({
            ...sesionToSave,
            id: session.id,
            created_at: new Date().toISOString()
          });
          sessionId = updatedSesion.id;
          
          // Eliminar relaciones existentes
          await speaker_SesionService.deleteSpeakerSessionsBySessionId(sessionId);
        } else {
          // Crear nueva sesión
          const newSesion = await sesionService.createSesion(sesionToSave);
          sessionId = newSesion.id;
        }

        // Guardar las relaciones speaker-session
        for (const speaker of formData.speakers) {
          const speakerSesion: Omit<Speaker_Sesion, 'id' | 'created_at'> = {
            session_id: sessionId,
            speaker_id: speaker.id
          };
          
          await speaker_SesionService.createSpeaker_Sesion(speakerSesion);
        }

        // Preparar SOLO con los campos de Sesion (BD)
        const sesion: Sesion = {
          id: sessionId,
          created_at: new Date().toISOString(),
          title: formData.title,
          description: formData.notes,
          time: formData.time,
          day: formData.day,
          link: formData.zoomLink,
          color: formData.borderColor 
        };

        onSave(sesion);
        console.log('Sesión guardada exitosamente');
      } catch (error) {
        console.log('Error al guardar sesión:', error);
        alert(`Error al guardar la sesión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    } else {
      alert('Por favor completa todos los campos requeridos.');
    }
  };
  
  const handleDelete = () => {
    if (session && window.confirm('¿Estás seguro de que quieres eliminar esta sesión?')) {
      onDelete(session.id);
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-0 animate-[fadeIn_300ms_ease-out_forwards] z-40 flex justify-end" 
      onClick={onClose}
      style={{
        animation: 'fadeIn 300ms ease-out forwards'
      }}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl p-6 overflow-y-auto transform translate-x-full animate-[slideIn_400ms_ease-out_forwards]"
        onClick={e => e.stopPropagation()}
        style={{
          animation: 'slideIn 400ms ease-out forwards'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-100">
            {!effectiveCanViewDetails ? 'Sesión' : (!effectiveCanEdit ? 'Ver Sesión' : (session?.id ? 'Editar Sesión' : 'Agregar Sesión'))}
            {!effectiveCanViewDetails && <span className="ml-2 text-sm font-normal text-gray-500">(Inicia sesión para ver detalles)</span>}
            {!effectiveCanEdit && effectiveCanViewDetails && <span className="ml-2 text-sm font-normal text-gray-500">(Solo lectura)</span>}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título de la Sesión</label>
            <input 
              type="text" 
              name="title" 
              id="title" 
              value={formData.title || ''} 
              onChange={handleChange} 
              required 
              disabled={!effectiveCanEdit}
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${!effectiveCanEdit ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
            />
          </div>
          
          {!effectiveCanViewDetails && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Información limitada
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>Para ver todos los detalles de esta sesión (ponentes, sala, enlaces, notas), necesitas iniciar sesión con un enlace autorizado.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {effectiveCanViewDetails && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Ponentes/Participantes
                </label>
                
                {/* Contenedor con fondo unificado */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  
                  {/* Lista de ponentes seleccionados - SIEMPRE VISIBLE */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Seleccionados:</h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 min-h-[60px]">
                      {formData.speakers && formData.speakers.length > 0 ? (
                        <div className="space-y-2">
                          {formData.speakers.map(speaker => (
                            <div key={speaker.id} className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-md px-3 py-2 shadow-sm">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{speaker.name}</span>
                              <button
                                type="button"
                                onClick={() => handleSpeakerToggle(speaker.id)}
                                disabled={!canEdit}
                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <XIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-12">
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Ningún ponente fue seleccionado
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lista de ponentes disponibles */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Disponibles:</h4>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-600">
                      {speakers
                        .filter(speaker => !formData.speakers?.some(s => s.id === speaker.id))
                        .map(speaker => (
                          <button
                            key={speaker.id}
                            type="button"
                            onClick={() => handleSpeakerToggle(speaker.id)}
                            disabled={!canEdit}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-gray-200 dark:hover:border-gray-500"
                          >
                            + {speaker.name}
                          </button>
                        ))}
                      {speakers.filter(speaker => !formData.speakers?.some(s => s.id === speaker.id)).length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                          Todos los ponentes han sido seleccionados
                        </p>
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
            </>
          )}
          
          {effectiveCanViewDetails && (
            <>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas (opcional)</label>
                <textarea 
                  name="notes" 
                  id="notes" 
                  value={formData.notes || ''} 
                  onChange={handleChange} 
                  rows={3} 
                  disabled={!effectiveCanEdit}
                  placeholder="Información adicional sobre la sesión..." 
                  className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${!effectiveCanEdit ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
                />
              </div>
              <div>
                <label htmlFor="zoomLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enlace de Zoom (opcional)</label>
                <input 
                  type="url" 
                  name="zoomLink" 
                  id="zoomLink" 
                  value={formData.zoomLink || ''} 
                  onChange={handleChange} 
                  disabled={!effectiveCanEdit}
                  placeholder="https://zoom.us/j/123456789"
                  className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${!effectiveCanEdit ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
                />
              </div>
            </>
          )}
          
          {effectiveCanViewDetails && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="day" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Día</label>
                  <select name="day" id="day" value={formData.day || ''} onChange={handleChange} disabled className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm opacity-70">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora</label>
                  <select name="time" id="time" value={formData.time || ''} onChange={handleChange} disabled className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm opacity-70">
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              {/* Estado oculto: todas las sesiones se guardan como Confirmadas */}
              
              {/* Solo mostrar selector de color para administradores */}
              {effectiveCanEdit && (
                <div>
                  <label htmlFor="borderColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color de Línea Lateral</label>
                  <div className="flex space-x-2 items-center mt-1">
                    <input 
                      type="color" 
                      name="borderColor" 
                      id="borderColor" 
                      value={formData.borderColor || '#6B7280'} 
                      onChange={handleChange}
                      disabled={!effectiveCanEdit}
                      className={`w-12 h-10 rounded border border-gray-300 ${!effectiveCanEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    />
                    <select
                      name="borderColor"
                      onChange={handleChange}
                      value={formData.borderColor || '#6B7280'}
                      disabled={!effectiveCanEdit}
                      className={`flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${!effectiveCanEdit ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                    >
                      <option value="#8B5CF6">Púrpura</option>
                      <option value="#3B82F6">Azul</option>
                      <option value="#10B981">Verde</option>
                      <option value="#F59E0B">Naranja</option>
                      <option value="#EF4444">Rojo</option>
                      <option value="#EC4899">Rosa</option>
                      <option value="#8B5A00">Marrón</option>
                      <option value="#6B7280">Gris</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Selecciona un color o usa el selector personalizado</p>
                </div>
              )}
            </>
          )}

          {/* Sección de exportación */}
          {effectiveCanViewDetails && session?.id && (
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Exportar a Calendario</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const session = formData as Session;
                    const startDate = `${session.day}T${session.time}:00`;
                    const endDate = `${session.day}T${parseInt(session.time.split(':')[0]) + 1}:${session.time.split(':')[1]}:00`;
                    const speakers = session.speakers?.map(s => s.name).join(', ') || '';
                    const googleURL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(session.title)}&dates=${startDate.replace(/[^\d]/g, '')}/${endDate.replace(/[^\d]/g, '')}&details=${encodeURIComponent(`Ponentes: ${speakers}\nSala: ${session.room}`)}&location=${encodeURIComponent(session.room)}&ctz=America/Mexico_City`;
                    window.open(googleURL, '_blank');
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <img src="/logos/google.svg" alt="Google" className="w-4 h-4" />
                  <span>Google Calendar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const session = formData as Session;
                    // Trigger Apple Calendar download
                    const speakers = session.speakers?.map(s => s.name).join(', ') || '';
                    const filename = `${session.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
                    // Here you would call the ICS download function
                    alert(`Descargando ${filename} para Apple Calendar`);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <img src="/logos/apple.svg" alt="Apple" className="w-4 h-4" />
                  <span>Apple Calendar</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {effectiveCanEdit && effectiveCanViewDetails && session?.id && (
              <button type="button" onClick={handleDelete} className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
                Eliminar
              </button>
            )}
            <div className="flex-grow"></div>
            <button type="button" onClick={onClose} className={`${effectiveCanEdit && effectiveCanViewDetails ? 'mr-2' : ''} inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}>
              {effectiveCanEdit && effectiveCanViewDetails ? 'Cancelar' : 'Cerrar'}
            </button>
            {effectiveCanEdit && effectiveCanViewDetails && (
              <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                Guardar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSessionModal;
