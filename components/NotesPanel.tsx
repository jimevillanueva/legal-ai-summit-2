import React, { useState, useEffect } from 'react';
import { cleanNamesWithAI } from '../utils/aiService';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/db';

interface Speaker {
  id: string;
  name: string;
  completed: boolean;
  createdAt: number;
}

interface NotesPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  schedule: any;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ isOpen, onToggle, schedule }) => {
  const [notes, setNotes] = useState<string>('');
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [newSpeaker, setNewSpeaker] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'notes' | 'speakers'>('notes');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [rawNames, setRawNames] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedNames, setProcessedNames] = useState<string[]>([]);
  
  const { isAdmin, canEdit } = useAuth();

  // Cargar datos de la base de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar notas
        const savedNotes = await db.loadNotes();
        setNotes(savedNotes);
        
        // Solo cargar ponentes si es admin
        if (isAdmin) {
          const savedSpeakers = await db.loadSpeakers();
          setSpeakers(savedSpeakers.map(s => ({ ...s, completed: false, createdAt: Date.now() })));
        }
      } catch (error) {
        console.error('Error loading data from database:', error);
      }
    };
    
    loadData();
  }, [isAdmin]);

  // Guardar notas automáticamente
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        await db.saveNotes(notes);
      } catch (error) {
        console.error('Error saving notes to database:', error);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [notes]);

  // Guardar ponentes automáticamente (solo si es admin)
  useEffect(() => {
    if (isAdmin) {
      const saveSpeakers = async () => {
        try {
          await db.saveSpeakers(speakers);
        } catch (error) {
          console.error('Error saving speakers to database:', error);
        }
      };
      saveSpeakers();
    }
  }, [speakers, isAdmin]);

  const handleClear = () => {
    if (activeTab === 'notes') {
      if (window.confirm('¿Estás seguro de que quieres borrar todas las notas?')) {
        setNotes('');
      }
    } else {
      if (window.confirm('¿Estás seguro de que quieres borrar todos los ponentes?')) {
        setSpeakers([]);
      }
    }
  };

  const addSpeaker = () => {
    if (!isAdmin) return;
    
    if (newSpeaker.trim()) {
      const speaker: Speaker = {
        id: `speaker-${Date.now()}`,
        name: newSpeaker.trim(),
        completed: false,
        createdAt: Date.now()
      };
      setSpeakers([...speakers, speaker]);
      setNewSpeaker('');
    }
  };

  const toggleSpeaker = (speakerId: string) => {
    if (!isAdmin) return;
    
    setSpeakers(speakers.map(speaker => 
      speaker.id === speakerId 
        ? { ...speaker, completed: !speaker.completed }
        : speaker
    ));
  };

  const deleteSpeaker = (speakerId: string) => {
    if (!isAdmin) return;
    
    setSpeakers(speakers.filter(speaker => speaker.id !== speakerId));
  };

  const completedCount = speakers.filter(s => s.completed).length;

  // AI Assistant para limpiar nombres (solo admins)
  const processNamesWithAI = async () => {
    if (!isAdmin) return;
    
    setIsProcessing(true);
    setProcessedNames([]);
    
    try {
      const result = await cleanNamesWithAI(rawNames);
      
      if (result.success) {
        setProcessedNames(result.cleanedNames);
      } else {
        alert(`Error al procesar nombres: ${result.error}`);
      }
    } catch (error) {
      console.error('Error procesando nombres:', error);
      alert('Error al conectar con el servicio de IA');
    } finally {
      setIsProcessing(false);
    }
  };

  const importProcessedNames = () => {
    if (!isAdmin) return;
    
    const newSpeakers = processedNames.map(name => ({
      id: `speaker-${Date.now()}-${Math.random()}`,
      name,
      completed: false,
      createdAt: Date.now()
    }));
    
    setSpeakers([...speakers, ...newSpeakers]);
    setIsAIModalOpen(false);
    setRawNames('');
    setProcessedNames([]);
  };

  return (
    <>
      {/* Botón para abrir/cerrar panel */}
      <button
        onClick={onToggle}
        className={`fixed right-4 top-1/2 -translate-y-1/2 w-12 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-l-lg shadow-lg transition-all z-30 ${
          isOpen ? 'right-80' : 'right-4'
        }`}
        title={isOpen ? 'Cerrar notas' : 'Abrir notas'}
      >
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs">📝</span>
          <span className="text-xs font-medium writing-mode-vertical">
            {isOpen ? '→' : '←'}
          </span>
        </div>
      </button>

      {/* Panel de notas */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-20 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header del panel con tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: '#0F1BF7' }}>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {activeTab === 'notes' ? '📝 Notas' : '👥 Ponentes'}
                </h3>
                <button
                  onClick={onToggle}
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Cerrar panel"
                >
                  ✕
                </button>
              </div>
              
              {/* Tabs - Solo mostrar ponentes si es admin */}
              <div className="flex space-x-1 mt-3">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeTab === 'notes'
                      ? 'bg-white text-blue-700'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  📝 Notas
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('speakers')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      activeTab === 'speakers'
                        ? 'bg-white text-blue-700'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                    }`}
                  >
                    👥 Ponentes {speakers.length > 0 && `(${completedCount}/${speakers.length})`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contenido según tab activo */}
          <div className="flex-1 flex flex-col">
            {activeTab === 'notes' ? (
              <div className="flex-1 p-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escribe tus notas aquí...

• Recordatorios importantes
• Contactos de ponentes
• Notas de organización
• Comentarios del evento"
                  className="w-full h-full resize-none border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                />
              </div>
            ) : (
              <div className="flex-1 p-4 flex flex-col">
                {/* Verificar permisos */}
                {!isAdmin ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-4">🔒</div>
                      <p className="text-sm font-medium">Acceso restringido</p>
                      <p className="text-xs mt-1">Solo los administradores pueden gestionar ponentes</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Input para nuevo ponente */}
                    <div className="mb-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newSpeaker}
                          onChange={(e) => setNewSpeaker(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSpeaker()}
                          placeholder="Agregar nuevo ponente..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={addSpeaker}
                          disabled={!newSpeaker.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          ➕
                        </button>
                      </div>
                      
                      {/* Botón AI Assistant */}
                      <button
                        onClick={() => setIsAIModalOpen(true)}
                        className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium"
                      >
                        🤖 Importar con IA
                      </button>
                    </div>

                    {/* Lista de ponentes */}
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {speakers.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                          <p className="text-sm">Sin ponentes en la lista</p>
                          <p className="text-xs mt-1">Agrega el primer ponente arriba</p>
                        </div>
                      ) : (
                        speakers.map((speaker) => (
                          <div
                            key={speaker.id}
                            className={`group flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                              speaker.completed
                                ? 'bg-green-50 border-green-200 opacity-75'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <button
                              onClick={() => toggleSpeaker(speaker.id)}
                              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                speaker.completed
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-blue-500'
                              }`}
                            >
                              {speaker.completed && '✓'}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${
                                speaker.completed
                                  ? 'line-through text-gray-500'
                                  : 'text-gray-900'
                              }`}>
                                {speaker.name}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteSpeaker(speaker.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-sm"
                              title="Eliminar ponente"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer con acciones */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {activeTab === 'notes' 
                  ? (notes.length > 0 ? `${notes.length} caracteres` : 'Sin notas')
                  : isAdmin 
                    ? `${speakers.length} ponentes (${completedCount} confirmados)`
                    : 'Acceso restringido'
                }
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(
                    activeTab === 'notes' 
                      ? notes 
                      : speakers.map(s => `${s.completed ? '☑️' : '☐'} ${s.name}`).join('\n')
                  )}
                  className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  disabled={activeTab === 'notes' ? !notes : !isAdmin || speakers.length === 0}
                >
                  📋 Copiar
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  disabled={activeTab === 'notes' ? !notes : !isAdmin || speakers.length === 0}
                >
                  🗑️ Borrar
                </button>
              </div>
            </div>
            <div className="text-xs text-green-600 mt-1">
              💾 Guardado automático
            </div>
          </div>
        </div>
      </div>

      {/* Modal de AI Assistant - Solo para admins */}
      {isAIModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">🤖 Asistente IA - Limpiar Nombres</h3>
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-purple-100 text-sm mt-2">
                Pega una lista de nombres y la IA los limpiará, formateará y agregará títulos profesionales
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Área de entrada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Pega los nombres aquí:
                </label>
                <textarea
                  value={rawNames}
                  onChange={(e) => setRawNames(e.target.value)}
                  placeholder="Ejemplos de formato soportado:

1. Juan Pérez - juan@email.com - 555-1234
2. MARIA GONZALEZ
3. carlos rodriguez abogado
4. Ana Martinez, Doctora
luis fernandez - +52 123 456 7890
Elena Jimenez PhD"
                  rows={8}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Procesamiento */}
              {(isProcessing || processedNames.length > 0) && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🧠 Resultados del Procesamiento IA:</h4>
                  
                  {isProcessing ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-sm text-gray-600">Analizando y limpiando nombres...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {processedNames.map((name, idx) => (
                        <div key={idx} className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded">
                          <span className="text-green-600">✓</span>
                          <span className="text-sm font-medium">{name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
              <button
                onClick={() => setIsAIModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={processNamesWithAI}
                  disabled={!rawNames.trim() || isProcessing}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? '🤖 Procesando...' : '🧠 Procesar con IA'}
                </button>
                {processedNames.length > 0 && (
                  <button
                    onClick={importProcessedNames}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    📥 Importar {processedNames.length} nombres
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotesPanel;