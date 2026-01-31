export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic: [0, 2, 4, 7, 9],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

export function getScaleNotes(root: string, scale: string, startOctave: number, endOctave?: number): string[] {
  const rootIndex = NOTES.indexOf(root);
  if (rootIndex === -1) return [];

  const intervals = SCALES[scale] || SCALES.major;
  const notes: string[] = [];

  const octaveEnd = endOctave ?? startOctave;

  for (let octave = startOctave; octave <= octaveEnd; octave++) {
    for (const interval of intervals) {
      const noteIndex = (rootIndex + interval) % 12;
      const noteOctave = octave + Math.floor((rootIndex + interval) / 12);
      notes.push(`${NOTES[noteIndex]}${noteOctave}`);
    }
  }

  return notes;
}

export function getNoteInScale(root: string, scale: string, degree: number, octave: number): string {
  const notes = getScaleNotes(root, scale, octave);
  const adjustedDegree = ((degree % notes.length) + notes.length) % notes.length;
  const octaveOffset = Math.floor(degree / notes.length);
  const note = notes[adjustedDegree];
  // Adjust octave if degree went up/down
  const baseNote = note.slice(0, -1);
  const baseOctave = parseInt(note.slice(-1));
  return `${baseNote}${baseOctave + octaveOffset}`;
}

export function getChordNotes(root: string, scale: string, degree: number, octave: number): string[] {
  // Triad: root, third, fifth
  return [
    getNoteInScale(root, scale, degree, octave),
    getNoteInScale(root, scale, degree + 2, octave),
    getNoteInScale(root, scale, degree + 4, octave),
  ];
}

// Seeded random number generator for reproducible patterns
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }
}
