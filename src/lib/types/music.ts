// Synthesizer-based instruments
export type SynthInstrumentType = 'drums' | 'percussion' | 'bass' | 'keys' | 'lead' | 'pad' | 'pluck' | 'strings' | 'organ' | 'choir' | 'epiano' | 'kalimba';

// Sample-based instruments (real recordings)
export type SampledInstrumentType =
  | 'piano'
  | 'guitar-acoustic'
  | 'guitar-electric'
  | 'bass-electric'
  | 'violin'
  | 'cello'
  | 'contrabass'
  | 'harp'
  | 'trumpet'
  | 'trombone'
  | 'french-horn'
  | 'tuba'
  | 'saxophone'
  | 'flute'
  | 'clarinet'
  | 'bassoon'
  | 'organ-sampled'
  | 'harmonium'
  | 'xylophone';

export type InstrumentType = SynthInstrumentType | SampledInstrumentType;

export type ScaleType = 'major' | 'minor' | 'dorian' | 'mixolydian' | 'pentatonic' | 'chromatic';

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
  genre: GenrePreset;
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

export type PlayMode = 'loop' | 'pad';

export interface PadConfig {
  instrument: Exclude<InstrumentType, 'drums' | 'percussion'>;
  rows: number;
  cols: number;
  baseOctave: number;
}

export type ChordDegree =
  | 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii°'
  | 'Imaj7' | 'ii7' | 'iii7' | 'IVmaj7' | 'V7' | 'vi7' | 'vii7b5';

export interface ChordProgression {
  id: string;
  name: string;
  genre: GenrePreset;
  chords: ChordDegree[];
  isDefault: boolean;
}
