import type { Note, GenerationParams, ChordDegree, LoopBundle, LoopVariation, DrumFillPoints } from '../types';
import { SeededRandom } from './theory';

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

// Fill patterns for drum fills at chord boundaries
const FILL_PATTERNS: Note[][] = [
  // Snare fill - 16th notes building up
  [
    { pitch: 'snare', time: '0:0:3', duration: '16n', velocity: 0.6 },
    { pitch: 'snare', time: '0:0:3.25', duration: '16n', velocity: 0.65 },
    { pitch: 'snare', time: '0:0:3.5', duration: '16n', velocity: 0.7 },
    { pitch: 'snare', time: '0:0:3.75', duration: '16n', velocity: 0.8 },
  ],
  // Tom fill - descending
  [
    { pitch: 'tom', time: '0:0:3', duration: '16n', velocity: 0.7 },
    { pitch: 'tom', time: '0:0:3.25', duration: '16n', velocity: 0.7 },
    { pitch: 'snare', time: '0:0:3.5', duration: '16n', velocity: 0.75 },
    { pitch: 'kick', time: '0:0:3.75', duration: '16n', velocity: 0.85 },
  ],
  // Kick-snare combo
  [
    { pitch: 'kick', time: '0:0:3', duration: '16n', velocity: 0.8 },
    { pitch: 'snare', time: '0:0:3.25', duration: '16n', velocity: 0.7 },
    { pitch: 'kick', time: '0:0:3.5', duration: '16n', velocity: 0.8 },
    { pitch: 'snare', time: '0:0:3.75', duration: '16n', velocity: 0.85 },
  ],
  // Simple crash
  [
    { pitch: 'snare', time: '0:0:3.5', duration: '8n', velocity: 0.75 },
    { pitch: 'openhat', time: '0:0:3.75', duration: '8n', velocity: 0.9 },
  ],
];

/**
 * Generate a LoopBundle for drums with fill support
 * Drums don't change with chord progressions, but they add fills at chord boundaries
 */
export function generateDrumBundle(
  params: GenerationParams,
  progression: ChordDegree[],
  seed: number,
  bars = 2
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

  // Pick fill patterns for each position
  const fillPatterns: Note[][] = fillPositions.map(() => rng.pick(FILL_PATTERNS));

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
