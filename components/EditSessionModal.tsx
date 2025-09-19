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
import { exportToGoogleCalendar, exportToAppleCalendar } from '../utils/calendarExport';

interface EditSessionModalProps {
  session: Sesion | null;  // Cambiar de Session a Sesion
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Sesion) => void;  // Cambiar de Session a Sesion
  onDelete: (sessionId: string) => void;
  canEdit: boolean;
  canViewDetails: boolean;
}

// Cambiar el tipo de formData
interface FormData {
  title?: string;
  notes?: string;
  zoomLink?: string;
  borderColor?: string;
  time?: string;
  day?: string;
  speakers?: Event_Speaker[]; // Usar Event_Speaker en lugar de Speaker
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({ session, isOpen, onClose, onSave, onDelete, canEdit, canViewDetails }) => {
  const [formData, setFormData] = useState<FormData>({}); // Cambiar tipo
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

  useEffect(() => {
    console.log("formData.speakers:", formData.speakers);
    console.log("Tipo de primer speaker:", formData.speakers?.[0]);
  }, [formData.speakers]);

  const cargarSpeakersDeSesion = async (sesionId: string) => {
    try {
      // Obtener las relaciones speaker-session
      const speakerSesions = await speaker_SesionService.getAllSpeaker_SesionsBySesionId(sesionId);
      
      // Obtener los speakers completos basados en los IDs
      const speakerIds = speakerSesions.map(ss => ss.speaker_id);
      const allSpeakers = await event_SpeakerService.getAllEvent_Speakers();
      const sessionSpeakers = allSpeakers.filter(speaker => speakerIds.includes(speaker.id));
      
      // IMPORTANTE: Actualizar formData con los speakers cargados
      setFormData(prev => ({
        ...prev,
        speakers: sessionSpeakers // Ahora sessionSpeakers son Event_Speaker[]
      }));
      
      setSpeakersText(sessionSpeakers.map(s => s.name).join(', '));
      
      console.log("Speakers cargados para la sesión:", sessionSpeakers);
    } catch (error) {
      console.error('Error al cargar speakers de la sesión:', error);
    }
  };

  const obtenerSpeakers = async () => {
    console.log("obteniendo speakers");
    const data = await event_SpeakerService.getAllEvent_Speakers();
    setSpeakers(data);
    console.log("=== SPEAKERS DATA ===");
    console.log("Speakers completos:", data);
    data.forEach((speaker, index) => {
      console.log(`Speaker ${index}:`, {
        id: speaker.id,
        name: speaker.name,
        company: speaker.company,
        position: speaker.position,
        linkedin: speaker.linkedin,
        photo: speaker.photo
      });
    });
    console.log("=====================");
  }

  // También agregar log en formData.speakers
  useEffect(() => {
    console.log("=== FORM DATA SPEAKERS ===");
    console.log("formData.speakers:", formData.speakers);
    formData.speakers?.forEach((speaker, index) => {
      console.log(`FormData Speaker ${index}:`, {
        id: speaker.id,
        name: speaker.name,
        company: speaker.company,
        position: speaker.position,
        linkedin: speaker.linkedin,
        photo: speaker.photo
      });
    });
    console.log("========================");
  }, [formData.speakers]);
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
        const sesionToSave: Omit<Sesion, 'id' | 'created_at'> = {
          title: formData.title,
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

  const handleExportToGoogle = () => {
    if (session && formData.speakers) {
      const googleURL = exportToGoogleCalendar(session,formData.speakers);
      window.open(googleURL, '_blank');
    }
  };

  const handleExportToApple = () => {
    if (session && formData.speakers) {
      // Crear un schedule temporal con solo esta sesión
      const tempSchedule = {
        [session.day]: {
          [session.time]: [session]
        }
      };
      exportToAppleCalendar(session);
    }
  };

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

        {!effectiveCanViewDetails ? (
          // Vista para usuarios no registrados
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Inicia sesión para ver detalles
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Necesitas estar registrado para ver la información completa de esta sesión
              </p>
              <button 
                onClick={onClose}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : canViewDetails && !effectiveCanEdit ? (
          // Vista de solo lectura para usuarios registrados
          <div className="space-y-6">
            {/* Título */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {formData.title || 'Sin título'}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>{formData.day || 'Día no definido'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>{formData.time || 'Hora no definida'}</span>
                </div>
              </div>
            </div>

            {/* Ponentes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  👥
                </span>
                Ponentes/Participantes
              </h4>
              
              {formData.speakers && formData.speakers.length > 0 ? (
                <div className="space-y-3">
                  {formData.speakers.map(speaker => (
                    <div key={speaker.id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-lg border border-gray-100 dark:border-gray-600">
                      {/* Avatar con foto real o inicial */}
                      <div className="flex-shrink-0">
                        {speaker.photo ? (
                          <img 
                            src={speaker.photo} 
                            alt={speaker.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                            onError={(e) => {
                              // Si falla la imagen, mostrar inicial
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${speaker.photo ? 'hidden' : ''}`}>
                          {speaker.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      
                      {/* Información del ponente */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                          {speaker.name}
                        </h5>
                        
                        {speaker.position && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                            {speaker.position}
                          </p>
                        )}
                        
                        {speaker.company && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {speaker.company}
                          </p>
                        )}
                        
                        {speaker.linkedin && (
                          <a 
                            href={speaker.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="text-lg font-medium">No hay ponentes asignados</p>
                  <p className="text-sm">Esta sesión aún no tiene ponentes confirmados</p>
                </div>
              )}
            </div>

            {/* Información adicional - Zoom arriba, Notas abajo */}
            <div className="space-y-4">
              {/* Enlace de Zoom */}
              {formData.zoomLink && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                    <span className="text-lg">🔗</span>
                    Enlace de Zoom
                  </h4>
                  <a 
                    href={formData.zoomLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.777 4.430l1.4-.933A1 1 0 0122 4.5v15a1 1 0 01-1.625 1.003l-1.4-.934A1 1 0 0119.777 19.5V4.5z"/>
                      <rect x="2" y="6" width="16" height="12" rx="2" fill="currentColor"/>
                    </svg>
                    Unirse a la reunión
                  </a>
                </div>
              )}

              {/* Notas */}
              {formData.notes && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    Notas
                  </h4>
                  <div className="bg-white dark:bg-amber-900/10 rounded-md p-3 border">
                    <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-wrap">
                      {formData.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de exportación - Solo para usuarios registrados */}
            {effectiveCanViewDetails  && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  Exportar a Calendario
                </h4>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportToGoogle}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google Calendar
                  </button>
                   <button
                    onClick={handleExportToApple}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-md"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Apple Calendar
                  </button> 
                </div>
              </div>
            )}

            {/* Botones para vista de solo lectura */}
            <div className="flex justify-end pt-4">
              <button type="button" onClick={onClose} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          // Vista de formulario para edición
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
                className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${!effectiveCanEdit ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            
            {effectiveCanViewDetails && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Ponentes/Participantes
                  </label>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
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
                                  disabled={!effectiveCanEdit}
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
                              disabled={!effectiveCanEdit}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="day" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Día</label>
                    <select 
                      name="day" 
                      id="day" 
                      value={formData.day || ''} 
                      onChange={handleChange} 
                      disabled={!effectiveCanEdit}
                      className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${!effectiveCanEdit ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-70' : ''}`}
                    >
                      <option value="">Selecciona un día</option>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora</label>
                    <select 
                      name="time" 
                      id="time" 
                      value={formData.time || ''} 
                      onChange={handleChange} 
                      disabled={!effectiveCanEdit}
                      className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${!effectiveCanEdit ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-70' : ''}`}
                    >
                      <option value="">Selecciona una hora</option>
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  Exportar a Calendario
                </h4>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportToGoogle}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google Calendar
                  </button>
                   <button
                    onClick={handleExportToApple}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-md"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Apple Calendar
                  </button> 
                </div>
              </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditSessionModal;
