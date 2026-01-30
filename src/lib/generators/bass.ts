import type { Note, GenerationParams } from '../types';
import { SeededRandom, getNoteInScale } from './theory';

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

export function generateBassLine(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const rng = new SeededRandom(seed);
  const stepsPerBar = 16;
  const notes: Note[] = [];
  const octave = 2;

  // Pick base pattern
  const pattern = rng.pick(BASS_PATTERNS);

  for (let bar = 0; bar < bars; bar++) {
    // Simple chord progression: I - IV - V - I or similar
    const chordDegrees = [0, 3, 4, 0];
    const barDegree = chordDegrees[bar % 4];

    for (const step of pattern) {
      const time = `${bar}:0:${step * 0.25}`;

      // Root note most of the time
      let degree = barDegree;

      // Add variation based on complexity
      if (params.complexity > 0.3 && rng.chance(params.complexity * 0.4)) {
        // Sometimes play fifth or octave
        degree += rng.pick([0, 4, 7]);
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
          const degree = barDegree + rng.pick([0, 2, 4]);
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
