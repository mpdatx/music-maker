import type { Note, GenerationParams, ChordDegree, LoopBundle, LoopVariation } from '../types';
import { SeededRandom, getChordTonesForDegree, getNoteInScale, resolveChordDegree } from './theory';

const CHORD_RHYTHMS = [
  // Sustained
  [{ step: 0, duration: '1m' }],
  // Half notes
  [{ step: 0, duration: '2n' }, { step: 8, duration: '2n' }],
  // Stabs
  [{ step: 0, duration: '8n' }, { step: 4, duration: '8n' }, { step: 8, duration: '8n' }, { step: 12, duration: '8n' }],
  // Syncopated
  [{ step: 0, duration: '4n' }, { step: 6, duration: '4n' }, { step: 10, duration: '4n' }],
];

/**
 * Generate chord notes for a single chord variation
 */
function generateChordsVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  rng: SeededRandom,
  bars: number
): Note[] {
  const notes: Note[] = [];
  const octave = 4;

  // Get chord tones for this chord degree
  const chordTones = getChordTonesForDegree(chordDegree, key, scale, octave);

  // Pick rhythm pattern based on density
  const rhythmIndex = Math.min(
    Math.floor(params.density * CHORD_RHYTHMS.length),
    CHORD_RHYTHMS.length - 1
  );
  const rhythm = CHORD_RHYTHMS[rhythmIndex];

  for (let bar = 0; bar < bars; bar++) {
    for (const { step, duration } of rhythm) {
      const time = `${bar}:0:${step * 0.25}`;

      // Add all chord tones
      for (const pitch of chordTones) {
        notes.push({
          pitch,
          time,
          duration,
          velocity: 0.6 + rng.next() * 0.2,
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
          velocity: 0.5,
        });
      }
    }
  }

  return notes;
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
  bars = 2
): LoopBundle {
  const variations: LoopVariation[] = [];

  for (let i = 0; i < progression.length; i++) {
    // Create a new RNG for each variation using the same seed offset pattern
    // This ensures reproducibility
    const rng = new SeededRandom(seed + i * 1000);
    const notes = generateChordsVariation(params, key, scale, progression[i], rng, bars);
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
  bars = 2
): Note[] {
  const bundle = generateChordsBundle(params, key, scale, ['I'], seed, bars);
  return bundle.variations[0].notes;
}
