import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const useSupabase = (): boolean => {
  return Boolean(import.meta.env.VITE_USE_SUPABASE === 'true' && url && anon);
};

export const supabase = url && anon
  ? createClient(url, anon,{
    db:{
      schema: 'public',
    },
  })
  : (null as any);

