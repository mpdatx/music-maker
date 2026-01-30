import type { Note, GenerationParams } from '../types';
import { SeededRandom, getNoteInScale } from './theory';

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
