import type { Note, GenerationParams, ChordDegree, LoopBundle, LoopVariation, GenrePreset } from '../types';
import { SeededRandom, getNoteInScale, getChordTonesForDegree, resolveChordDegree, positionToTime } from './theory';
import { getRhythmSteps, getGrooveProfile, applyGroove } from './rhythm';

type Contour = 'ascending' | 'descending' | 'arch' | 'flat';

export function generateLead(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2,
  genre: GenrePreset = 'pop'
): Note[] {
  const bundle = generateLeadBundle(params, key, scale, ['I'], seed, bars, genre);
  return bundle.variations[0].notes;
}

/**
 * Generate lead notes for a single chord variation using the rhythm pipeline.
 * Emphasizes chord tones on strong beats and allows passing tones on weak beats.
 * The pipeline provides rhythm positions with dynamics; this function adds melodic contour.
 */
function generateLeadVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  genre: GenrePreset,
  seed: number,
  bars: number
): Note[] {
  const notes: Note[] = [];
  const octave = 5;
  const rng = new SeededRandom(seed);

  // Get chord tones for this chord degree
  const chordTones = getChordTonesForDegree(chordDegree, key, scale, octave);
  const rootDegree = resolveChordDegree(chordDegree, key, scale);

  // Pick contour
  const contours: Contour[] = ['ascending', 'descending', 'arch', 'flat'];
  const contour = rng.pick(contours);

  // Get rhythm steps from the pipeline
  const steps = getRhythmSteps('lead', genre, params, seed);

  for (let bar = 0; bar < bars; bar++) {
    // Apply contour to the rhythm steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const time = positionToTime(bar, step.position);
      const isStrongBeat = step.position % 4 === 0;

      // Calculate contour-based degree offset
      const progress = i / steps.length;
      let degreeOffset = 0;

      switch (contour) {
        case 'ascending':
          degreeOffset = Math.floor(progress * 4);
          break;
        case 'descending':
          degreeOffset = Math.floor((1 - progress) * 4);
          break;
        case 'arch':
          degreeOffset = Math.floor(Math.sin(progress * Math.PI) * 4);
          break;
        case 'flat':
          degreeOffset = 0;
          break;
      }

      // Add randomness based on complexity
      if (params.complexity > 0.3) {
        degreeOffset += rng.nextInt(-2, 2);
      }

      // Ghost notes tend to be chromatic passing tones
      if (step.ghost) {
        degreeOffset += rng.pick([-1, 1]);
      }

      let pitch: string;

      if (isStrongBeat || step.accent) {
        // On strong beats or accented notes, use chord tones
        const chordToneIndex = ((degreeOffset % chordTones.length) + chordTones.length) % chordTones.length;
        pitch = chordTones[chordToneIndex];
      } else {
        // On weak beats, use scale tones (passing tones)
        const scaleDegree = rootDegree + degreeOffset;
        pitch = getNoteInScale(key, scale, scaleDegree, octave);
      }

      notes.push({
        pitch,
        time,
        duration: step.duration,
        velocity: step.velocity,
      });
    }
  }

  // Apply groove
  const grooveProfile = getGrooveProfile(genre);
  return applyGroove(notes, grooveProfile);
}

/**
 * Generate a LoopBundle with one variation per chord in the progression.
 * Lead melodies emphasize chord tones on strong beats and allow
 * passing tones from the scale on weak beats.
 */
export function generateLeadBundle(
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
    const notes = generateLeadVariation(params, key, scale, progression[i], genre, variationSeed, bars);
    variations.push({
      chordIndex: i,
      notes,
    });
  }

  return {
    id: `lead-${seed}`,
    instrument: 'lead',
    seed,
    progressionId: '', // Will be set by caller
    bars,
    generationParams: params,
    variations,
  };
}
