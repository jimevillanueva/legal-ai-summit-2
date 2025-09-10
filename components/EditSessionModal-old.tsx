import React, { useState, useEffect } from 'react';
import type { Session, Speaker } from '../types';
import { SessionStatus } from '../types';
import { TRACKS, SPEAKERS, DAYS, TIMES } from '../constants';
import { XIcon } from './icons';

interface EditSessionModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Session) => void;
  onDelete: (sessionId: string) => void;
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({ session, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Session>>({});

  useEffect(() => {
    setFormData(session || {});
  }, [session]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    // FIX: Use e.currentTarget for better type inference on form elements.
    const { name, value } = e.currentTarget;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSpeakerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    const selectedSpeakers = SPEAKERS.filter(s => selectedIds.includes(s.id));
    setFormData(prev => ({ ...prev, speakers: selectedSpeakers }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.trackId && formData.speakers && formData.day && formData.time && formData.room && formData.status) {
      onSave(formData as Session);
    } else {
      alert('Please fill all required fields.');
    }
  };
  
  const handleDelete = () => {
      if (session && window.confirm('Are you sure you want to delete this session?')) {
          onDelete(session.id);
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{session?.id ? 'Edit Session' : 'Add Session'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="speakers" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Speakers</label>
            <select multiple name="speakers" id="speakers" value={formData.speakers?.map(s => s.id) || []} onChange={handleSpeakerChange} required className="mt-1 block w-full h-32 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              {SPEAKERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="trackId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Track</label>
              <select name="trackId" id="trackId" value={formData.trackId || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <option value="">Select a track</option>
                {TRACKS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room</label>
              <input type="text" name="room" id="room" value={formData.room || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Day</label>
              <select name="day" id="day" value={formData.day || ''} onChange={handleChange} disabled className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm opacity-70">
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
              <select name="time" id="time" value={formData.time || ''} onChange={handleChange} disabled className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm opacity-70">
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select name="status" id="status" value={formData.status || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                {Object.values(SessionStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>

          <div className="flex justify-between pt-4">
            {session?.id && (
                 <button type="button" onClick={handleDelete} className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
                    Delete
                </button>
            )}
            <div className="flex-grow"></div>
            <button type="button" onClick={onClose} className="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
              Cancel
            </button>
            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSessionModal;
