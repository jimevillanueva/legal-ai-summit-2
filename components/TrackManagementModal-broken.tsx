import React, { useState, useEffect } from 'react';
import type { Track } from '../types';
import { XIcon } from './icons';

interface TrackManagementModalProps {
  tracks: Track[];
  isOpen: boolean;
  onClose: () => void;
  onSaveTracks: (tracks: Track[]) => void;
}

const TrackManagementModal: React.FC<TrackManagementModalProps> = ({ 
  tracks, 
  isOpen, 
  onClose, 
  onSaveTracks 
}) => {
  const [editableTracks, setEditableTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (isOpen) {
      setEditableTracks([...tracks]);
    }
  }, [isOpen, tracks]);

  if (!isOpen) return null;

  const handleTrackChange = (index: number, field: keyof Track, value: string) => {
    const newTracks = [...editableTracks];
    newTracks[index] = { ...newTracks[index], [field]: value };
    setEditableTracks(newTracks);
  };

  const handleAddTrack = () => {
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: 'Nuevo Track',
      color: 'bg-blue-200 dark:bg-blue-800',
      textColor: 'text-blue-800 dark:text-blue-100'
    };
    setEditableTracks([...editableTracks, newTrack]);
  };

  const handleDeleteTrack = (index: number) => {
    const newTracks = editableTracks.filter((_, i) => i !== index);
    setEditableTracks(newTracks);
  };

  const handleSave = () => {
    onSaveTracks(editableTracks);
    onClose();
  };

  const predefinedColors = [
    { bg: 'bg-blue-200 dark:bg-blue-800', text: 'text-blue-800 dark:text-blue-100', name: 'Azul', hex: '#3B82F6' },
    { bg: 'bg-green-200 dark:bg-green-800', text: 'text-green-800 dark:text-green-100', name: 'Verde', hex: '#10B981' },
    { bg: 'bg-purple-200 dark:bg-purple-800', text: 'text-purple-800 dark:text-purple-100', name: 'Púrpura', hex: '#8B5CF6' },
    { bg: 'bg-red-200 dark:bg-red-800', text: 'text-red-800 dark:text-red-100', name: 'Rojo', hex: '#EF4444' },
    { bg: 'bg-orange-200 dark:bg-orange-800', text: 'text-orange-800 dark:text-orange-100', name: 'Naranja', hex: '#F59E0B' },
    { bg: 'bg-pink-200 dark:bg-pink-800', text: 'text-pink-800 dark:text-pink-100', name: 'Rosa', hex: '#EC4899' },
    { bg: 'bg-indigo-200 dark:bg-indigo-800', text: 'text-indigo-800 dark:text-indigo-100', name: 'Índigo', hex: '#6366F1' },
    { bg: 'bg-gray-200 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-100', name: 'Gris', hex: '#6B7280' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-100">Gestionar Tracks</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>

        <div className="space-y-2">
          {editableTracks.map((track, index) => (
            <div key={track.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-3 transition-all">
              <div className="flex items-center space-x-3">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={track.name}
                    onChange={(e) => handleTrackChange(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-md font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Nombre del track"
                  />
                </div>

                <div className="w-28">
                  <select
                    value={predefinedColors.find(c => c.bg === track.color)?.hex || track.color}
                    onChange={(e) => {
                      const selectedColor = predefinedColors.find(c => c.hex === e.target.value);
                      if (selectedColor) {
                        handleTrackChange(index, 'color', selectedColor.bg);
                        handleTrackChange(index, 'textColor', selectedColor.text);
                      }
                    }}
                    className="w-full p-2 text-xs border border-gray-200 rounded-md bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 focus:border-blue-500"
                  >
                    {predefinedColors.map((color) => (
                      <option key={color.hex} value={color.hex}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-20">
                  <div 
                    className="px-2 py-1 rounded-md text-center text-xs font-medium text-white shadow-sm"
                    style={{ 
                      backgroundColor: (() => {
                        const colorMatch = predefinedColors.find(c => c.bg === track.color);
                        const finalColor = colorMatch ? colorMatch.hex : '#6B7280';
                        console.log('Track:', track.name, 'Color:', track.color, 'Final:', finalColor);
                        return finalColor;
                      })()
                    }}
                  >
                    {track.name.split(' ')[0] || 'Track'}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTrack(index)}
                  className="w-7 h-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  title="Eliminar track"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleAddTrack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Agregar Track
          </button>
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackManagementModal;