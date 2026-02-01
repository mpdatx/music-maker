import type { Note, GenerationParams, ChordDegree, LoopBundle, LoopVariation, DrumFillPoints, GenrePreset } from '../types';
import { SeededRandom } from './theory';
import { processRhythm, generateFill } from './rhythm';

interface DrumPattern {
  kick: number[];
  snare: number[];
  hihat: number[];
  openhat: number[];
}

const BASIC_PATTERNS: DrumPattern[] = [
  // Basic rock beat
  { kick: [0, 8], snare: [4, 12], hihat: [0, 2, 4, 6, 8, 10, 12, 14], openhat: [] },
  // Four on the floor
  { kick: [0, 4, 8, 12], snare: [4, 12], hihat: [2, 6, 10, 14], openhat: [0, 8] },
  // Hip-hop
  { kick: [0, 6, 10], snare: [4, 12], hihat: [0, 2, 4, 6, 8, 10, 12, 14], openhat: [] },
  // Breakbeat
  { kick: [0, 10], snare: [4, 14], hihat: [0, 2, 4, 6, 8, 10, 12, 14], openhat: [] },
];

export function generateDrumPattern(params: GenerationParams, seed: number, bars = 2): Note[] {
  const rng = new SeededRandom(seed);
  const stepsPerBar = 16;
  const notes: Note[] = [];

  // Pick base pattern
  const pattern = rng.pick(BASIC_PATTERNS);

  for (let bar = 0; bar < bars; bar++) {
    // Kick
    for (const step of pattern.kick) {
      const time = `${bar}:0:${step * 0.25}`;
      notes.push({ pitch: 'kick', time, duration: '8n', velocity: 0.9 });
    }

    // Snare
    for (const step of pattern.snare) {
      const time = `${bar}:0:${step * 0.25}`;
      notes.push({ pitch: 'snare', time, duration: '8n', velocity: 0.85 });
    }

    // Hi-hats
    for (let step = 0; step < stepsPerBar; step++) {
      const baseHit = pattern.hihat.includes(step);
      const openHit = pattern.openhat.includes(step);

      // Add extra hits based on density
      const shouldHit = baseHit || rng.chance(params.density * 0.3);

      if (shouldHit) {
        const time = `${bar}:0:${step * 0.25}`;
        const isOpen = openHit || (rng.chance(0.1) && params.complexity > 0.5);
        notes.push({
          pitch: isOpen ? 'openhat' : 'hihat',
          time,
          duration: '16n',
          velocity: 0.6 + rng.next() * 0.2,
        });
      }
    }

    // Ghost notes based on complexity
    if (params.complexity > 0.4) {
      const ghostCount = Math.floor(params.complexity * 4);
      for (let i = 0; i < ghostCount; i++) {
        const step = rng.nextInt(0, stepsPerBar - 1);
        const time = `${bar}:0:${step * 0.25}`;
        notes.push({
          pitch: rng.pick(['snare', 'tom']),
          time,
          duration: '32n',
          velocity: 0.3 + rng.next() * 0.2,
        });
      }
    }
  }

  return notes;
}

/**
 * Generate a LoopBundle for drums with fill support
 * Drums don't change with chord progressions, but they add fills at chord boundaries
 */
export function generateDrumBundle(
  params: GenerationParams,
  progression: ChordDegree[],
  seed: number,
  bars = 2,
  genre: GenrePreset = 'pop'
): LoopBundle {
  const rng = new SeededRandom(seed);

  // Generate single base pattern (drums ignore chords)
  const baseNotes = generateDrumPattern(params, seed, bars);

  const variation: LoopVariation = {
    chordIndex: 0,
    notes: baseNotes,
  };

  // Determine fill positions at chord boundaries
  // Always add a fill before the progression loops (last chord)
  const fillPositions: number[] = [progression.length - 1];

  // Add halfway fill if 4+ chords
  if (progression.length >= 4) {
    const halfwayIndex = Math.floor(progression.length / 2) - 1;
    if (!fillPositions.includes(halfwayIndex)) {
      fillPositions.unshift(halfwayIndex);
    }
  }

  // Add extra fills based on complexity
  if (params.complexity > 0.6 && progression.length >= 6) {
    const quarterIndex = Math.floor(progression.length / 4) - 1;
    const threeQuarterIndex = Math.floor(progression.length * 3 / 4) - 1;
    if (!fillPositions.includes(quarterIndex) && quarterIndex >= 0) {
      fillPositions.push(quarterIndex);
    }
    if (!fillPositions.includes(threeQuarterIndex)) {
      fillPositions.push(threeQuarterIndex);
    }
  }

  // Generate genre-specific fill patterns for each position
  // Each fill goes at the end of the bar (last beat of the variation before the chord change)
  const fillPatterns: Note[][] = fillPositions.map((_, i) => {
    // Fill goes in the last bar of the current chord's variation
    // The bar offset is bars-1 (0-indexed last bar of the variation)
    return generateFill(genre, params.density, seed + i * 100, bars - 1);
  });

  const drumFills: DrumFillPoints = {
    basePattern: baseNotes,
    fillPositions: fillPositions.sort((a, b) => a - b),
    fillPatterns,
  };

  return {
    id: `drums-${seed}`,
    instrument: 'drums',
    seed,
    progressionId: '', // Will be set by caller
    bars,
    generationParams: params,
    variations: [variation],
    drumFills,
  };
}

/**
 * Generate drum pattern using the rhythm pipeline.
 * Uses templates, transformations, dynamics, and groove for genre-authentic patterns.
 */
export function generateDrumPatternWithPipeline(
  params: GenerationParams,
  genre: GenrePreset,
  seed: number,
  bars = 2
): Note[] {
  return processRhythm('drums', genre, params, seed, bars);
}
