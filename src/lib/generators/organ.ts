import type { GenerationParams, Note } from '../types';
import { SeededRandom, getScaleNotes } from './theory';

export function generateOrgan(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars: number
): Note[] {
  const random = new SeededRandom(seed);
  const notes: Note[] = [];
  const scaleNotes = getScaleNotes(key, scale, 3, 4);

  // Organ plays sustained chords with rhythmic pumping for funk/gospel feel
  const chordDegrees = [
    [0, 2, 4],      // I chord
    [3, 5, 0],      // IV chord
    [4, 6, 1],      // V chord
    [1, 3, 5],      // ii chord
  ];

  for (let bar = 0; bar < bars; bar++) {
    // Organ rhythm patterns based on style
    const pattern = params.style === 'syncopated'
      ? [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] // pumping 8ths
      : params.style === 'swung'
        ? [0, 1, 2, 3] // quarter note stabs
        : [0, 2]; // half notes

    // Filter pattern by density
    const filteredPattern = pattern.filter(() => random.next() < params.density + 0.3);

    if (filteredPattern.length === 0) {
      filteredPattern.push(0); // Always at least one chord per bar
    }

    // Pick chord for this bar
    const chordIndex = Math.floor(random.next() * chordDegrees.length);
    const degreeSet = chordDegrees[chordIndex];

    for (const beat of filteredPattern) {
      // Duration depends on gap to next note
      const nextBeatIndex = filteredPattern.indexOf(beat) + 1;
      const nextBeat = nextBeatIndex < filteredPattern.length
        ? filteredPattern[nextBeatIndex]
        : 4;
      const gapBeats = nextBeat - beat;
      const duration = gapBeats >= 2 ? '2n' : gapBeats >= 1 ? '4n' : '8n';

      const baseVelocity = 0.5 + params.density * 0.25;

      for (const degree of degreeSet) {
        const noteIndex = degree % scaleNotes.length;
        const pitch = scaleNotes[noteIndex];
        const velocity = baseVelocity + (random.next() * 0.1 - 0.05);

        const beatWhole = Math.floor(beat);
        const beatFraction = beat - beatWhole;

        notes.push({
          pitch,
          time: `${bar}:${beatWhole}:${beatFraction * 4}`,
          duration,
          velocity: Math.max(0.3, Math.min(0.85, velocity)),
        });
      }
    }
  }

  return notes;
}
