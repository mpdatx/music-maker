import type { Note, GenerationParams, ChordDegree, LoopBundle, LoopVariation } from '../types';
import { SeededRandom, getNoteInScale, resolveChordDegree } from './theory';

const BASS_PATTERNS = [
  // Steady root
  [0, 4, 8, 12],
  // Syncopated
  [0, 3, 6, 10, 14],
  // Octave jump
  [0, 0, 8, 8],
  // Funk
  [0, 3, 4, 7, 10, 12],
];

/**
 * Generate bass notes for a single chord variation
 */
function generateBassVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  rng: SeededRandom,
  bars: number
): Note[] {
  const stepsPerBar = 16;
  const notes: Note[] = [];
  const octave = 2;

  // Resolve the chord degree to a scale degree (0-6)
  const rootDegree = resolveChordDegree(chordDegree, key, scale);

  // Pick base pattern
  const pattern = rng.pick(BASS_PATTERNS);

  for (let bar = 0; bar < bars; bar++) {
    for (const step of pattern) {
      const time = `${bar}:0:${step * 0.25}`;

      // Root note most of the time
      let degree = rootDegree;

      // Add variation based on complexity
      if (params.complexity > 0.3 && rng.chance(params.complexity * 0.4)) {
        // Sometimes play third, fifth, or octave relative to chord root
        degree += rng.pick([0, 2, 4, 7]);
      }

      const pitch = getNoteInScale(key, scale, degree, octave);

      // Vary duration based on density
      const durations = ['4n', '8n', '8n.'];
      const duration = params.density > 0.6 ? rng.pick(durations) : '4n';

      notes.push({
        pitch,
        time,
        duration,
        velocity: 0.8 + rng.next() * 0.15,
      });
    }

    // Fill notes based on density
    if (params.density > 0.5) {
      const fillCount = Math.floor(params.density * 3);
      for (let i = 0; i < fillCount; i++) {
        const step = rng.nextInt(0, stepsPerBar - 1);
        if (!pattern.includes(step)) {
          const time = `${bar}:0:${step * 0.25}`;
          const degree = rootDegree + rng.pick([0, 2, 4]);
          notes.push({
            pitch: getNoteInScale(key, scale, degree, octave),
            time,
            duration: '16n',
            velocity: 0.6 + rng.next() * 0.2,
          });
        }
      }
    }
  }

  return notes;
}

/**
 * Generate a LoopBundle with one variation per chord in the progression
 */
export function generateBassBundle(
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
    const notes = generateBassVariation(params, key, scale, progression[i], rng, bars);
    variations.push({
      chordIndex: i,
      notes,
    });
  }

  return {
    id: `bass-${seed}`,
    instrument: 'bass',
    seed,
    progressionId: '', // Will be set by caller
    bars,
    generationParams: params,
    variations,
  };
}

/**
 * Legacy function for backward compatibility.
 * Generates a bass line for a single 'I' chord.
 */
export function generateBassLine(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const bundle = generateBassBundle(params, key, scale, ['I'], seed, bars);
  return bundle.variations[0].notes;
}
