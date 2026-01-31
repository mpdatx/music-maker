import type { Note, GenerationParams, ChordDegree, LoopBundle, LoopVariation, GenrePreset } from '../types';
import { SeededRandom, getChordNotes, getChordTonesForDegree } from './theory';
import { getArticulationProfile, getGrooveProfile, applyGroove } from './rhythm';

export function generatePad(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2,
  genre: GenrePreset = 'electronic'
): Note[] {
  const bundle = generatePadBundle(params, key, scale, ['I'], seed, bars, genre);
  return bundle.variations[0].notes;
}

/**
 * Generate pad notes for a single chord variation.
 * Pads are sustained chords that provide harmonic foundation.
 * Uses articulation profile for velocity dynamics.
 */
function generatePadVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  genre: GenrePreset,
  seed: number,
  bars: number
): Note[] {
  const notes: Note[] = [];
  const octave = 4;
  const rng = new SeededRandom(seed);

  // Get articulation profile for velocity range
  const artProfile = getArticulationProfile(genre);
  const [velMin, velMax] = artProfile.velocityRange;
  const padVelRange = [(velMin + velMax) / 2 * 0.6, (velMin + velMax) / 2 * 0.8]; // Pads are softer

  // Get chord tones for this degree
  const chordNotes = getChordTonesForDegree(chordDegree, key, scale, octave);

  // Pads are sustained - use long durations
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
      velocity: padVelRange[0] + rng.next() * (padVelRange[1] - padVelRange[0]),
    });
  }

  // Add octave doubling for density (adds airiness)
  if (params.density > 0.6 && chordNotes.length > 0) {
    const highNote = chordNotes[0].replace(/\d/, (d) => String(parseInt(d) + 1));
    notes.push({
      pitch: highNote,
      time: '0:0:0',
      duration,
      velocity: padVelRange[0] * 0.8,
    });
  }

  // For higher complexity, add movement within the sustained chord
  if (params.complexity > 0.7 && bars >= 2) {
    const halfwayTime = '1:0:0';
    const secondDuration = '1m';

    for (let i = 0; i < chordNotes.length; i++) {
      const offset = params.complexity > 0.3 ? i * 0.01 : 0;
      const time = i === 0 ? halfwayTime : `1:0:${offset}`;

      notes.push({
        pitch: chordNotes[i],
        time,
        duration: secondDuration,
        velocity: padVelRange[0] * 0.9 + rng.next() * (padVelRange[1] - padVelRange[0]) * 0.5,
      });
    }
  }

  // Apply groove for subtle timing humanization
  const grooveProfile = getGrooveProfile(genre);
  return applyGroove(notes, grooveProfile);
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
  bars = 2,
  genre: GenrePreset = 'electronic'
): LoopBundle {
  const variations: LoopVariation[] = [];

  for (let i = 0; i < progression.length; i++) {
    // Use offset seed for each variation to ensure reproducibility
    const variationSeed = seed + i * 1000;
    const notes = generatePadVariation(params, key, scale, progression[i], genre, variationSeed, bars);
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
