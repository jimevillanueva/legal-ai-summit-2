import React, { useState, useEffect } from 'react';
import type { Session, Speaker, Track } from '../types';
import { SessionStatus } from '../types';
import { DAYS, TIMES } from '../constants';
import { XIcon } from './icons';

interface EditSessionModalProps {
  session: Session | null;
  tracks: Track[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Session) => void;
  onDelete: (sessionId: string) => void;
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({ session, tracks, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Session>>({});
  const [speakersText, setSpeakersText] = useState('');

  useEffect(() => {
    if (session) {
      setFormData(session);
      setSpeakersText(session.speakers?.map(s => s.name).join(', ') || '');
    } else {
      setFormData({});
      setSpeakersText('');
    }
  }, [session]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSpeakersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSpeakersText(value);
    
    // Convert text to Speaker objects
    const speakers: Speaker[] = value
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map((name, index) => ({
        id: `speaker-${Date.now()}-${index}`,
        name
      }));
    
    setFormData(prev => ({ ...prev, speakers }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.trackId && formData.speakers && formData.day && formData.time && formData.room) {
      const payload: Session = {
        ...(formData as Session),
        status: SessionStatus.CONFIRMED,
      };
      onSave(payload);
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
          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-100">{session?.id ? 'Editar Sesión' : 'Agregar Sesión'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título de la Sesión</label>
            <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          
          <div>
            <label htmlFor="speakers" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ponentes/Participantes
              <span className="text-xs text-gray-500 ml-2">(separados por comas)</span>
            </label>
            <textarea 
              name="speakers" 
              id="speakers" 
              value={speakersText} 
              onChange={handleSpeakersChange} 
              required 
              rows={3}
              placeholder="Dr. María González, Lic. Carlos Rodríguez, Dra. Ana Martínez"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
            />
            <p className="text-xs text-gray-500 mt-1">Escribe los nombres completos separados por comas</p>
          </div>

          <div>
            <label htmlFor="zoomLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enlace de Zoom (opcional)</label>
            <input 
              type="url" 
              name="zoomLink" 
              id="zoomLink" 
              value={formData.zoomLink || ''} 
              onChange={handleChange} 
              placeholder="https://zoom.us/j/123456789"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="trackId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Track</label>
              <select name="trackId" id="trackId" value={formData.trackId || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                <option value="">Selecciona un track</option>
                {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sala</label>
              <input type="text" name="room" id="room" value={formData.room || ''} onChange={handleChange} required placeholder="Sala Conferencias 1" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
          </div>
          
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
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas (opcional)</label>
            <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} placeholder="Información adicional sobre la sesión..." className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>

          {/* Sección de exportación */}
          {session?.id && (
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
            {session?.id && (
              <button type="button" onClick={handleDelete} className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
                Eliminar
              </button>
            )}
            <div className="flex-grow"></div>
            <button type="button" onClick={onClose} className="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              Cancelar
            </button>
            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSessionModal;
