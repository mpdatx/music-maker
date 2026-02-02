import type { Note, GenerationParams, ChordDegree, LoopBundle, LoopVariation, GenrePreset, CounterMelodyConfig } from '../types';
import { SeededRandom, getChordTonesForDegree, getNoteInScale, resolveChordDegree, positionToTime } from './theory';
import { getRhythmSteps, getGrooveProfile, applyGroove } from './rhythm';
import { generateCounterMelody } from './counterMelody';

export interface MelodyOutput {
  main: Note[];
  counter: Note[] | null;
}

/**
 * Generate chord notes for a single chord variation using the rhythm pipeline.
 * The pipeline provides rhythm positions; this function adds chord voicing logic.
 */
function generateChordsVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  genre: GenrePreset,
  seed: number,
  bars: number
): Note[] {
  const notes: Note[] = [];
  const octave = 4;
  const rng = new SeededRandom(seed);

  // Get chord tones for this chord degree
  const chordTones = getChordTonesForDegree(chordDegree, key, scale, octave);

  // Get rhythm steps from the pipeline
  const steps = getRhythmSteps('keys', genre, params, seed);

  // For chords, we thin out the steps based on density - chords shouldn't be as busy as bass
  const chordSteps = steps.filter((step, i) => {
    // Keep downbeats (0, 4, 8, 12) more often
    const isDownbeat = step.position % 4 === 0;
    if (isDownbeat) return true;
    // Keep other steps based on density
    return rng.chance(params.density * 0.5);
  });

  // Extend duration for chord voicings (chords sustain longer)
  const durationMap: Record<string, string> = {
    '16n': '8n',
    '8n': '4n',
    '4n': '2n',
    '2n': '1m',
  };

  for (let bar = 0; bar < bars; bar++) {
    for (const step of chordSteps) {
      const time = positionToTime(bar, step.position);
      const duration = durationMap[step.duration] || step.duration;

      // Add all chord tones
      for (const pitch of chordTones) {
        notes.push({
          pitch,
          time,
          duration,
          velocity: step.velocity * 0.9, // Slightly softer than the step velocity
        });
      }

      // Add 7th for complexity (if not already a 7th chord)
      if (params.complexity > 0.6 && rng.chance(0.5) && !chordDegree.includes('7')) {
        const rootDegree = resolveChordDegree(chordDegree, key, scale);
        const seventh = getNoteInScale(key, scale, rootDegree + 6, octave);
        notes.push({
          pitch: seventh,
          time,
          duration,
          velocity: step.velocity * 0.7,
        });
      }
    }
  }

  // Apply groove
  const grooveProfile = getGrooveProfile(genre);
  return applyGroove(notes, grooveProfile);
}

/**
 * Generate a LoopBundle with one variation per chord in the progression
 */
export function generateChordsBundle(
  params: GenerationParams,
  key: string,
  scale: string,
  progression: ChordDegree[],
  seed: number,
  bars = 2,
  genre: GenrePreset = 'pop'
): LoopBundle {
  const variations: LoopVariation[] = [];

  for (let i = 0; i < progression.length; i++) {
    // Use offset seed for each variation to ensure reproducibility
    const variationSeed = seed + i * 1000;
    const notes = generateChordsVariation(params, key, scale, progression[i], genre, variationSeed, bars);
    variations.push({
      chordIndex: i,
      notes,
    });
  }

  return {
    id: `keys-${seed}`,
    instrument: 'keys',
    seed,
    progressionId: '', // Will be set by caller
    bars,
    generationParams: params,
    variations,
  };
}

/**
 * Legacy function for backward compatibility.
 * Generates chords for a single 'I' chord.
 */
export function generateChords(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2,
  genre: GenrePreset = 'pop'
): Note[] {
  const bundle = generateChordsBundle(params, key, scale, ['I'], seed, bars, genre);
  return bundle.variations[0].notes;
}

/**
 * Generate chords with optional counter melody.
 * Returns both the main chord pattern and the counter melody (if enabled).
 */
export function generateChordsWithCounter(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars: number = 2,
  genre: GenrePreset = 'pop',
  counterConfig?: CounterMelodyConfig
): MelodyOutput {
  const bundle = generateChordsBundle(params, key, scale, ['I'], seed, bars, genre);
  const main = bundle.variations[0].notes;

  if (!counterConfig?.enabled) {
    return { main, counter: null };
  }

  // Use octave 4 for chords (lower register)
  const chordTones = getChordTonesForDegree('I', key, scale, 4);

  const counter = generateCounterMelody(
    main,
    counterConfig.technique,
    chordTones,
    key,
    scale,
    seed
  );

  return { main, counter };
}
