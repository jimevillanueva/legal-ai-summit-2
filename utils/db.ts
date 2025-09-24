import type { Schedule, Session, Speaker } from '../types';
import { DAYS, TIMES } from '../constants';
import { supabase, useSupabase } from './supabaseClient';

// Additional types for user data
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface SpeakerCheck {
  id: string;
  name: string;
  sessions: string[];
  status: 'complete' | 'incomplete' | 'conflict';
  suggestions: string[];
}

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

  // User data functions
  // Speakers (admin only)
  loadSpeakers: async (): Promise<Speaker[]> => {
    if (!useSupabase() || !supabase) return [];
    
    const { data, error } = await supabase
      .from('event_speakers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data?.map(s => ({ id: s.id, name: s.name })) || [];
  },

  saveSpeakers: async (speakers: Speaker[]): Promise<void> => {
    if (!useSupabase() || !supabase) return;
    
    // Clear existing speakers first
    const { error: deleteError } = await supabase
      .from('event_speakers')
      .delete()
      .gt('created_at', '1900-01-01'); // Delete all records
    
    if (deleteError) throw deleteError;

    if (speakers.length > 0) {
      // Insert new speakers (let Supabase generate UUIDs)
      const { error: insertError } = await supabase
        .from('event_speakers')
        .insert(speakers.map(s => ({ 
          name: s.name,
          // Don't include id - let Supabase auto-generate the UUID
        })));
      
      if (insertError) throw insertError;
    }
  },

  // Tasks
  loadTasks: async (): Promise<Task[]> => {
    if (!useSupabase() || !supabase) return [];
    
    const { data, error } = await supabase
      .from('event_tasks')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at');
    
    if (error) throw error;
    return data?.map(t => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
      createdAt: new Date(t.created_at).getTime()
    })) || [];
  },

  saveTask: async (task: Task): Promise<void> => {
    if (!useSupabase() || !supabase) return;
    
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('event_tasks')
      .upsert({
        id: task.id,
        user_id: userId,
        text: task.text,
        completed: task.completed
      });
    
    if (error) throw error;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    if (!useSupabase() || !supabase) return;
    
    const { error } = await supabase
      .from('event_tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) throw error;
  },

  // Contacts
  getContactById: async (contactId: string): Promise<{ id: string; name: string; email: string } | null> => {
    if (!useSupabase() || !supabase) return null;
    
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, email')
      .eq('id', contactId)
      .single();
    
    if (error) {
      console.error('Error fetching contact:', error);
      return null;
    }
    
    return data;
  }
};
