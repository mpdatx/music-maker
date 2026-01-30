import type { Note, GenerationParams } from '../types';
import { SeededRandom, getChordNotes } from './theory';

export function generatePad(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const rng = new SeededRandom(seed);
  const notes: Note[] = [];
  const octave = 4;

  // Pads are typically sustained chords
  // Change chord every bar or every 2 bars
  const changeEvery = params.complexity > 0.5 ? 1 : 2;

  const progression = [0, 3, 4, 0];

  for (let bar = 0; bar < bars; bar += changeEvery) {
    const degree = progression[(bar / changeEvery) % progression.length];
    const chordNotes = getChordNotes(key, scale, degree, octave);

    const time = `${bar}:0:0`;
    const duration = changeEvery === 1 ? '1m' : '2m';

    // Add chord notes with slight timing offset for richness
    for (let i = 0; i < chordNotes.length; i++) {
      const offset = params.complexity > 0.3 ? i * 0.01 : 0;
      notes.push({
        pitch: chordNotes[i],
        time: bar === 0 && i === 0 ? time : `${bar}:0:${offset}`,
        duration,
        velocity: 0.4 + rng.next() * 0.1,
      });
    }

    // Add higher octave for airiness based on density
    if (params.density > 0.6) {
      const highNote = chordNotes[0].replace(/\d/, (d) => String(parseInt(d) + 1));
      notes.push({
        pitch: highNote,
        time,
        duration,
        velocity: 0.3,
      });
    }
  }

  return notes;
}
