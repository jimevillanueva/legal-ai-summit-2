/*
  Seed script to populate Supabase with initial tracks and sessions.
  Usage:
    SUPABASE_SERVICE_ROLE_KEY=... VITE_SUPABASE_URL=... npx tsx scripts/seed-supabase.ts
*/

import { createClient } from '@supabase/supabase-js';
import { getInitialSchedule, DAYS, TIMES } from '../constants';
import type { Session } from '../types';

const url = process.env.VITE_SUPABASE_URL as string;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !serviceRole) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceRole);

const main = async () => {
  const schedule = getInitialSchedule();
  const sessions: Session[] = [];
  for (const day of DAYS) {
    for (const time of TIMES) {
      const arr = schedule[day]?.[time] || [];
      for (const s of arr) sessions.push(s);
    }
  }

  const sessPayload = sessions.map(s => ({
    id: s.id,
    title: s.title,
    speakers: s.speakers,
    track_id: s.trackId,
    room: s.room,
    day: s.day,
    time: s.time,
    notes: s.notes ?? null,
    status: s.status,
    has_conflict: !!s.hasConflict,
    zoom_link: s.zoomLink ?? null,
  }));

  // Replace sessions fully for determinism
  await supabase.from('sessions').delete().neq('id', '');
  const { error: sErr } = await supabase.from('sessions').insert(sessPayload);
  if (sErr) throw sErr;
  console.log(`Inserted ${sessPayload.length} sessions.`);
};

main().then(() => {
  console.log('Seed completed.');
  process.exit(0);
}).catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
