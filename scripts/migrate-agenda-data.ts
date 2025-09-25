import 'dotenv/config';
import { agendaData } from '../Data/agendaData';
import { event_SpeakerService } from '../services/Event_speakersService';
import { sesionService } from '../services/sesionService';
import { speaker_SesionService } from '../services/Speaker_SesionService';

// Mapeo de días a fechas específicas (2025)
const dayDateMapping: { [key: string]: string } = {
  'monday': '2025-09-29',
  'tuesday': '2025-09-30', 
  'wednesday': '2025-10-01',
  'thursday': '2025-10-02',
  'friday': '2025-10-03'
};

// Mapeo de colores por día
const colorMapping: { [key: string]: string } = {
  'monday': '#3B82F6', // azul
  'tuesday': '#10B981', // verde
  'wednesday': '#F59E0B', // amarillo
  'thursday': '#EF4444', // rojo
  'friday': '#8B5CF6' // púrpura
};

// Función para convertir hora 12h a 24h (formato simple, sin cero inicial)
function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '0';
  }
  
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  
  // Remover cero inicial para que coincida con constants.ts
  return `${parseInt(hours, 10)}:${minutes}`;
}

// Función para buscar speaker por nombre (fuzzy match)
function findSpeakerByName(speakers: any[], name: string): any | null {
  // Primero intentar match exacto
  let speaker = speakers.find(s => s.name.toLowerCase() === name.toLowerCase());
  
  if (speaker) return speaker;
  
  // Si no hay match exacto, intentar match parcial
  speaker = speakers.find(s => 
    s.name.toLowerCase().includes(name.toLowerCase()) || 
    name.toLowerCase().includes(s.name.toLowerCase())
  );
  
  if (speaker) return speaker;
  
  // Si aún no hay match, intentar match por palabras clave
  const nameWords = name.toLowerCase().split(' ').filter(word => word.length > 2);
  speaker = speakers.find(s => {
    const speakerWords = s.name.toLowerCase().split(' ').filter(word => word.length > 2);
    return nameWords.some(word => speakerWords.some(speakerWord => 
      speakerWord.includes(word) || word.includes(speakerWord)
    ));
  });
  
  return speaker || null;
}

async function migrateAgendaData() {
  try {
    console.log('🚀 Iniciando migración de datos de agenda...');
    
    // 1. Obtener todos los speakers existentes usando el servicio
    console.log(' Obteniendo speakers existentes de la base de datos...');
    const existingSpeakers = await event_SpeakerService.getAllEvent_Speakers();
    
    if (!existingSpeakers || existingSpeakers.length === 0) {
      throw new Error('No se encontraron speakers en la base de datos. Por favor, carga los speakers primero.');
    }
    
    console.log(`✅ Encontrados ${existingSpeakers.length} speakers en la base de datos`);
    
    // Limpiar datos existentes de sesiones y relaciones usando los servicios
    console.log(' Limpiando sesiones y relaciones existentes...');
    
    // Obtener todas las sesiones existentes para eliminar sus relaciones
    const existingSessions = await sesionService.getAllSesions();
    for (const session of existingSessions) {
      await speaker_SesionService.deleteSpeakerSessionsBySessionId(session.id);
    }
    
    // Eliminar todas las sesiones
    for (const session of existingSessions) {
      await sesionService.deleteSesion(session);
    }
    
    // 2. Crear sesiones usando el servicio
    console.log('📅 Procesando sesiones...');
    const sessionsToCreate = [];
    
    for (const day of agendaData) {
      const dayDate = dayDateMapping[day.id];
      if (!dayDate) {
        console.warn(`⚠️  Día no encontrado en mapeo: ${day.id}`);
        continue;
      }
      
      for (const session of day.sessions) {
        if (session.isBreak) {
          // Saltar breaks
          continue;
        }
        
        // Convertir hora a formato 24h simple (sin cero inicial)
        const time24 = convertTo24Hour(session.timeSlot);
        
        console.log(` Procesando: ${session.topic} - ${session.timeSlot} -> ${time24} - ${dayDate}`);
        
        sessionsToCreate.push({
          title: session.topic,
          description: session.speakerDescription || '',
          link: '', // No disponible en los datos
          color: colorMapping[day.id] || '#6B7280',
          time: time24, // Formato simple: "8:00", "9:00", etc.
          day: dayDate // Solo la fecha: "2025-09-29"
        });
      }
    }
    
    // Crear sesiones usando el servicio
    const createdSessions = [];
    for (const sessionData of sessionsToCreate) {
      const createdSession = await sesionService.createSesion(sessionData);
      createdSessions.push(createdSession);
    }
    
    console.log(`✅ Insertadas ${createdSessions.length} sesiones`);
    
    // 3. Crear relaciones speaker-sesión usando el servicio
    console.log(' Creando relaciones speaker-sesión...');
    
    let sessionIndex = 0;
    const createdRelations = new Set(); // Para evitar duplicados
    
    for (const day of agendaData) {
      for (const session of day.sessions) {
        if (session.isBreak) {
          continue;
        }
        
        const currentSession = createdSessions[sessionIndex];
        if (!currentSession) {
          sessionIndex++;
          continue;
        }
        
        // Crear un Set para evitar duplicados en esta sesión
        const sessionSpeakers = new Set();
        
        // Buscar speaker principal
        if (session.speakerName && session.speakerName !== 'BREAK') {
          const mainSpeaker = findSpeakerByName(existingSpeakers, session.speakerName);
          if (mainSpeaker) {
            const relationKey = `${currentSession.id}-${mainSpeaker.id}`;
            if (!createdRelations.has(relationKey)) {
              await speaker_SesionService.createSpeaker_Sesion({
                session_id: currentSession.id,
                speaker_id: mainSpeaker.id
              });
              createdRelations.add(relationKey);
              sessionSpeakers.add(mainSpeaker.id);
              console.log(`✅ Relación creada: ${mainSpeaker.name} -> ${session.topic}`);
            }
          } else {
            console.warn(`⚠️  Speaker no encontrado: ${session.speakerName}`);
          }
        }
        
        // Buscar speakers adicionales
        if (session.speakers) {
          for (const speaker of session.speakers) {
            const foundSpeaker = findSpeakerByName(existingSpeakers, speaker.speakerName);
            if (foundSpeaker) {
              // Verificar que no sea el mismo speaker principal
              if (!sessionSpeakers.has(foundSpeaker.id)) {
                const relationKey = `${currentSession.id}-${foundSpeaker.id}`;
                if (!createdRelations.has(relationKey)) {
                  await speaker_SesionService.createSpeaker_Sesion({
                    session_id: currentSession.id,
                    speaker_id: foundSpeaker.id
                  });
                  createdRelations.add(relationKey);
                  sessionSpeakers.add(foundSpeaker.id);
                  console.log(`✅ Relación creada: ${foundSpeaker.name} -> ${session.topic}`);
                }
              }
            } else {
              console.warn(`⚠️  Speaker adicional no encontrado: ${speaker.speakerName}`);
            }
          }
        }
        
        sessionIndex++;
      }
    }
    
    console.log('🎉 Migración completada exitosamente!');
    console.log(` Resumen:`);
    console.log(`   - ${existingSpeakers.length} speakers existentes`);
    console.log(`   - ${createdSessions.length} sesiones creadas`);
    console.log(`   - ${createdRelations.size} relaciones únicas creadas`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

migrateAgendaData();
