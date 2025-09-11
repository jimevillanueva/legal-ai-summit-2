import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface SpeakerCheck {
  id: string;
  name: string;
  sessions: string[];
  status: 'complete' | 'incomplete' | 'conflict';
  suggestions: string[];
}

interface NotesPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  schedule: any; // Schedule data for AI analysis
}

const NotesPanel: React.FC<NotesPanelProps> = ({ isOpen, onToggle, schedule }) => {
  const [notes, setNotes] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'notes' | 'speakers'>('notes');
  const [speakerAnalysis, setSpeakerAnalysis] = useState<SpeakerCheck[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Cargar datos del localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('eventNotes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
    
    const savedTasks = localStorage.getItem('eventTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Guardar notas automáticamente
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('eventNotes', notes);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [notes]);

  // Guardar tareas automáticamente
  useEffect(() => {
    localStorage.setItem('eventTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleClear = () => {
    if (activeTab === 'notes') {
      if (window.confirm('¿Estás seguro de que quieres borrar todas las notas?')) {
        setNotes('');
      }
    } else {
      if (window.confirm('¿Estás seguro de que quieres borrar todas las tareas?')) {
        setTasks([]);
      }
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: `task-${Date.now()}`,
        text: newTask.trim(),
        completed: false,
        createdAt: Date.now()
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  // AI Agent para analizar ponentes
  const analyzeSpeakers = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const allSessions = Object.values(schedule)
        .flatMap(day => Object.values(day))
        .flat();
      
      const speakersMap = new Map<string, SpeakerCheck>();
      
      // Analizar todos los ponentes
      allSessions.forEach((session: any) => {
        session.speakers?.forEach((speaker: any) => {
          if (!speakersMap.has(speaker.name)) {
            speakersMap.set(speaker.name, {
              id: speaker.id,
              name: speaker.name,
              sessions: [],
              status: 'incomplete',
              suggestions: []
            });
          }
          speakersMap.get(speaker.name)!.sessions.push(session.title);
        });
      });

      // AI Analysis Logic
      const analysis = Array.from(speakersMap.values()).map(speaker => {
        const suggestions = [];
        
        // Verificar información completa
        if (speaker.name.split(' ').length < 2) {
          suggestions.push('⚠️ Nombre incompleto - agregar apellido');
        }
        
        if (!speaker.name.includes('Dr.') && !speaker.name.includes('Lic.') && !speaker.name.includes('Mg.')) {
          suggestions.push('🎓 Considerar agregar título profesional');
        }
        
        // Verificar carga de trabajo
        if (speaker.sessions.length > 3) {
          suggestions.push('📊 Ponente con muchas sesiones - verificar disponibilidad');
        } else if (speaker.sessions.length === 1) {
          suggestions.push('💡 Ponente con una sesión - oportunidad para más participación');
        }
        
        // Determinar estado
        let status: 'complete' | 'incomplete' | 'conflict' = 'complete';
        if (suggestions.length > 2) status = 'incomplete';
        if (speaker.sessions.length > 4) status = 'conflict';
        
        return { ...speaker, status, suggestions };
      });

      setSpeakerAnalysis(analysis);
      setIsAnalyzing(false);
    }, 2000); // Simular análisis AI
  };

  // Auto-analizar cuando cambie el schedule
  useEffect(() => {
    if (activeTab === 'speakers' && schedule) {
      analyzeSpeakers();
    }
  }, [schedule, activeTab]);

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
                  {activeTab === 'notes' ? '📝 Notas' : '✅ Tareas'}
                </h3>
                <button
                  onClick={onToggle}
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Cerrar panel"
                >
                  ✕
                </button>
              </div>
              
              {/* Tabs */}
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
                <button
                  onClick={() => setActiveTab('speakers')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeTab === 'speakers'
                      ? 'bg-white text-blue-700'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  🤖 AI Ponentes {speakerAnalysis.length > 0 && `(${speakerAnalysis.filter(s => s.status === 'complete').length}/${speakerAnalysis.length})`}
                </button>
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
                {/* Header del AI Agent */}
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-blue-900">🤖 Análisis AI de Ponentes</h4>
                    <button
                      onClick={analyzeSpeakers}
                      disabled={isAnalyzing}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isAnalyzing ? '🔄 Analizando...' : '🔍 Re-analizar'}
                    </button>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Revisión automática de información de ponentes y sugerencias de mejora
                  </p>
                </div>

                {/* Análisis de ponentes */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {isAnalyzing ? (
                    <div className="text-center text-gray-500 mt-8">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-sm">Analizando ponentes con IA...</p>
                      <p className="text-xs mt-1">Revisando información y detectando problemas</p>
                    </div>
                  ) : speakerAnalysis.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <p className="text-sm">Sin ponentes para analizar</p>
                      <p className="text-xs mt-1">Agrega ponentes a las sesiones para comenzar</p>
                    </div>
                  ) : (
                    speakerAnalysis.map((speaker) => (
                      <div
                        key={speaker.id}
                        className={`p-3 rounded-lg border transition-all ${
                          speaker.status === 'complete'
                            ? 'bg-green-50 border-green-200'
                            : speaker.status === 'conflict' 
                            ? 'bg-red-50 border-red-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${
                                speaker.status === 'complete' ? 'bg-green-500' :
                                speaker.status === 'conflict' ? 'bg-red-500' : 'bg-yellow-500'
                              }`}></span>
                              <h5 className="font-medium text-gray-900">{speaker.name}</h5>
                            </div>
                            
                            <p className="text-xs text-gray-600 mt-1">
                              {speaker.sessions.length} sesión{speaker.sessions.length !== 1 ? 'es' : ''}
                            </p>
                            
                            {speaker.suggestions.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {speaker.suggestions.map((suggestion, idx) => (
                                  <p key={idx} className="text-xs text-gray-700 bg-white bg-opacity-60 px-2 py-1 rounded">
                                    {suggestion}
                                  </p>
                                ))}
                              </div>
                            )}
                            
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 font-medium">Sesiones:</p>
                              <div className="text-xs text-gray-600 space-y-1">
                                {speaker.sessions.slice(0, 3).map((session, idx) => (
                                  <p key={idx}>• {session}</p>
                                ))}
                                {speaker.sessions.length > 3 && (
                                  <p className="italic">+{speaker.sessions.length - 3} más...</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            speaker.status === 'complete' ? 'bg-green-100 text-green-700' :
                            speaker.status === 'conflict' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {speaker.status === 'complete' ? '✅ OK' :
                             speaker.status === 'conflict' ? '⚠️ Conflicto' : '📝 Revisar'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer con acciones */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {activeTab === 'notes' 
                  ? (notes.length > 0 ? `${notes.length} caracteres` : 'Sin notas')
                  : `${speakerAnalysis.length} ponentes analizados`
                }
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(
                    activeTab === 'notes' 
                      ? notes 
                      : tasks.map(t => `${t.completed ? '☑️' : '☐'} ${t.text}`).join('\n')
                  )}
                  className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  disabled={activeTab === 'notes' ? !notes : tasks.length === 0}
                >
                  📋 Copiar
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  disabled={activeTab === 'notes' ? !notes : tasks.length === 0}
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
    </>
  );
};

export default NotesPanel;