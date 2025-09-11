// AI Service para limpiar nombres usando Google Gemini

interface AICleaningResult {
  success: boolean;
  cleanedNames: string[];
  error?: string;
}

export const cleanNamesWithAI = async (rawNames: string): Promise<AICleaningResult> => {
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!openaiApiKey || openaiApiKey === 'PLACEHOLDER_API_KEY') {
    // Fallback a procesamiento local si no hay API key
    return processNamesLocally(rawNames);
  }

  try {
    const prompt = `Eres un asistente especializado en limpiar y formatear nombres de ponentes para un evento profesional de IA Legal.

TAREA: Limpia y formatea esta lista de nombres:
"""
${rawNames}
"""

REGLAS:
1. Remueve emails, teléfonos, números de lista, texto extra
2. Capitaliza nombres apropiadamente (Juan Carlos Pérez)
3. Preserva "de", "del", "la" en minúsculas
4. Agrega título profesional apropiado:
   - "Dr." para nombres con 3+ palabras o títulos académicos
   - "Dra." para nombres femeninos con 3+ palabras  
   - "Lic." para otros casos
5. Detecta género para título correcto
6. Solo responde con la lista limpia, un nombre por línea
7. No incluyas explicaciones, numeración, ni texto adicional

RESPONDE SOLO CON LOS NOMBRES LIMPIOS:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    
    const cleanedNames = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 5 && 
                    !line.startsWith('```') && 
                    !line.includes('responde') && 
                    !line.includes('formato') &&
                    line.includes(' ') // Debe tener al menos un espacio (nombre + apellido)
              );

    return {
      success: true,
      cleanedNames
    };

  } catch (error) {
    console.error('OpenAI error, using local fallback:', error);
    return processNamesLocally(rawNames);
  }
};

// Fallback local processing
const processNamesLocally = (rawNames: string): AICleaningResult => {
  const lines = rawNames.split('\n').filter(line => line.trim());
  const cleaned = lines.map(line => {
    let cleaned = line.trim();
    
    // Remover números al inicio
    cleaned = cleaned.replace(/^\d+[\.\)\-\s]*/, '');
    
    // Remover emails
    cleaned = cleaned.replace(/\s*[\w\.-]+@[\w\.-]+\.\w+\s*/g, ' ');
    
    // Remover teléfonos
    cleaned = cleaned.replace(/\s*[\+\(]?[\d\s\-\(\)]{7,}\s*/g, ' ');
    
    // Remover texto extra
    cleaned = cleaned.replace(/\s*[\-\,].*$/, ''); // Todo después de - o ,
    
    // Limpiar espacios múltiples
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Capitalizar nombres apropiadamente
    cleaned = cleaned.split(' ').map(word => {
      if (word.toLowerCase() === 'de' || word.toLowerCase() === 'del' || word.toLowerCase() === 'la') {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    
    // Agregar títulos profesionales si no los tiene
    if (cleaned && !cleaned.match(/^(Dr\.|Dra\.|Lic\.|Mg\.|Ing\.|Prof\.)/)) {
      // Detectar género y longitud para título apropiado
      const isFeminine = cleaned.toLowerCase().includes('maria') || 
                        cleaned.toLowerCase().includes('ana') || 
                        cleaned.toLowerCase().includes('elena') ||
                        cleaned.toLowerCase().includes('carmen') ||
                        cleaned.endsWith('a');
      
      if (cleaned.split(' ').length >= 3) {
        cleaned = `${isFeminine ? 'Dra.' : 'Dr.'} ${cleaned}`;
      } else {
        cleaned = `Lic. ${cleaned}`;
      }
    }
    
    return cleaned;
  }).filter(name => name.length > 5); // Filtrar nombres muy cortos
  
  return {
    success: true,
    cleanedNames: cleaned
  };
};