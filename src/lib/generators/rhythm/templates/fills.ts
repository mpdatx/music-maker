// src/lib/generators/rhythm/templates/fills.ts
import type { GenrePreset } from '../../../types/music';
import type { Note } from '../../../types/music';
import type { EnergyLevel } from '../types';
import { SeededRandom } from '../../theory';

export interface FillTemplate {
  id: string;
  name: string;
  genre: GenrePreset;
  energyLevel: EnergyLevel;
  // Notes are relative to the last beat of the bar (beat 3, steps 12-15)
  notes: Note[];
}

// Helper to create fill notes at specific positions in the last beat
function fillNotes(
  pattern: Array<{ step: number; pitch: string; velocity: number }>
): Note[] {
  return pattern.map(({ step, pitch, velocity }) => ({
    pitch,
    time: `0:0:${(12 + step) * 0.25}`,
    duration: '16n',
    velocity,
  }));
}

// Lo-fi fills: laid-back, sparse, with ghost notes
const LOFI_FILLS: FillTemplate[] = [
  {
    id: 'lofi-fill-ghost',
    name: 'Ghost Roll',
    genre: 'lofi-hiphop',
    energyLevel: 'low',
    notes: fillNotes([
      { step: 2, pitch: 'snare', velocity: 0.3 },
      { step: 3, pitch: 'snare', velocity: 0.5 },
    ]),
  },
  {
    id: 'lofi-fill-lazy',
    name: 'Lazy Fill',
    genre: 'lofi-hiphop',
    energyLevel: 'mid',
    notes: fillNotes([
      { step: 1, pitch: 'snare', velocity: 0.4 },
      { step: 2, pitch: 'snare', velocity: 0.5 },
      { step: 3, pitch: 'kick', velocity: 0.6 },
    ]),
  },
  {
    id: 'lofi-fill-tape',
    name: 'Tape Saturate',
    genre: 'lofi-hiphop',
    energyLevel: 'high',
    notes: fillNotes([
      { step: 0, pitch: 'tom', velocity: 0.5 },
      { step: 1, pitch: 'snare', velocity: 0.55 },
      { step: 2, pitch: 'snare', velocity: 0.6 },
      { step: 3, pitch: 'snare', velocity: 0.7 },
    ]),
  },
];

// EDM fills: tight, punchy, building energy
const EDM_FILLS: FillTemplate[] = [
  {
    id: 'edm-fill-snare-build',
    name: 'Snare Build',
    genre: 'edm-house',
    energyLevel: 'low',
    notes: fillNotes([
      { step: 2, pitch: 'snare', velocity: 0.7 },
      { step: 3, pitch: 'snare', velocity: 0.85 },
    ]),
  },
  {
    id: 'edm-fill-riser',
    name: 'Riser',
    genre: 'edm-house',
    energyLevel: 'mid',
    notes: fillNotes([
      { step: 0, pitch: 'snare', velocity: 0.6 },
      { step: 1, pitch: 'snare', velocity: 0.7 },
      { step: 2, pitch: 'snare', velocity: 0.8 },
      { step: 3, pitch: 'snare', velocity: 0.95 },
    ]),
  },
  {
    id: 'edm-fill-drop',
    name: 'Drop Prep',
    genre: 'edm-house',
    energyLevel: 'high',
    notes: fillNotes([
      { step: 0, pitch: 'kick', velocity: 0.9 },
      { step: 1, pitch: 'snare', velocity: 0.85 },
      { step: 2, pitch: 'kick', velocity: 0.95 },
      { step: 3, pitch: 'openhat', velocity: 1.0 },
    ]),
  },
];

// Rock fills: powerful, dynamic, tom-heavy
const ROCK_FILLS: FillTemplate[] = [
  {
    id: 'rock-fill-simple',
    name: 'Simple Rock',
    genre: 'rock',
    energyLevel: 'low',
    notes: fillNotes([
      { step: 2, pitch: 'snare', velocity: 0.75 },
      { step: 3, pitch: 'snare', velocity: 0.85 },
    ]),
  },
  {
    id: 'rock-fill-tom',
    name: 'Tom Roll',
    genre: 'rock',
    energyLevel: 'mid',
    notes: fillNotes([
      { step: 0, pitch: 'tom', velocity: 0.7 },
      { step: 1, pitch: 'tom', velocity: 0.75 },
      { step: 2, pitch: 'snare', velocity: 0.8 },
      { step: 3, pitch: 'kick', velocity: 0.9 },
    ]),
  },
  {
    id: 'rock-fill-power',
    name: 'Power Fill',
    genre: 'rock',
    energyLevel: 'high',
    notes: fillNotes([
      { step: 0, pitch: 'tom', velocity: 0.8 },
      { step: 1, pitch: 'tom', velocity: 0.85 },
      { step: 2, pitch: 'snare', velocity: 0.9 },
      { step: 3, pitch: 'openhat', velocity: 1.0 },
    ]),
  },
];

// Funk fills: syncopated, ghost-heavy
const FUNK_FILLS: FillTemplate[] = [
  {
    id: 'funk-fill-ghost',
    name: 'Ghost Groove',
    genre: 'funk',
    energyLevel: 'low',
    notes: fillNotes([
      { step: 1, pitch: 'snare', velocity: 0.35 },
      { step: 3, pitch: 'snare', velocity: 0.6 },
    ]),
  },
  {
    id: 'funk-fill-syncopated',
    name: 'Syncopated',
    genre: 'funk',
    energyLevel: 'mid',
    notes: fillNotes([
      { step: 0, pitch: 'snare', velocity: 0.4 },
      { step: 1, pitch: 'kick', velocity: 0.7 },
      { step: 2, pitch: 'snare', velocity: 0.5 },
      { step: 3, pitch: 'snare', velocity: 0.8 },
    ]),
  },
  {
    id: 'funk-fill-slap',
    name: 'Slap Fill',
    genre: 'funk',
    energyLevel: 'high',
    notes: fillNotes([
      { step: 0, pitch: 'snare', velocity: 0.5 },
      { step: 1, pitch: 'snare', velocity: 0.6 },
      { step: 2, pitch: 'tom', velocity: 0.7 },
      { step: 3, pitch: 'snare', velocity: 0.9 },
    ]),
  },
];

// Pop fills: clean, predictable, accessible
const POP_FILLS: FillTemplate[] = [
  {
    id: 'pop-fill-simple',
    name: 'Simple Pop',
    genre: 'pop',
    energyLevel: 'low',
    notes: fillNotes([
      { step: 3, pitch: 'snare', velocity: 0.75 },
    ]),
  },
  {
    id: 'pop-fill-buildup',
    name: 'Build Up',
    genre: 'pop',
    energyLevel: 'mid',
    notes: fillNotes([
      { step: 1, pitch: 'snare', velocity: 0.6 },
      { step: 2, pitch: 'snare', velocity: 0.7 },
      { step: 3, pitch: 'snare', velocity: 0.8 },
    ]),
  },
  {
    id: 'pop-fill-anthem',
    name: 'Anthem',
    genre: 'pop',
    energyLevel: 'high',
    notes: fillNotes([
      { step: 0, pitch: 'tom', velocity: 0.7 },
      { step: 1, pitch: 'tom', velocity: 0.75 },
      { step: 2, pitch: 'snare', velocity: 0.85 },
      { step: 3, pitch: 'openhat', velocity: 0.95 },
    ]),
  },
];

// Ambient fills: minimal, textural
const AMBIENT_FILLS: FillTemplate[] = [
  {
    id: 'ambient-fill-breath',
    name: 'Breath',
    genre: 'ambient',
    energyLevel: 'low',
    notes: fillNotes([
      { step: 3, pitch: 'hihat', velocity: 0.4 },
    ]),
  },
  {
    id: 'ambient-fill-swell',
    name: 'Swell',
    genre: 'ambient',
    energyLevel: 'mid',
    notes: fillNotes([
      { step: 2, pitch: 'hihat', velocity: 0.35 },
      { step: 3, pitch: 'openhat', velocity: 0.5 },
    ]),
  },
  {
    id: 'ambient-fill-texture',
    name: 'Texture',
    genre: 'ambient',
    energyLevel: 'high',
    notes: fillNotes([
      { step: 1, pitch: 'hihat', velocity: 0.3 },
      { step: 2, pitch: 'snare', velocity: 0.4 },
      { step: 3, pitch: 'openhat', velocity: 0.6 },
    ]),
  },
];

// Jazz fills: swung, brush-like feel
const JAZZ_FILLS: FillTemplate[] = [
  {
    id: 'jazz-fill-brush',
    name: 'Brush',
    genre: 'jazz',
    energyLevel: 'low',
    notes: fillNotes([
      { step: 2, pitch: 'snare', velocity: 0.4 },
      { step: 3, pitch: 'snare', velocity: 0.5 },
    ]),
  },
  {
    id: 'jazz-fill-swing',
    name: 'Swing Fill',
    genre: 'jazz',
    energyLevel: 'mid',
    notes: fillNotes([
      { step: 0, pitch: 'snare', velocity: 0.45 },
      { step: 2, pitch: 'tom', velocity: 0.5 },
      { step: 3, pitch: 'snare', velocity: 0.6 },
    ]),
  },
  {
    id: 'jazz-fill-bebop',
    name: 'Bebop',
    genre: 'jazz',
    energyLevel: 'high',
    notes: fillNotes([
      { step: 0, pitch: 'snare', velocity: 0.5 },
      { step: 1, pitch: 'tom', velocity: 0.55 },
      { step: 2, pitch: 'snare', velocity: 0.6 },
      { step: 3, pitch: 'kick', velocity: 0.7 },
    ]),
  },
];

// Classical fills: timpani-like, dramatic
const CLASSICAL_FILLS: FillTemplate[] = [
  {
    id: 'classical-fill-roll',
    name: 'Roll',
    genre: 'classical',
    energyLevel: 'low',
    notes: fillNotes([
      { step: 2, pitch: 'tom', velocity: 0.5 },
      { step: 3, pitch: 'tom', velocity: 0.6 },
    ]),
  },
  {
    id: 'classical-fill-crescendo',
    name: 'Crescendo',
    genre: 'classical',
    energyLevel: 'mid',
    notes: fillNotes([
      { step: 0, pitch: 'tom', velocity: 0.4 },
      { step: 1, pitch: 'tom', velocity: 0.5 },
      { step: 2, pitch: 'tom', velocity: 0.6 },
      { step: 3, pitch: 'tom', velocity: 0.75 },
    ]),
  },
  {
    id: 'classical-fill-timpani',
    name: 'Timpani',
    genre: 'classical',
    energyLevel: 'high',
    notes: fillNotes([
      { step: 0, pitch: 'kick', velocity: 0.6 },
      { step: 1, pitch: 'tom', velocity: 0.7 },
      { step: 2, pitch: 'tom', velocity: 0.8 },
      { step: 3, pitch: 'kick', velocity: 0.9 },
    ]),
  },
];

const FILL_TEMPLATES: Partial<Record<GenrePreset, FillTemplate[]>> = {
  'lofi-hiphop': LOFI_FILLS,
  'edm-house': EDM_FILLS,
  'rock': ROCK_FILLS,
  'funk': FUNK_FILLS,
  'pop': POP_FILLS,
  'ambient': AMBIENT_FILLS,
  'jazz': JAZZ_FILLS,
  'classical': CLASSICAL_FILLS,
};

// Default fills for genres without specific templates
const DEFAULT_FILLS: FillTemplate[] = POP_FILLS;

export function getFillTemplates(genre: GenrePreset): FillTemplate[] {
  return FILL_TEMPLATES[genre] ?? DEFAULT_FILLS;
}

export function getFillTemplatesByEnergy(genre: GenrePreset, energy: EnergyLevel): FillTemplate[] {
  return getFillTemplates(genre).filter(f => f.energyLevel === energy);
}

/**
 * Generate a fill pattern for the given genre and parameters
 */
export function generateFill(
  genre: GenrePreset,
  density: number,
  seed: number,
  barOffset: number
): Note[] {
  const rng = new SeededRandom(seed);

  // Map density to energy level
  const energy: EnergyLevel = density < 0.35 ? 'low' : density < 0.7 ? 'mid' : 'high';

  // Get fills for this energy level, or fall back to any fills
  let fills = getFillTemplatesByEnergy(genre, energy);
  if (fills.length === 0) {
    fills = getFillTemplates(genre);
  }

  const fill = rng.pick(fills);

  // Adjust note times to the specified bar
  return fill.notes.map(note => ({
    ...note,
    time: note.time.replace('0:', `${barOffset}:`),
  }));
}
