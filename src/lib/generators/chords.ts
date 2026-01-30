import type { Note, GenerationParams } from '../types';
import { SeededRandom, getChordNotes, getNoteInScale } from './theory';

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

const PROGRESSIONS = [
  [0, 3, 4, 4],   // I - IV - V - V
  [0, 5, 3, 4],   // I - vi - IV - V
  [0, 0, 3, 4],   // I - I - IV - V
  [0, 3, 0, 4],   // I - IV - I - V
];

export function generateChords(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const rng = new SeededRandom(seed);
  const notes: Note[] = [];
  const octave = 4;

  // Pick rhythm pattern based on density
  const rhythmIndex = Math.min(
    Math.floor(params.density * CHORD_RHYTHMS.length),
    CHORD_RHYTHMS.length - 1
  );
  const rhythm = CHORD_RHYTHMS[rhythmIndex];

  // Pick chord progression
  const progression = rng.pick(PROGRESSIONS);

  for (let bar = 0; bar < bars; bar++) {
    const degree = progression[bar % progression.length];
    const chordNotes = getChordNotes(key, scale, degree, octave);

    for (const { step, duration } of rhythm) {
      const time = `${bar}:0:${step * 0.25}`;

      // Add all chord notes
      for (const pitch of chordNotes) {
        notes.push({
          pitch,
          time,
          duration,
          velocity: 0.6 + rng.next() * 0.2,
        });
      }

      // Add 7th for complexity
      if (params.complexity > 0.6 && rng.chance(0.5)) {
        const seventh = getNoteInScale(key, scale, degree + 6, octave);
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
