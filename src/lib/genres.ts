import type { GenerationParams, ScaleType, CounterMelodyTechnique } from './types';

/**
 * Consolidated genre configuration.
 * All genre-related data in one place for easy addition of new genres.
 */
export const GENRES = {
  'lofi-hiphop': {
    name: 'Lo-fi Hip-hop',
    bpmRange: [70, 90] as [number, number],
    key: 'D',
    scale: 'minor' as ScaleType,
    swing: 0.3,
    defaultParams: { density: 0.4, complexity: 0.3, swing: 0.3, style: 'swung' } as GenerationParams,
    defaultCounterTechnique: 'rhythmic' as CounterMelodyTechnique,
    tracks: [
      { type: 'drums', name: 'Drums' },
      { type: 'piano', name: 'Piano' },
      { type: 'bass-electric', name: 'Bass' },
      { type: 'guitar-acoustic', name: 'Guitar' },
      { type: 'pad', name: 'Pad' },
      { type: 'pluck', name: 'Pluck' },
      { type: 'violin', name: 'Violin' },
    ],
  },
  'edm-house': {
    name: 'EDM/House',
    bpmRange: [120, 130] as [number, number],
    key: 'A',
    scale: 'minor' as ScaleType,
    swing: 0,
    defaultParams: { density: 0.7, complexity: 0.5, swing: 0, style: 'straight' } as GenerationParams,
    defaultCounterTechnique: 'rhythmic' as CounterMelodyTechnique,
    tracks: [
      { type: 'drums', name: 'Drums' },
      { type: 'percussion', name: 'Percussion' },
      { type: 'bass', name: 'Bass' },
      { type: 'keys', name: 'Keys' },
      { type: 'lead', name: 'Lead' },
      { type: 'pad', name: 'Pad' },
      { type: 'pluck', name: 'Pluck' },
    ],
  },
  'rock': {
    name: 'Rock',
    bpmRange: [100, 140] as [number, number],
    key: 'E',
    scale: 'minor' as ScaleType,
    swing: 0,
    defaultParams: { density: 0.5, complexity: 0.4, swing: 0, style: 'straight' } as GenerationParams,
    defaultCounterTechnique: 'rhythmic' as CounterMelodyTechnique,
    tracks: [
      { type: 'drums', name: 'Drums' },
      { type: 'bass-electric', name: 'Bass' },
      { type: 'guitar-electric', name: 'Lead Guitar' },
      { type: 'guitar-acoustic', name: 'Rhythm Guitar' },
      { type: 'piano', name: 'Piano' },
      { type: 'organ-sampled', name: 'Organ' },
    ],
  },
  'ambient': {
    name: 'Ambient/Chill',
    bpmRange: [60, 80] as [number, number],
    key: 'C',
    scale: 'major' as ScaleType,
    swing: 0.1,
    defaultParams: { density: 0.2, complexity: 0.2, swing: 0.1, style: 'straight' } as GenerationParams,
    defaultCounterTechnique: 'rhythmic' as CounterMelodyTechnique,
    tracks: [
      { type: 'drums', name: 'Drums' },
      { type: 'piano', name: 'Piano' },
      { type: 'pad', name: 'Pad' },
      { type: 'violin', name: 'Violin' },
      { type: 'cello', name: 'Cello' },
      { type: 'harp', name: 'Harp' },
      { type: 'flute', name: 'Flute' },
    ],
  },
  'funk': {
    name: 'Funk',
    bpmRange: [95, 115] as [number, number],
    key: 'E',
    scale: 'mixolydian' as ScaleType,
    swing: 0.4,
    defaultParams: { density: 0.6, complexity: 0.6, swing: 0.4, style: 'syncopated' } as GenerationParams,
    defaultCounterTechnique: 'rhythmic' as CounterMelodyTechnique,
    tracks: [
      { type: 'drums', name: 'Drums' },
      { type: 'percussion', name: 'Percussion' },
      { type: 'bass-electric', name: 'Bass' },
      { type: 'guitar-electric', name: 'Guitar' },
      { type: 'organ-sampled', name: 'Organ' },
      { type: 'trumpet', name: 'Trumpet' },
      { type: 'saxophone', name: 'Sax' },
    ],
  },
  'pop': {
    name: 'Pop',
    bpmRange: [100, 120] as [number, number],
    key: 'C',
    scale: 'major' as ScaleType,
    swing: 0,
    defaultParams: { density: 0.5, complexity: 0.3, swing: 0, style: 'straight' } as GenerationParams,
    defaultCounterTechnique: 'rhythmic' as CounterMelodyTechnique,
    tracks: [
      { type: 'drums', name: 'Drums' },
      { type: 'bass-electric', name: 'Bass' },
      { type: 'piano', name: 'Piano' },
      { type: 'guitar-acoustic', name: 'Guitar' },
      { type: 'strings', name: 'Strings' },
      { type: 'pad', name: 'Pad' },
    ],
  },
  // New genres
  'jazz': {
    name: 'Jazz',
    bpmRange: [110, 140] as [number, number],
    key: 'A#',  // Bb enharmonic - theory module uses sharps only
    scale: 'dorian' as ScaleType,
    swing: 0.5,
    defaultParams: { density: 0.5, complexity: 0.7, swing: 0.5, style: 'swung' } as GenerationParams,
    defaultCounterTechnique: 'harmonic' as CounterMelodyTechnique,
    tracks: [
      { type: 'drums', name: 'Drums' },
      { type: 'bass-electric', name: 'Bass' },
      { type: 'piano', name: 'Piano' },
      { type: 'saxophone', name: 'Sax' },
      { type: 'trumpet', name: 'Trumpet' },
    ],
  },
  'classical': {
    name: 'Classical',
    bpmRange: [80, 120] as [number, number],
    key: 'C',
    scale: 'major' as ScaleType,
    swing: 0,
    defaultParams: { density: 0.4, complexity: 0.5, swing: 0, style: 'straight' } as GenerationParams,
    defaultCounterTechnique: 'contrary' as CounterMelodyTechnique,
    tracks: [
      { type: 'violin', name: 'Violin' },
      { type: 'cello', name: 'Cello' },
      { type: 'contrabass', name: 'Contrabass' },
      { type: 'flute', name: 'Flute' },
      { type: 'clarinet', name: 'Clarinet' },
      { type: 'harp', name: 'Harp' },
    ],
  },
  'bossa-nova': {
    name: 'Bossa Nova',
    bpmRange: [120, 140] as [number, number],
    key: 'F',
    scale: 'major' as ScaleType,
    swing: 0.3,
    defaultParams: { density: 0.4, complexity: 0.5, swing: 0.3, style: 'swung' } as GenerationParams,
    defaultCounterTechnique: 'rhythmic' as CounterMelodyTechnique,
    tracks: [
      { type: 'drums', name: 'Drums' },
      { type: 'percussion', name: 'Percussion' },
      { type: 'bass-electric', name: 'Bass' },
      { type: 'guitar-acoustic', name: 'Guitar' },
      { type: 'piano', name: 'Piano' },
      { type: 'flute', name: 'Flute' },
    ],
  },
  'blues': {
    name: 'Blues',
    bpmRange: [70, 90] as [number, number],
    key: 'E',
    scale: 'minor' as ScaleType,
    swing: 0.4,
    defaultParams: { density: 0.4, complexity: 0.4, swing: 0.4, style: 'swung' } as GenerationParams,
    defaultCounterTechnique: 'rhythmic' as CounterMelodyTechnique,
    tracks: [
      { type: 'drums', name: 'Drums' },
      { type: 'bass-electric', name: 'Bass' },
      { type: 'guitar-electric', name: 'Guitar' },
      { type: 'piano', name: 'Piano' },
      { type: 'saxophone', name: 'Sax' },
      { type: 'organ-sampled', name: 'Organ' },
    ],
  },
  'reggae': {
    name: 'Reggae',
    bpmRange: [70, 90] as [number, number],
    key: 'G',
    scale: 'major' as ScaleType,
    swing: 0.2,
    defaultParams: { density: 0.4, complexity: 0.3, swing: 0.2, style: 'offbeat' } as GenerationParams,
    defaultCounterTechnique: 'rhythmic' as CounterMelodyTechnique,
    tracks: [
      { type: 'drums', name: 'Drums' },
      { type: 'percussion', name: 'Percussion' },
      { type: 'bass-electric', name: 'Bass' },
      { type: 'guitar-electric', name: 'Guitar' },
      { type: 'organ-sampled', name: 'Organ' },
      { type: 'piano', name: 'Keys' },
    ],
  },
  'cinematic': {
    name: 'Cinematic',
    bpmRange: [60, 100] as [number, number],
    key: 'D',
    scale: 'minor' as ScaleType,
    swing: 0,
    defaultParams: { density: 0.3, complexity: 0.4, swing: 0, style: 'straight' } as GenerationParams,
    defaultCounterTechnique: 'rhythmic' as CounterMelodyTechnique,
    tracks: [
      { type: 'percussion', name: 'Percussion' },
      { type: 'violin', name: 'Violin' },
      { type: 'cello', name: 'Cello' },
      { type: 'contrabass', name: 'Contrabass' },
      { type: 'french-horn', name: 'French Horn' },
      { type: 'harp', name: 'Harp' },
      { type: 'pad', name: 'Pad' },
    ],
  },
} as const;

// Derive the GenrePreset type from the GENRES object
export type GenrePreset = keyof typeof GENRES;

// Helper type for a single genre config
export interface GenreConfig {
  name: string;
  bpmRange: [number, number];
  key: string;
  scale: ScaleType;
  swing: number;
  defaultParams: GenerationParams;
  defaultCounterTechnique: CounterMelodyTechnique;
  tracks: Array<{ type: string; name: string }>;
}

// Type-safe access to genre config
export function getGenreConfig(genre: GenrePreset): GenreConfig {
  return GENRES[genre] as GenreConfig;
}

// Get all genre keys
export function getAllGenres(): GenrePreset[] {
  return Object.keys(GENRES) as GenrePreset[];
}

// Get genre BPM (middle of range)
export function getGenreBpm(genre: GenrePreset): number {
  const [min, max] = GENRES[genre].bpmRange;
  return Math.floor((min + max) / 2);
}

// Get genre tracks
export function getGenreTracks(genre: GenrePreset): Array<{ type: string; name: string }> {
  return [...GENRES[genre].tracks];
}
