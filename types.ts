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
  room: string;
  day: string;
  time: string;
  notes?: string;
  status: SessionStatus;
  hasConflict?: boolean;
  zoomLink?: string;
  borderColor?: string;
}

export type Schedule = Record<string, Record<string, Session[]>>;