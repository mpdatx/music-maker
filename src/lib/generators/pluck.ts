import type { GenerationParams, Note } from '../types';
import { SeededRandom, getScaleNotes } from './theory';

export function generatePluck(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars: number
): Note[] {
  const random = new SeededRandom(seed);
  const notes: Note[] = [];
  const scaleNotes = getScaleNotes(key, scale, 3, 5); // Higher range for pluck
  const stepsPerBar = 16;
  const totalSteps = bars * stepsPerBar;

  // Pluck patterns - rhythmic arpeggiated notes
  for (let step = 0; step < totalSteps; step++) {
    const beat = step % 4;
    const isDownbeat = beat === 0;
    const isOffbeat = beat === 2;

    // Higher density means more notes
    let playChance = params.density * 0.6;
    if (isDownbeat) playChance += 0.2;
    if (isOffbeat) playChance += 0.1;

    // Syncopation for complexity
    if (params.complexity > 0.5 && step % 2 === 1) {
      playChance += params.complexity * 0.15;
    }

    if (random.next() < playChance) {
      const bar = Math.floor(step / stepsPerBar);
      const stepInBar = step % stepsPerBar;

      // Pick notes from scale, favoring arpeggiated movement
      const noteIndex = Math.floor(random.next() * scaleNotes.length);
      const pitch = scaleNotes[noteIndex];

      // Short, plucky durations
      const durations = ['16n', '8n'];
      const duration = durations[Math.floor(random.next() * durations.length)];

      const velocity = 0.5 + random.next() * 0.4;

      notes.push({
        pitch,
        time: `${bar}:${Math.floor(stepInBar / 4)}:${stepInBar % 4}`,
        duration,
        velocity,
      });
    }
  }

  return notes;
}
