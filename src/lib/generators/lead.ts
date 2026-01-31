import type { Note, GenerationParams, ChordDegree, LoopBundle, LoopVariation } from '../types';
import { SeededRandom, getNoteInScale, getChordTonesForDegree, resolveChordDegree } from './theory';

type Contour = 'ascending' | 'descending' | 'arch' | 'flat';

export function generateLead(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const rng = new SeededRandom(seed);
  const stepsPerBar = 16;
  const notes: Note[] = [];
  const octave = 5;

  // Pick contour
  const contours: Contour[] = ['ascending', 'descending', 'arch', 'flat'];
  const contour = rng.pick(contours);

  // Determine note density based on params
  const notesPerBar = Math.floor(2 + params.density * 6);

  for (let bar = 0; bar < bars; bar++) {
    let currentDegree = rng.nextInt(0, 4);
    const barNotes: { step: number; degree: number }[] = [];

    // Generate note positions
    for (let i = 0; i < notesPerBar; i++) {
      const step = Math.floor((i / notesPerBar) * stepsPerBar);

      // Apply contour
      let degreeOffset = 0;
      const progress = i / notesPerBar;

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

      // Add some randomness based on complexity
      if (params.complexity > 0.3) {
        degreeOffset += rng.nextInt(-2, 2);
      }

      barNotes.push({ step, degree: currentDegree + degreeOffset });
    }

    // Create notes
    for (let i = 0; i < barNotes.length; i++) {
      const { step, degree } = barNotes[i];
      const nextStep = barNotes[i + 1]?.step ?? stepsPerBar;

      const time = `${bar}:0:${step * 0.25}`;
      const pitch = getNoteInScale(key, scale, degree, octave);

      // Calculate duration
      const gapSteps = nextStep - step;
      let duration = '8n';
      if (gapSteps >= 8) duration = '4n';
      if (gapSteps >= 4 && gapSteps < 8) duration = '8n';
      if (gapSteps < 4) duration = '16n';

      notes.push({
        pitch,
        time,
        duration,
        velocity: 0.7 + rng.next() * 0.2,
      });
    }
  }

  return notes;
}

/**
 * Generate lead notes for a single chord variation.
 * Emphasizes chord tones on strong beats (step % 4 === 0)
 * and allows passing tones from the scale on weak beats.
 */
function generateLeadVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  rng: SeededRandom,
  bars: number
): Note[] {
  const stepsPerBar = 16;
  const notes: Note[] = [];
  const octave = 5;

  // Get chord tones for this chord degree
  const chordTones = getChordTonesForDegree(chordDegree, key, scale, octave);
  const rootDegree = resolveChordDegree(chordDegree, key, scale);

  // Pick contour
  const contours: Contour[] = ['ascending', 'descending', 'arch', 'flat'];
  const contour = rng.pick(contours);

  // Determine note density based on params
  const notesPerBar = Math.floor(2 + params.density * 6);

  for (let bar = 0; bar < bars; bar++) {
    const barNotes: { step: number; degree: number; isStrongBeat: boolean }[] = [];

    // Generate note positions
    for (let i = 0; i < notesPerBar; i++) {
      const step = Math.floor((i / notesPerBar) * stepsPerBar);
      const isStrongBeat = step % 4 === 0;

      // Apply contour
      let degreeOffset = 0;
      const progress = i / notesPerBar;

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

      // Add some randomness based on complexity
      if (params.complexity > 0.3) {
        degreeOffset += rng.nextInt(-2, 2);
      }

      barNotes.push({ step, degree: degreeOffset, isStrongBeat });
    }

    // Create notes
    for (let i = 0; i < barNotes.length; i++) {
      const { step, degree, isStrongBeat } = barNotes[i];
      const nextStep = barNotes[i + 1]?.step ?? stepsPerBar;

      const time = `${bar}:0:${step * 0.25}`;

      let pitch: string;

      if (isStrongBeat) {
        // On strong beats, use chord tones
        const chordToneIndex = ((degree % chordTones.length) + chordTones.length) % chordTones.length;
        pitch = chordTones[chordToneIndex];
      } else {
        // On weak beats, use scale tones (passing tones)
        const scaleDegree = rootDegree + degree;
        pitch = getNoteInScale(key, scale, scaleDegree, octave);
      }

      // Calculate duration
      const gapSteps = nextStep - step;
      let duration = '8n';
      if (gapSteps >= 8) duration = '4n';
      if (gapSteps >= 4 && gapSteps < 8) duration = '8n';
      if (gapSteps < 4) duration = '16n';

      notes.push({
        pitch,
        time,
        duration,
        velocity: 0.7 + rng.next() * 0.2,
      });
    }
  }

  return notes;
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
  bars = 2
): LoopBundle {
  const variations: LoopVariation[] = [];

  for (let i = 0; i < progression.length; i++) {
    // Create a new RNG for each variation using the same seed offset pattern
    // This ensures reproducibility
    const rng = new SeededRandom(seed + i * 1000);
    const notes = generateLeadVariation(params, key, scale, progression[i], rng, bars);
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
