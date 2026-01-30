export type InstrumentType = 'drums' | 'percussion' | 'bass' | 'keys' | 'lead' | 'pad';

export type ScaleType = 'major' | 'minor' | 'dorian' | 'mixolydian' | 'pentatonic';

export interface Note {
  pitch: string;      // e.g., "C4" or "kick"
  time: string;       // Tone.js time format "0:0:0"
  duration: string;   // e.g., "8n", "4n"
  velocity: number;   // 0-1
}

export interface GenerationParams {
  density: number;      // 0-1, sparse to busy
  complexity: number;   // 0-1, simple to syncopated
  swing: number;        // 0-1, straight to swung
  style: 'straight' | 'swung' | 'syncopated' | 'offbeat';
}

export interface Loop {
  id: string;
  type: InstrumentType;
  bars: number;
  seed: number;
  generationParams: GenerationParams;
  notes: Note[];
}

export interface EffectConfig {
  type: 'reverb' | 'delay' | 'filter' | 'distortion' | 'compression' | 'eq' | 'chorus' | 'phaser';
  params: Record<string, number>;
  bypassed: boolean;
}

export interface Track {
  id: string;
  type: InstrumentType;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  effects: EffectConfig[];
  cells: { col: number; loopId: string | null }[];
}

export interface Project {
  id: string;
  name: string;
  bpm: number;
  key: string;
  scale: ScaleType;
  tracks: Track[];
  loops: Record<string, Loop>;
  createdAt: number;
  updatedAt: number;
}

export type LoopState = 'inactive' | 'active' | 'queued' | 'stopping';

export interface CellState {
  loopId: string | null;
  state: LoopState;
}

export type GenrePreset = 'lofi-hiphop' | 'edm-house' | 'rock' | 'ambient' | 'funk' | 'pop';

export type TransportState = 'stopped' | 'started' | 'paused';
