import type { Note, GenerationParams, ChordDegree, LoopBundle, LoopVariation } from '../types';
import { SeededRandom, getChordNotes, getChordTonesForDegree } from './theory';

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

/**
 * Generate pad notes for a single chord variation.
 * Pads are sustained chords that provide harmonic foundation.
 */
function generatePadVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  rng: SeededRandom,
  bars: number
): Note[] {
  const notes: Note[] = [];
  const octave = 4;

  // Get chord tones for this degree
  const chordNotes = getChordTonesForDegree(chordDegree, key, scale, octave);

  // Pads are sustained - use long durations
  // For 2 bars, use 2 measures; for 1 bar, use 1 measure
  const duration = bars >= 2 ? '1m' : '2n';

  // Add each note of the chord
  for (let i = 0; i < chordNotes.length; i++) {
    // Slight timing offset for richness based on complexity
    const offset = params.complexity > 0.3 ? i * 0.01 : 0;
    const time = i === 0 ? '0:0:0' : `0:0:${offset}`;

    notes.push({
      pitch: chordNotes[i],
      time,
      duration,
      velocity: 0.4 + rng.next() * 0.1,
    });
  }

  // Add octave doubling for density (adds airiness)
  if (params.density > 0.6 && chordNotes.length > 0) {
    const highNote = chordNotes[0].replace(/\d/, (d) => String(parseInt(d) + 1));
    notes.push({
      pitch: highNote,
      time: '0:0:0',
      duration,
      velocity: 0.3,
    });
  }

  // For higher complexity, add movement within the sustained chord
  if (params.complexity > 0.7 && bars >= 2) {
    // Add a second voicing at the halfway point
    const halfwayTime = '1:0:0';
    const secondDuration = '1m';

    for (let i = 0; i < chordNotes.length; i++) {
      const offset = params.complexity > 0.3 ? i * 0.01 : 0;
      const time = i === 0 ? halfwayTime : `1:0:${offset}`;

      notes.push({
        pitch: chordNotes[i],
        time,
        duration: secondDuration,
        velocity: 0.35 + rng.next() * 0.1,
      });
    }
  }

  return notes;
}

/**
 * Generate a LoopBundle with one variation per chord in the progression.
 * Pads provide sustained harmonic foundation.
 */
export function generatePadBundle(
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
    const notes = generatePadVariation(params, key, scale, progression[i], rng, bars);
    variations.push({
      chordIndex: i,
      notes,
    });
  }

  return {
    id: `pad-${seed}`,
    instrument: 'pad',
    seed,
    progressionId: '', // Will be set by caller
    bars,
    generationParams: params,
    variations,
  };
}
