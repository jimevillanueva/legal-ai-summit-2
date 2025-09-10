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
    { bg: 'bg-blue-200 dark:bg-blue-800', text: 'text-blue-800 dark:text-blue-100', name: 'Azul' },
    { bg: 'bg-green-200 dark:bg-green-800', text: 'text-green-800 dark:text-green-100', name: 'Verde' },
    { bg: 'bg-purple-200 dark:bg-purple-800', text: 'text-purple-800 dark:text-purple-100', name: 'Púrpura' },
    { bg: 'bg-red-200 dark:bg-red-800', text: 'text-red-800 dark:text-red-100', name: 'Rojo' },
    { bg: 'bg-yellow-200 dark:bg-yellow-800', text: 'text-yellow-800 dark:text-yellow-100', name: 'Amarillo' },
    { bg: 'bg-pink-200 dark:bg-pink-800', text: 'text-pink-800 dark:text-pink-100', name: 'Rosa' },
    { bg: 'bg-indigo-200 dark:bg-indigo-800', text: 'text-indigo-800 dark:text-indigo-100', name: 'Índigo' },
    { bg: 'bg-gray-200 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-100', name: 'Gris' },
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

        <div className="space-y-3">
          {editableTracks.map((track, index) => (
            <div key={track.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={track.name}
                    onChange={(e) => handleTrackChange(index, 'name', e.target.value)}
                    className="w-full p-2 border-0 bg-transparent font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
                    placeholder="Nombre del track"
                  />
                </div>

                <div className="w-32">
                  <select
                    value={track.color}
                    onChange={(e) => {
                      const selectedColor = predefinedColors.find(c => c.bg === e.target.value);
                      if (selectedColor) {
                        handleTrackChange(index, 'color', selectedColor.bg);
                        handleTrackChange(index, 'textColor', selectedColor.text);
                      }
                    }}
                    className="w-full p-2 text-sm border border-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                  >
                    {predefinedColors.map((color) => (
                      <option key={color.bg} value={color.bg}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <div className={`px-3 py-2 rounded-full text-center text-sm ${track.color} ${track.textColor}`}>
                    {track.name || 'Preview'}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTrack(index)}
                  className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
                  title="Eliminar track"
                >
                  ×
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