import type { ChordDegree } from '../types/music';

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Convert note name to MIDI number
export function noteToMidi(note: string): number {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 60; // Default to C4
  const [, noteName, octaveStr] = match;
  const noteIndex = NOTES.indexOf(noteName);
  if (noteIndex === -1) return 60;
  const octave = parseInt(octaveStr, 10);
  return (octave + 1) * 12 + noteIndex;
}

// Convert MIDI number to note name
export function midiToNote(midi: number): string {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTES[noteIndex]}${octave}`;
}

// Clamp MIDI note to range by transposing octaves
export function clampNoteToRange(note: string, minMidi: number, maxMidi: number): string {
  let midi = noteToMidi(note);

  // Transpose by octaves until within range
  while (midi < minMidi) {
    midi += 12;
  }
  while (midi > maxMidi) {
    midi -= 12;
  }

  // If still out of range (e.g., range is less than an octave), clamp
  if (midi < minMidi) midi = minMidi;
  if (midi > maxMidi) midi = maxMidi;

  return midiToNote(midi);
}

// Sample MIDI notes for sparse instruments (to quantize generated notes)
// Only include instruments with gaps > 3 semitones between samples
export const SPARSE_INSTRUMENT_SAMPLES: Record<string, number[]> = {
  'xylophone': [67, 72, 79, 84, 91, 96, 103, 108], // G4, C5, G5, C6, G6, C7, G7, C8
  'flute': [60, 64, 69, 72, 76, 81, 84, 88, 93, 96], // C4, E4, A4, C5, E5, A5, C6, E6, A6, C7
  'clarinet': [50, 53, 58, 62, 65, 70, 74, 77, 82, 86, 90], // D3, F3, A#3, D4, F4, A#4, D5, F5, A#5, D6, F#6
  'violin': [55, 57, 60, 64, 67, 69, 72, 76, 79, 81, 84, 88, 91, 93, 96], // G3, A3, C4, E4, G4, A4, C5, E5, G5, A5, C6, E6, G6, A6, C7
  'trumpet': [53, 57, 60, 63, 65, 67, 70, 74, 77, 81, 84], // F3, A3, C4, D#4, F4, G4, A#4, D5, F5, A5, C6
  'french-horn': [33, 36, 39, 43, 50, 53, 57, 60, 74, 77], // A1, C2, D#2, G2, D3, F3, A3, C4, D5, F5
  'tuba': [29, 34, 39, 41, 46, 50, 53, 58, 62], // F1, A#1, D#2, F2, A#2, D3, F3, A#3, D4
  'harp': [28, 31, 35, 38, 41, 45, 48, 52, 55, 59, 62, 65, 69, 72, 76, 79, 83, 86, 89, 93, 95, 98, 101], // various
  'contrabass': [30, 31, 34, 36, 38, 40, 42, 44, 45, 49, 52, 56, 59], // F#1, G1, A#1, C2, D2, E2, F#2, G#2, A2, C#3, E3, G#3, B3
};

// Quantize a MIDI note to the nearest available sample note
export function quantizeToNearestSample(midi: number, sampleNotes: number[]): number {
  if (sampleNotes.length === 0) return midi;

  let closest = sampleNotes[0];
  let minDist = Math.abs(midi - closest);

  for (const sampleNote of sampleNotes) {
    const dist = Math.abs(midi - sampleNote);
    if (dist < minDist) {
      minDist = dist;
      closest = sampleNote;
    }
  }

  return closest;
}

// Clamp note to range for sampled instruments
// Note: Tone.Sampler automatically pitch-shifts between sample points,
// so we only need to ensure notes are within the instrument's playable range
export function clampAndQuantizeNote(note: string, minMidi: number, maxMidi: number, _instrumentType: string): string {
  let midi = noteToMidi(note);

  // Transpose by octaves until within range
  while (midi < minMidi) {
    midi += 12;
  }
  while (midi > maxMidi) {
    midi -= 12;
  }

  // Clamp if still out of range
  if (midi < minMidi) midi = minMidi;
  if (midi > maxMidi) midi = maxMidi;

  return midiToNote(midi);
}

// Check if a note is available for a given instrument
// Returns true for synth instruments (always available) or sampled instruments with that sample
export function isNoteAvailableForInstrument(
  note: string,
  instrumentType: string,
  instrumentRanges: Record<string, [number, number]>
): boolean {
  const range = instrumentRanges[instrumentType];
  if (!range) return true; // Synth instruments have no restrictions

  const midi = noteToMidi(note);
  const [minMidi, maxMidi] = range;

  // First check if within overall range
  if (midi < minMidi || midi > maxMidi) return false;

  // For sparse instruments, also check if this specific note has a sample
  const sparseNotes = SPARSE_INSTRUMENT_SAMPLES[instrumentType];
  if (sparseNotes) {
    return sparseNotes.includes(midi);
  }

  return true;
}

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

const DEGREE_MAP: Record<string, number> = {
  // Major scale triads
  'I': 0, 'ii': 1, 'iii': 2, 'IV': 3, 'V': 4, 'vi': 5, 'vii°': 6,
  // Minor scale triads
  'i': 0, 'iv': 3, 'v': 4,
  // Borrowed/modal chords (major quality on typically minor degrees)
  'III': 2, 'VI': 5, 'VII': 6,
  // Major 7th chords
  'Imaj7': 0, 'IVmaj7': 3,
  // Minor 7th chords
  'ii7': 1, 'iii7': 2, 'vi7': 5, 'i7': 0, 'iv7': 3,
  // Dominant 7th chords
  'V7': 4, 'I7': 0, 'IV7': 3,
  // Diminished
  'vii7b5': 6,
};

export function resolveChordDegree(degree: ChordDegree, _key: string, _scale: string): number {
  const baseDegree = DEGREE_MAP[degree];
  if (baseDegree === undefined) {
    throw new Error(`Unknown chord degree: ${degree}`);
  }
  return baseDegree;
}

export function isSeventhChord(degree: ChordDegree): boolean {
  return degree.includes('7');
}

export function getChordTonesForDegree(
  degree: ChordDegree,
  key: string,
  scale: string,
  octave: number
): string[] {
  const scaleDegree = resolveChordDegree(degree, key, scale);
  const tones = getChordNotes(key, scale, scaleDegree, octave);

  if (isSeventhChord(degree)) {
    // Add 7th
    tones.push(getNoteInScale(key, scale, scaleDegree + 6, octave));
  }

  return tones;
}

// Convert a 16th-note position (0-15) within a bar to Tone.js time format
export function positionToTime(bar: number, position: number): string {
  const beat = Math.floor(position / 4);
  const sixteenth = position % 4;
  return `${bar}:${beat}:${sixteenth}`;
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
