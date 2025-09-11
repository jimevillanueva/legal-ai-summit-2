import type { Schedule, Session } from '../types';
import { DAYS, TIMES } from '../constants';
import { supabase, useSupabase } from './supabaseClient';

// Utilidades para transformar entre filas y tipos locales
const rowsToSchedule = (rows: any[]): Schedule => {
  const schedule: Schedule = {} as any;
  DAYS.forEach(d => {
    schedule[d] = {} as any;
    TIMES.forEach(t => { (schedule[d] as any)[t] = []; });
  });
  rows.forEach((r) => {
    const session: Session = {
      id: r.id,
      title: r.title,
      speakers: Array.isArray(r.speakers) ? r.speakers : [],
      room: r.room || '',
      day: r.day,
      time: r.time,
      notes: r.notes || undefined,
      status: r.status || 'Confirmada',
      hasConflict: !!r.has_conflict,
      zoomLink: r.zoom_link || undefined,
      borderColor: r.border_color || undefined,
    };
    if (!schedule[session.day]) schedule[session.day] = {} as any;
    if (!(schedule[session.day] as any)[session.time]) (schedule[session.day] as any)[session.time] = [];
    (schedule[session.day] as any)[session.time].push(session);
  });
  return schedule;
};

export const db = {
  enabled: () => useSupabase(),

  // Carga completa de sesiones
  loadAll: async (): Promise<{ schedule: Schedule }> => {
    if (!useSupabase() || !supabase) throw new Error('Supabase disabled');
    
    const { data: sessionsData, error: sErr } = await supabase
      .from('sessions')
      .select('*');
    if (sErr) throw sErr;

    const schedule = rowsToSchedule(sessionsData || []);
    return { schedule };
  },

  upsertSession: async (session: Session) => {
    if (!useSupabase() || !supabase) return;
    const payload = {
      id: session.id,
      title: session.title,
      speakers: session.speakers,
      room: session.room,
      day: session.day,
      time: session.time,
      notes: session.notes || null,
      status: session.status,
      has_conflict: !!session.hasConflict,
      zoom_link: session.zoomLink || null,
      border_color: session.borderColor || null,
    };
    const { error } = await supabase.from('sessions').upsert(payload);
    if (error) throw error;
  },

  deleteSession: async (sessionId: string) => {
    if (!useSupabase() || !supabase) return;
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if (error) throw error;
  },

  // no tracks in this simplified app
};
