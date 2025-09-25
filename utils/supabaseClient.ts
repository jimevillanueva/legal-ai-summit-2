// utils/supabaseClient.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 1. Cargar las variables de entorno de forma compatible (Vite y Node.js)
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

// 2. Crear una única instancia del cliente de Supabase (puede ser null si faltan las variables)
let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'public',
    },
  });
} else {
  // Advertencia útil si las variables de entorno no están configuradas
  console.warn('Supabase URL or Anon Key not provided. Supabase client will be null.');
}

// Exportar la instancia (que puede ser null)
export const supabase = supabaseInstance;

// 3. Corregir la función `useSupabase` para que también sea compatible
// Esta función ahora simplemente verifica si el cliente se pudo inicializar.
export const useSupabase = (): boolean => {
  const useFlag = import.meta.env?.VITE_USE_SUPABASE ?? process.env.VITE_USE_SUPABASE;
  // Es `true` si la bandera está activa y el cliente de Supabase se creó correctamente
  return useFlag === 'true' && supabase !== null;
};