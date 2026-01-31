import type { Loop, InstrumentType, GenerationParams, Note, ScaleType, LoopBundle, ChordDegree } from '../types';
import { generateDrumPattern, generateDrumBundle } from './drums';
import { generateBassLine, generateBassBundle } from './bass';
import { generateChords, generateChordsBundle } from './chords';
import { generateLead, generateLeadBundle } from './lead';
import { generatePad, generatePadBundle } from './pad';
import { generatePluck } from './pluck';
import { generateStrings } from './strings';
import { generateOrgan } from './organ';
import { clampAndQuantizeNote } from './theory';
import { getDefaultProgression, getProgressionById } from './progressions';
import { GENRES, getGenreConfig, getGenreBpm as getGenreBpmFromConfig } from '../genres';
import type { GenrePreset } from '../genres';

export { SeededRandom } from './theory';
export { getDefaultProgression, getProgressionById, getProgressionsForGenre } from './progressions';
// Re-export from genres for backwards compatibility
export { GENRES, getGenreConfig, getGenreTracks, getAllGenres } from '../genres';
export type { GenrePreset } from '../genres';

// MIDI note ranges for sampled instruments (based on available samples)
export const SAMPLED_INSTRUMENT_RANGES: Record<string, [number, number]> = {
  'piano': [33, 108],           // A1 to C8
  'guitar-acoustic': [38, 74],   // D2 to D5
  'guitar-electric': [40, 84],   // E2 to C6
  'bass-electric': [28, 61],     // E1 to C#5
  'violin': [55, 96],            // G3 to C7
  'cello': [36, 60],             // C2 to C5
  'contrabass': [30, 59],        // F#1 to B3
  'harp': [28, 89],              // E1 to F7
  'trumpet': [53, 84],           // F3 to C6
  'trombone': [34, 65],          // A#1 to F4
  'french-horn': [33, 77],       // A1 to F5
  'tuba': [29, 62],              // F1 to D4
  'saxophone': [51, 80],         // D#3 to G#5
  'flute': [60, 96],             // C4 to C7
  'clarinet': [50, 90],          // D3 to F#6
  'bassoon': [43, 60],           // G2 to C5
  'organ-sampled': [24, 84],     // C1 to C6
  'harmonium': [36, 74],         // C2 to D5
  'xylophone': [67, 108],        // G4 to C8
};

// Constrain notes to instrument range and quantize to available samples
function constrainNotesToRange(notes: Note[], instrumentType: InstrumentType): Note[] {
  const range = SAMPLED_INSTRUMENT_RANGES[instrumentType];
  if (!range) return notes; // Synth instruments don't need constraining

  const [minMidi, maxMidi] = range;
  return notes.map(note => ({
    ...note,
    pitch: clampAndQuantizeNote(note.pitch, minMidi, maxMidi, instrumentType),
  }));
}

// Re-export GENRES as GENRE_PRESETS for backwards compatibility
export const GENRE_PRESETS = GENRES;

function generateId(): string {
  return 'loop_' + Math.random().toString(36).substring(2, 15);
}

export function generateLoop(
  type: InstrumentType,
  params: GenerationParams,
  key: string,
  scale: string,
  seed?: number,
  bars = 2,
  genre: GenrePreset = 'pop'
): Loop {
  const actualSeed = seed ?? Math.floor(Math.random() * 1000000);

  let notes: Note[];
  switch (type) {
    // Drum instruments
    case 'drums':
    case 'percussion':
      notes = generateDrumPattern(params, actualSeed, bars);
      break;

    // Bass instruments (synth and sampled)
    case 'bass':
    case 'bass-electric':
    case 'contrabass':
    case 'tuba':
      notes = generateBassLine(params, key, scale, actualSeed, bars, genre);
      break;

    // Chord/keys instruments
    case 'keys':
    case 'piano':
    case 'organ-sampled':
    case 'harmonium':
    case 'epiano':
      notes = generateChords(params, key, scale, actualSeed, bars, genre);
      break;

    // Lead/melody instruments
    case 'lead':
    case 'trumpet':
    case 'saxophone':
    case 'flute':
    case 'clarinet':
    case 'violin':
      notes = generateLead(params, key, scale, actualSeed, bars, genre);
      break;

    // Pad/sustain instruments
    case 'pad':
    case 'choir':
    case 'cello':
    case 'french-horn':
    case 'trombone':
      notes = generatePad(params, key, scale, actualSeed, bars, genre);
      break;

    // Pluck/arp instruments
    case 'pluck':
    case 'kalimba':
    case 'xylophone':
    case 'harp':
    case 'guitar-acoustic':
    case 'guitar-electric':
    case 'bassoon':
      notes = generatePluck(params, key, scale, actualSeed, bars);
      break;

    // Strings (legato style)
    case 'strings':
      notes = generateStrings(params, key, scale, actualSeed, bars);
      break;

    // Organ (sustained chords)
    case 'organ':
      notes = generateOrgan(params, key, scale, actualSeed, bars);
      break;

    default:
      notes = [];
  }

  // Constrain notes to instrument's sample range
  notes = constrainNotesToRange(notes, type);

  return {
    id: generateId(),
    type,
    bars,
    seed: actualSeed,
    generationParams: params,
    notes,
  };
}

export function generateLoopsForGenre(
  genre: GenrePreset,
  key: string,
  scale: string
): Record<InstrumentType, Loop> {
  const config = GENRE_PRESETS[genre];
  const types: InstrumentType[] = ['drums', 'percussion', 'bass', 'keys', 'lead', 'pad', 'pluck', 'strings', 'organ', 'choir', 'epiano', 'kalimba'];

  const loops: Partial<Record<InstrumentType, Loop>> = {};

  for (const type of types) {
    loops[type] = generateLoop(type, config.defaultParams, key, scale);
  }

  return loops as Record<InstrumentType, Loop>;
}

export function getGenreBpm(genre: GenrePreset): number {
  return getGenreBpmFromConfig(genre);
}

/**
 * Unified bundle generator that routes to the appropriate instrument bundle generator.
 * Gets the progression for the genre (or uses provided progressionId) and returns
 * a LoopBundle with variations for each chord in the progression.
 */
export function generateLoopBundle(
  instrument: InstrumentType,
  params: GenerationParams,
  key: string,
  scale: string,
  genre: GenrePreset,
  seed: number,
  progressionId?: string,
  bars = 2
): LoopBundle {
  // Get the progression (from progressionId or genre default)
  const progression = progressionId
    ? getProgressionById(progressionId) ?? getDefaultProgression(genre)
    : getDefaultProgression(genre);

  const chords = progression.chords as ChordDegree[];

  let bundle: LoopBundle;

  // Route to the appropriate bundle generator based on instrument type
  switch (instrument) {
    // Drum instruments
    case 'drums':
    case 'percussion':
      bundle = generateDrumBundle(params, chords, seed, bars);
      break;

    // Bass instruments
    case 'bass':
    case 'bass-electric':
    case 'contrabass':
    case 'tuba':
      bundle = generateBassBundle(params, key, scale, chords, seed, bars, genre);
      break;

    // Chord/keys instruments
    case 'keys':
    case 'piano':
    case 'organ-sampled':
    case 'harmonium':
    case 'epiano':
      bundle = generateChordsBundle(params, key, scale, chords, seed, bars, genre);
      break;

    // Lead/melody instruments
    case 'lead':
    case 'trumpet':
    case 'saxophone':
    case 'flute':
    case 'clarinet':
    case 'violin':
      bundle = generateLeadBundle(params, key, scale, chords, seed, bars, genre);
      break;

    // Pad/sustain instruments
    case 'pad':
    case 'choir':
    case 'cello':
    case 'french-horn':
    case 'trombone':
      bundle = generatePadBundle(params, key, scale, chords, seed, bars, genre);
      break;

    // Default: treat as lead (melodic instruments)
    case 'pluck':
    case 'kalimba':
    case 'xylophone':
    case 'harp':
    case 'guitar-acoustic':
    case 'guitar-electric':
    case 'bassoon':
    case 'strings':
    case 'organ':
    default:
      bundle = generateLeadBundle(params, key, scale, chords, seed, bars, genre);
      break;
  }

  // Set the progressionId on the returned bundle
  bundle.progressionId = progression.id;
  bundle.instrument = instrument;

  // Constrain notes to instrument's sample range for each variation
  for (const variation of bundle.variations) {
    variation.notes = constrainNotesToRange(variation.notes, instrument);
  }

  return bundle;
}
