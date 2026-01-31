import type { Note, GenerationParams, ChordDegree, LoopBundle, LoopVariation, GenrePreset } from '../types';
import { SeededRandom, getNoteInScale, resolveChordDegree } from './theory';
import { getRhythmSteps, getGrooveProfile, applyGroove } from './rhythm';

/**
 * Generate bass notes for a single chord variation using the rhythm pipeline.
 * The pipeline provides rhythm positions with dynamics; this function adds pitch logic.
 */
function generateBassVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  genre: GenrePreset,
  seed: number,
  bars: number
): Note[] {
  const notes: Note[] = [];
  const octave = 2;
  const rng = new SeededRandom(seed);

  // Resolve the chord degree to a scale degree (0-6)
  const rootDegree = resolveChordDegree(chordDegree, key, scale);

  // Get rhythm steps from the pipeline (includes transformations, dynamics, humanization)
  const steps = getRhythmSteps('bass', genre, params, seed);

  for (let bar = 0; bar < bars; bar++) {
    for (const step of steps) {
      const time = `${bar}:0:${step.position * 0.25}`;

      // Root note most of the time
      let degree = rootDegree;

      // Add variation based on complexity and step characteristics
      if (params.complexity > 0.3 && rng.chance(params.complexity * 0.4)) {
        // Sometimes play third, fifth, or octave relative to chord root
        degree += rng.pick([0, 2, 4, 7]);
      }

      // Ghost notes tend to play passing tones
      if (step.ghost && rng.chance(0.6)) {
        degree += rng.pick([1, -1, 2, -2]);
      }

      const pitch = getNoteInScale(key, scale, degree, octave);

      notes.push({
        pitch,
        time,
        duration: step.duration,
        velocity: step.velocity,
      });
    }
  }

  // Apply groove (swing and timing)
  const grooveProfile = getGrooveProfile(genre);
  return applyGroove(notes, grooveProfile);
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
  bars = 2,
  genre: GenrePreset = 'pop'
): LoopBundle {
  const variations: LoopVariation[] = [];

  for (let i = 0; i < progression.length; i++) {
    // Use offset seed for each variation to ensure reproducibility
    const variationSeed = seed + i * 1000;
    const notes = generateBassVariation(params, key, scale, progression[i], genre, variationSeed, bars);
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
  bars = 2,
  genre: GenrePreset = 'pop'
): Note[] {
  const bundle = generateBassBundle(params, key, scale, ['I'], seed, bars, genre);
  return bundle.variations[0].notes;
}
