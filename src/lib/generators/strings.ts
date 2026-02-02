import type { GenerationParams, Note } from '../types';
import { SeededRandom, getScaleNotes, getChordNotes } from './theory';

// Legato duration map - notes extend past their beat to blend into the next
// This creates overlapping sustains for a smooth, connected sound
const LEGATO_DURATIONS: Record<string, string> = {
  '1n': '1n.',    // Whole note extends to dotted whole (1.5x)
  '2n': '2n.',    // Half note extends to dotted half
  '4n': '4n.',    // Quarter extends to dotted quarter
};

export function generateStrings(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars: number
): Note[] {
  const random = new SeededRandom(seed);
  const notes: Note[] = [];
  const scaleNotes = getScaleNotes(key, scale, 3, 4); // Mid range for strings

  // Strings play long sustained chords, similar to pads but with different rhythms
  const chordDegrees = [
    [0, 2, 4],      // I chord
    [3, 5, 0],      // IV chord
    [4, 6, 1],      // V chord
    [5, 0, 2],      // vi chord
  ];

  // Determine chord rhythm based on density
  const chordsPerBar = params.density < 0.3 ? 1 : params.density < 0.6 ? 2 : 4;

  for (let bar = 0; bar < bars; bar++) {
    for (let chordIndex = 0; chordIndex < chordsPerBar; chordIndex++) {
      const startBeat = chordIndex * (4 / chordsPerBar);

      // Pick a chord
      const degreeSet = chordDegrees[Math.floor(random.next() * chordDegrees.length)];

      // Base duration based on how many chords per bar
      const baseDuration = chordsPerBar === 1 ? '1n' : chordsPerBar === 2 ? '2n' : '4n';

      // Use legato durations for overlapping sustain (notes blend into next chord)
      const duration = LEGATO_DURATIONS[baseDuration] || baseDuration;

      // Add slight humanization to velocity
      const baseVelocity = 0.4 + params.density * 0.2;

      for (const degree of degreeSet) {
        const noteIndex = degree % scaleNotes.length;
        const pitch = scaleNotes[noteIndex];
        const velocity = baseVelocity + (random.next() * 0.15 - 0.075);

        notes.push({
          pitch,
          time: `${bar}:${Math.floor(startBeat)}:${(startBeat % 1) * 4}`,
          duration,
          velocity: Math.max(0.2, Math.min(0.9, velocity)),
        });
      }
    }
  }

  return notes;
}
