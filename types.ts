export interface Speaker {
  id: string;
  name: string;
}

export enum SessionStatus {
  PROPOSED = 'Propuesta',
  CONFIRMED = 'Confirmada',
  ANNOUNCED = 'Anunciada',
  CANCELLED = 'Cancelada',
}

export interface Session {
  id: string;
  title: string;
  speakers: Speaker[];
  trackId: string;
  room: string;
  day: string;
  time: string;
  notes?: string;
  status: SessionStatus;
  hasConflict?: boolean;
  zoomLink?: string;
  borderColor?: string;
}

export interface Track {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

export type Schedule = Record<string, Record<string, Session[]>>;