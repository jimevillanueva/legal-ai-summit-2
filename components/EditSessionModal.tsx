import React, { useState, useEffect } from 'react';
import type { Session, Speaker } from '../types';
import { SessionStatus } from '../types';
import { DAYS, TIMES } from '../constants';
import { XIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { event_SpeakerService } from '../services/Event_speakersService';
import { speaker_SesionService } from '../services/Speaker_SesionService';
import { sesionService } from '../services/sesionService';
import { Event_Speaker } from '@/types/Event_Speaker';
import { Sesion } from '../types/Sesion';
import { Speaker_Sesion } from '../types/Speaker_Sesion';
import { exportToGoogleCalendar, exportToAppleCalendar } from '../utils/calendarExport';
import { getSpeakerPhotoUrl, getCompanyLogoUrl } from '../utils/storage';
import AlertaModal from './AlertaModal';
import AppleCalendarLogo from './AppleCalendarLogo';

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
  const [alertaModal, setAlertaModal] = useState<{
    isOpen: boolean;
    type: 'eliminar' | 'validacion';
    title: string;
    message: string;
    camposFaltantes?: string[];
  }>({
    isOpen: false,
    type: 'validacion',
    title: '',
    message: '',
    camposFaltantes: []
  });
  const { isAdmin, isUser, emailUser } = useAuth();
  const [linkModal, setLinkModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  }>({
    isOpen: false,
    url: '',
    title: ''
  });

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
      
    } catch (error) {
      console.error('Error al cargar speakers de la sesión:', error);
    }
  };

  const obtenerSpeakers = async () => {
    const data = await event_SpeakerService.getAllEvent_Speakers();
    setSpeakers(data);
  }

  // También agregar log en formData.speakers
  useEffect(() => {

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
    e.stopPropagation(); // Evitar que el evento se propague
    
    // Validar campos requeridos
    const camposFaltantes: string[] = [];
    if (!formData.title?.trim()) camposFaltantes.push('Título de la sesión');
    if (!formData.speakers || formData.speakers.length === 0) camposFaltantes.push('Al menos un ponente');
    if (!formData.zoomLink) camposFaltantes.push('Enlace de Zoom');
    if (!formData.day?.trim()) camposFaltantes.push('Día');
    if (!formData.time?.trim()) camposFaltantes.push('Hora');

    if (camposFaltantes.length > 0) {
      setAlertaModal({
        isOpen: true,
        type: 'validacion',
        title: 'Campos requeridos',
        message: 'Por favor completa todos los campos obligatorios para continuar.',
        camposFaltantes
      });
      return; // Importante: return aquí para evitar que continúe
    }

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
      onClose(); // Cerrar el modal después de guardar
    } catch (error) {
      setAlertaModal({
        isOpen: true,
        type: 'validacion',
        title: 'Error al guardar',
        message: `Error al guardar la sesión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        camposFaltantes: []
      });
    }
  };
  
  const handleDelete = () => {
    setAlertaModal({
      isOpen: true,
      type: 'eliminar',
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.',
      camposFaltantes: []
    });
  };
  const ConvertirFecha = (fecha: string) => {
    if (!fecha) return "";
  
    // Intentar parsear la fecha
    let fechaObj = new Date(fecha);
  
    // Si viene en formato YYYY-MM-DD forzar zona local
    if (fecha.includes("T") === false) {
      const [year, month, day] = fecha.split("-").map(Number);
      fechaObj = new Date(year, month - 1, day);
    }
  
    if (isNaN(fechaObj.getTime())) {
      console.warn("Fecha inválida:", fecha);
      return "";
    }
  
    const formatter = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  
    return formatter.format(fechaObj);
  };

  const ConvertirFechaSinAno = (fecha: string) => {
    if (!fecha) return "";
  
    // Intentar parsear la fecha
    let fechaObj = new Date(fecha);
  
    // Si viene en formato YYYY-MM-DD forzar zona local
    if (fecha.includes("T") === false) {
      const [year, month, day] = fecha.split("-").map(Number);
      fechaObj = new Date(year, month - 1, day);
    }
  
    if (isNaN(fechaObj.getTime())) {
      console.warn("Fecha inválida:", fecha);
      return "";
    }
  
    const formatter = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  
    return formatter.format(fechaObj);
  };

  const handleConfirmDelete = async () => {
    if (session) {
      try {
        await onDelete(session.id);
        setAlertaModal({ ...alertaModal, isOpen: false });
        onClose();
      } catch (error) {
        console.error('Error al eliminar sesión:', error);
      }
    }
  };

  const handleCloseAlerta = () => {
    setAlertaModal({ ...alertaModal, isOpen: false });
  };

  const handleExportToGoogle = () => {
    if (session && formData.speakers) {
      const googleURL = exportToGoogleCalendar(session, formData.speakers);
      // Usar window.open en lugar de href para evitar problemas de navegación
      const newWindow = window.open(googleURL, '_blank', 'noopener,noreferrer');

    }
  };

  const handleExportToApple = () => {
    if (session && formData.speakers) {
      exportToAppleCalendar(session);
    }
  };

  const handleZoomClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    if (formData.zoomLink) {
      // Intentar abrir en nueva ventana
      window.open(formData.zoomLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLinkedInClick = (e: React.MouseEvent, linkedinUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    // Intentar abrir en nueva ventana
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Enlace copiado al portapapeles');
    }
  };

  // Función para manejar el cierre del modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Solo cerrar si el clic fue directamente en el backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-0 animate-[fadeIn_300ms_ease-out_forwards] z-40 flex justify-end" 
        style={{
          animation: 'fadeIn 300ms ease-out forwards'
        }}
      >
        <div 
          className="w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl p-3 sm:p-6 overflow-y-auto transform translate-x-full animate-[slideIn_400ms_ease-out_forwards]"
          onClick={e => e.stopPropagation()}
          style={{
            animation: 'slideIn 400ms ease-out forwards'
          }}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-100">
              {!effectiveCanViewDetails ? 'Sesión' : (!effectiveCanEdit ? 'Ver Sesión' : (session?.id ? 'Editar Sesión' : 'Agregar Sesión'))}
              {!effectiveCanViewDetails && <span className="ml-2 text-xs sm:text-sm font-normal text-gray-500">(Inicia sesión para ver detalles)</span>}
              {!effectiveCanEdit && effectiveCanViewDetails && <span className="ml-2 text-xs sm:text-sm font-normal text-gray-500">(Solo lectura)</span>}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
              <XIcon />
            </button>
          </div>

          {!effectiveCanViewDetails ? (
            // Vista para usuarios no registrados
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">🔒</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Inicia sesión para ver detalles
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                  Necesitas estar registrado para ver la información completa de esta sesión
                </p>
                <button 
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : canViewDetails && !effectiveCanEdit ? (
            // Vista de solo lectura para usuarios registrados
            <div className="space-y-4 sm:space-y-6">
              {/* Título */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {formData.title || 'Sin título'}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{ConvertirFecha(formData.day) || 'Día no definido'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{formData.time || 'Hora no definida'}</span>
                  </div>
                </div>
              </div>

              {/* Ponentes */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    👥
                  </span>
                  Ponentes
                </h4>
                
                {formData.speakers && formData.speakers.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {formData.speakers.map(speaker => (
                      <div key={speaker.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-lg border border-gray-100 dark:border-gray-600">
                        {/* Avatar con foto real o inicial */}
                        <div className="flex-shrink-0">
                          {speaker.photo && speaker.photo.trim() ? (
                            <img 
                              src={getSpeakerPhotoUrl(speaker.photo) || speaker.photo} 
                              alt={speaker.name}
                              className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-md"
                              onError={(e) => {
                                // Si falla la imagen, mostrar inicial
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md ${speaker.photo && speaker.photo.trim() ? 'hidden' : ''}`}>
                            {speaker.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        
                        {/* Información del ponente */}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-lg">
                            {speaker.name}
                          </h5>
                          
                          {speaker.position && (
                            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                              {speaker.position}
                            </p>
                          )}
                          
                          {speaker.company && (
                            <div className="flex items-center gap-2 mt-1">
                              {speaker.company && speaker.company.trim() && (
                                <img 
                                  src={getCompanyLogoUrl(speaker.company)} 
                                  alt={`${speaker.company} logo`}
                                  className="w-4 h-4 sm:w-6 sm:h-6 object-contain"
                                  onError={(e) => {
                                    // Si falla la imagen del logo, ocultarla
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          )}
                          
                          {speaker.linkedin && (
                            <button 
                              onClick={(e) => handleLinkedInClick(e, speaker.linkedin)}
                              className="inline-flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                              <span className="hidden sm:inline">LinkedIn</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <span className="text-xl sm:text-2xl">👥</span>
                    </div>
                    <p className="text-sm sm:text-lg font-medium">No hay ponentes asignados</p>
                    <p className="text-xs sm:text-sm">Esta sesión aún no tiene ponentes confirmados</p>
                  </div>
                )}
              </div>

              {/* Información adicional - Zoom arriba, Notas abajo */}
              <div className="space-y-3 sm:space-y-4">
                {/* Enlace de Zoom */}
                {formData.zoomLink && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                      <h4 className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                        <span className="text-sm sm:text-lg">🔗</span>
                        Enlace de Zoom
                      </h4>
                      <button 
                        onClick={handleZoomClick}
                        className="inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z" fill="white"/>
                          <path d="M8.26667 10C7.56711 10 7 10.6396 7 11.4286V18.3571C7 20.369 8.44612 22 10.23 22L17.7333 21.9286C18.4329 21.9286 19 21.289 19 20.5V13.5C19 11.4881 17.2839 10 15.5 10L8.26667 10Z" fill="#4087FC"/>
                          <path d="M20.7122 12.7276C20.2596 13.1752 20 13.8211 20 14.5V17.3993C20 18.0782 20.2596 18.7242 20.7122 19.1717L23.5288 21.6525C24.1019 22.2191 25 21.7601 25 20.9005V11.1352C25 10.2755 24.1019 9.81654 23.5288 10.3832L20.7122 12.7276Z" fill="#4087FC"/>
                        </svg>
                        <span className="text-xs sm:text-sm">Unirse a la reunión</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Notas */}
                {formData.notes && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 sm:p-4 border border-amber-200 dark:border-amber-800">
                    <h4 className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200 mb-2 sm:mb-3 flex items-center gap-2">
                      <span className="text-sm sm:text-lg">📝</span>
                      Notas
                    </h4>
                    <div className="bg-white dark:bg-amber-900/10 rounded-md p-2 sm:p-3 border">
                      <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-wrap">
                        {formData.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de exportación - Solo para usuarios registrados */}
              {effectiveCanViewDetails && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-2 sm:p-3 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <span className="text-sm sm:text-base">📅</span>
                    Exportar a Calendario
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleExportToGoogle}
                      className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-400 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-red-500 transition-colors shadow-sm"
                    >
                      <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="-11.4 -19 98.8 114" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#fff" d="M58 18H18v40h40z"/>
                        <path fill="#ea4335" d="M58 76l18-18H58z"/>
                        <path fill="#fbbc04" d="M76 18H58v40h18z"/>
                        <path fill="#34a853" d="M58 58H18v18h40z"/>
                        <path fill="#188038" d="M0 58v12c0 3.315 2.685 6 6 6h12V58z"/>
                        <path fill="#1967d2" d="M76 18V6c0-3.315-2.685-6-6-6H58v18z"/>
                        <path fill="#4285f4" d="M58 0H6C2.685 0 0 2.685 0 6v52h18V18h40z"/>
                        <path fill="#4285f4" d="M26.205 49.03c-1.495-1.01-2.53-2.485-3.095-4.435l3.47-1.43c.315 1.2.865 2.13 1.65 2.79.78.66 1.73.985 2.84.985 1.135 0 2.11-.345 2.925-1.035s1.225-1.57 1.225-2.635c0-1.09-.43-1.98-1.29-2.67-.86-.69-1.94-1.035-3.23-1.035h-2.005V36.13h1.8c1.11 0 2.045-.3 2.805-.9.76-.6 1.14-1.42 1.14-2.465 0-.93-.34-1.67-1.02-2.225-.68-.555-1.54-.835-2.585-.835-1.02 0-1.83.27-2.43.815a4.784 4.784 0 00-1.31 2.005l-3.435-1.43c.455-1.29 1.29-2.43 2.515-3.415 1.225-.985 2.79-1.48 4.69-1.48 1.405 0 2.67.27 3.79.815 1.12.545 2 1.3 2.635 2.26.635.965.95 2.045.95 3.245 0 1.225-.295 2.26-.885 3.11-.59.85-1.315 1.5-2.175 1.955v.205a6.605 6.605 0 012.79 2.175c.725.975 1.09 2.14 1.09 3.5 0 1.36-.345 2.575-1.035 3.64S36.38 49.01 35.17 49.62c-1.215.61-2.58.92-4.095.92-1.755.005-3.375-.5-4.87-1.51zM47.52 31.81l-3.81 2.755-1.905-2.89 6.835-4.93h2.62V50h-3.74z"/>
                      </svg>
                      <span className="text-xs sm:text-sm">Google Calendar</span>
                    </button>
                     <button
                      onClick={handleExportToApple}
                      className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
                    >
                      <AppleCalendarLogo className="w-6 h-6 sm:w-8 sm:h-8" />
                      <span className="text-xs sm:text-sm">Apple Calendar</span>
                    </button> 
                  </div>
                </div>
              )}

              {/* Botones para vista de solo lectura */}
              <div className="flex justify-end pt-3 sm:pt-4">
                <button type="button" onClick={onClose} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            // Vista de formulario para edición
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
              {/* Título de la Sesión - Sección destacada */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold">📝</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100">Información de la Sesión</h3>
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Título de la Sesión <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="title" 
                    id="title" 
                    value={formData.title || ''} 
                    onChange={handleChange} 
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base ${
                      !effectiveCanEdit 
                        ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-600' 
                        : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 hover:border-blue-400 focus:border-blue-500'
                    }`}
                    placeholder="Ingresa el título de la sesión..."
                  />
                </div>
              </div>
              
              {effectiveCanViewDetails && (
                <>
                  {/* Ponentes/Participantes - Sección mejorada */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm font-bold"></span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-purple-900 dark:text-purple-100">
                        Ponentes <span className="text-red-500">*</span>
                      </h3>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {/* Ponentes Seleccionados */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Seleccionados ({formData.speakers?.length || 0})
                        </h4>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 min-h-[60px] sm:min-h-[80px] border-2 border-dashed border-green-200 dark:border-green-800">
                          {formData.speakers && formData.speakers.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                              {formData.speakers.map(speaker => (
                                <div key={speaker.id} className="group flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 border border-green-200 dark:border-green-700 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    {speaker.photo && speaker.photo.trim() ? (
                                      <img 
                                        src={getSpeakerPhotoUrl(speaker.photo) || speaker.photo} 
                                        alt={speaker.name}
                                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                        onError={(e) => {
                                          // Si falla la imagen, mostrar inicial
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextElementSibling!.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold ${speaker.photo && speaker.photo.trim() ? 'hidden' : ''}`}>
                                      {speaker.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                      <span className="font-medium text-gray-900 dark:text-gray-100">{speaker.name}</span>
                                      {speaker.company && (
                                        <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                          {speaker.company && speaker.company.trim() && (
                                            <img 
                                              src={getCompanyLogoUrl(speaker.company)} 
                                              alt={`${speaker.company} logo`}
                                              className="w-3 h-3 sm:w-4 sm:h-4 object-contain"
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                              }}
                                            />
                                          )}
                                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{speaker.position}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleSpeakerToggle(speaker.id)}
                                    disabled={!effectiveCanEdit}
                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <XIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-14 sm:h-16 text-gray-500 dark:text-gray-400">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                                <span className="text-lg sm:text-xl">👥</span>
                              </div>
                              <p className="text-xs sm:text-sm font-medium">Ningún ponente seleccionado</p>
                              <p className="text-xs sm:text-sm">Selecciona ponentes de la lista de abajo</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ponentes Disponibles */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Disponibles
                        </h4>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 max-h-48 sm:max-h-64 overflow-y-auto">
                          {speakers
                            .filter(speaker => !formData.speakers?.some(s => s.id === speaker.id))
                            .map(speaker => (
                              <button
                                key={speaker.id}
                                type="button"
                                onClick={() => handleSpeakerToggle(speaker.id)}
                                disabled={!effectiveCanEdit}
                                className="w-full group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                              >
                                {speaker.photo && speaker.photo.trim() ? (
                                  <img 
                                    src={getSpeakerPhotoUrl(speaker.photo) || speaker.photo} 
                                    alt={speaker.name}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                    onError={(e) => {
                                      // Si falla la imagen, mostrar inicial
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling!.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold ${speaker.photo && speaker.photo.trim() ? 'hidden' : ''}`}>
                                  {speaker.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{speaker.name}</p>
                                  {speaker.position && (
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{speaker.position}</p>
                                  )}
                                  {speaker.company && (
                                    <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                      {speaker.company && speaker.company.trim() && (
                                        <img 
                                          src={getCompanyLogoUrl(speaker.company)} 
                                          alt={`${speaker.company} logo`}
                                          className="w-3 h-3 sm:w-4 sm:h-4 object-contain"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                          }}
                                        />
                                      )}
                                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{speaker.company}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity duration-200">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </div>
                              </button>
                            ))}
                          {speakers.filter(speaker => !formData.speakers?.some(s => s.id === speaker.id)).length === 0 && (
                            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                                <span className="text-lg sm:text-xl">✅</span>
                              </div>
                              <p className="text-sm sm:text-lg font-medium">Todos los ponentes han sido seleccionados</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalles Adicionales */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 sm:p-6 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm font-bold"></span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-amber-900 dark:text-amber-100">Detalles Adicionales</h3>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {/* Notas */}
                      <div>
                        <label htmlFor="notes" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Notas
                        </label>
                        <textarea 
                          name="notes" 
                          id="notes" 
                          value={formData.notes || ''} 
                          onChange={handleChange} 
                          rows={4} 
                          disabled={!effectiveCanEdit}
                          placeholder="Información adicional sobre la sesión, agenda, materiales necesarios, etc..." 
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none text-sm sm:text-base ${
                            !effectiveCanEdit 
                              ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-600' 
                              : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 hover:border-amber-400 focus:border-amber-500'
                          }`}
                        />
                      </div>

                      {/* Enlace de Zoom */}
                      <div>
                        <label htmlFor="zoomLink" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Enlace de Zoom
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input 
                            type="url" 
                            name="zoomLink" 
                            id="zoomLink" 
                            value={formData.zoomLink || ''} 
                            onChange={handleChange} 
                            disabled={!effectiveCanEdit}
                            placeholder="https://zoom.us/j/123456789"
                            className={`w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm sm:text-base ${
                              !effectiveCanEdit 
                                ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-600' 
                                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 hover:border-amber-400 focus:border-amber-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Programación */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 sm:p-6 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm font-bold">⏰</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-100">Programación</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label htmlFor="day" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Día <span className="text-red-500">*</span>
                        </label>
                        <select 
                          name="day" 
                          id="day" 
                          value={formData.day || ''} 
                          onChange={handleChange} 
                          disabled={!effectiveCanEdit}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base ${
                            !effectiveCanEdit 
                              ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-600 opacity-70' 
                              : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 hover:border-emerald-400 focus:border-emerald-500'
                          }`}
                        >
                          <option value="">Selecciona un día</option>
                          {DAYS.map(d => <option key={d} value={d}>{ConvertirFechaSinAno(d)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="time" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Hora <span className="text-red-500">*</span>
                        </label>
                        <select 
                          name="time" 
                          id="time" 
                          value={formData.time || ''} 
                          onChange={handleChange} 
                          disabled={!effectiveCanEdit}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base ${
                            !effectiveCanEdit 
                              ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-600 opacity-70' 
                              : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 hover:border-emerald-400 focus:border-emerald-500'
                          }`}
                        >
                          <option value="">Selecciona una hora</option>
                          {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Color de Línea Lateral - Solo para editores */}
                  {effectiveCanEdit && (
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-4 sm:p-6 border border-rose-200 dark:border-rose-800">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">🎨</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-rose-900 dark:text-rose-100">Personalización</h3>
                      </div>

                      <div>
                        <label htmlFor="borderColor" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Color de Línea Lateral
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                          <div className="relative">
                            <input 
                              type="color" 
                              name="borderColor" 
                              id="borderColor" 
                              value={formData.borderColor || '#6B7280'} 
                              onChange={handleChange}
                              disabled={!effectiveCanEdit}
                              className={`w-14 sm:w-16 h-10 sm:h-12 rounded-lg border-2 border-gray-300 cursor-pointer transition-all duration-200 hover:scale-105 text-sm sm:text-base ${
                                !effectiveCanEdit ? 'cursor-not-allowed opacity-50' : ''
                              }`}
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full border-2 border-gray-300 flex items-center justify-center">
                              <span className="text-xs">🎨</span>
                            </div>
                          </div>
                          <select
                            name="borderColor"
                            onChange={handleChange}
                            value={formData.borderColor || '#6B7280'}
                            disabled={!effectiveCanEdit}
                            className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-center text-sm sm:text-base ${
                              !effectiveCanEdit 
                                ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-600' 
                                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 hover:border-rose-400 focus:border-rose-500'
                            }`}
                          >
                            <option value="#8B5CF6">Púrpura</option>
                            <option value="#3B82F6">Azul</option>
                            <option value="#10B981">Verde</option>
                            <option value="#F59E0B">Naranja</option>
                            <option value="#EF4444">Rojo</option>
                            <option value="#EC4899">Rosa</option>
                            <option value="#8B5A00">Marrón</option>
                            <option value="#6B7280">Gris</option>
                            {!['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5A00', '#6B7280'].includes(formData.borderColor || '#6B7280') && (
                              <option value={formData.borderColor || '#6B7280'}>
                                Color personalizado
                              </option>
                            )}
                          </select>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                          <span>💡</span>
                          Selecciona un color predefinido o usa el selector personalizado
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Botones de Acción - Mejorados */}
              <div className="flex justify-between items-center pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 text-sm sm:text-base ${
                      effectiveCanEdit && effectiveCanViewDetails ? '' : 'w-full'
                    }`}
                  >
                    {effectiveCanEdit && effectiveCanViewDetails ? 'Cancelar' : 'Cerrar'}
                  </button>
                  {effectiveCanEdit && effectiveCanViewDetails && session?.id && (
                    <button 
                      type="button" 
                      onClick={handleDelete} 
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border-2 border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  )}
                </div>
                <div className="flex-grow"></div>
                {effectiveCanEdit && effectiveCanViewDetails && (
                  <button 
                    type="submit" 
                    className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg border-2 border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar
                  </button>
                )}
              </div>

              {/* Sección de Exportación - Mejorada */}
              {effectiveCanViewDetails && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-2 sm:p-3 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <span className="text-sm sm:text-base">📅</span>
                    Exportar a Calendario
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleExportToGoogle}
                      className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-400 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-red-500 transition-colors shadow-sm"
                    >
                      <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="-11.4 -19 98.8 114" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#fff" d="M58 18H18v40h40z"/>
                        <path fill="#ea4335" d="M58 76l18-18H58z"/>
                        <path fill="#fbbc04" d="M76 18H58v40h18z"/>
                        <path fill="#34a853" d="M58 58H18v18h40z"/>
                        <path fill="#188038" d="M0 58v12c0 3.315 2.685 6 6 6h12V58z"/>
                        <path fill="#1967d2" d="M76 18V6c0-3.315-2.685-6-6-6H58v18z"/>
                        <path fill="#4285f4" d="M58 0H6C2.685 0 0 2.685 0 6v52h18V18h40z"/>
                        <path fill="#4285f4" d="M26.205 49.03c-1.495-1.01-2.53-2.485-3.095-4.435l3.47-1.43c.315 1.2.865 2.13 1.65 2.79.78.66 1.73.985 2.84.985 1.135 0 2.11-.345 2.925-1.035s1.225-1.57 1.225-2.635c0-1.09-.43-1.98-1.29-2.67-.86-.69-1.94-1.035-3.23-1.035h-2.005V36.13h1.8c1.11 0 2.045-.3 2.805-.9.76-.6 1.14-1.42 1.14-2.465 0-.93-.34-1.67-1.02-2.225-.68-.555-1.54-.835-2.585-.835-1.02 0-1.83.27-2.43.815a4.784 4.784 0 00-1.31 2.005l-3.435-1.43c.455-1.29 1.29-2.43 2.515-3.415 1.225-.985 2.79-1.48 4.69-1.48 1.405 0 2.67.27 3.79.815 1.12.545 2 1.3 2.635 2.26.635.965.95 2.045.95 3.245 0 1.225-.295 2.26-.885 3.11-.59.85-1.315 1.5-2.175 1.955v.205a6.605 6.605 0 012.79 2.175c.725.975 1.09 2.14 1.09 3.5 0 1.36-.345 2.575-1.035 3.64S36.38 49.01 35.17 49.62c-1.215.61-2.58.92-4.095.92-1.755.005-3.375-.5-4.87-1.51zM47.52 31.81l-3.81 2.755-1.905-2.89 6.835-4.93h2.62V50h-3.74z"/>
                      </svg>
                      <span className="text-xs sm:text-sm">Google Calendar</span>
                    </button>
                     <button
                      onClick={handleExportToApple}
                      className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
                    >
                      <AppleCalendarLogo className="w-6 h-6 sm:w-8 sm:h-8" />
                      <span className="text-xs sm:text-sm">Apple Calendar</span>
                    </button> 
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
      
      <AlertaModal
        isOpen={alertaModal.isOpen}
        onClose={handleCloseAlerta}
        onConfirm={alertaModal.type === 'eliminar' ? handleConfirmDelete : undefined}
        type={alertaModal.type}
        title={alertaModal.title}
        message={alertaModal.message}
        camposFaltantes={alertaModal.camposFaltantes}
      />

      {/* Modal para enlaces cuando popup está bloqueado */}
      {linkModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {linkModal.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                No se pudo abrir el enlace en una nueva ventana. Puedes copiarlo y abrirlo manualmente:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <code className="text-sm break-all">{linkModal.url}</code>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(linkModal.url)}
                  className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copiar enlace
                </button>
                <button
                  onClick={() => setLinkModal({ isOpen: false, url: '', title: '' })}
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 text-sm sm:text-base font-medium rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditSessionModal;
