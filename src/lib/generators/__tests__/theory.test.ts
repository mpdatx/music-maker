import { describe, it, expect } from 'vitest';
import { SeededRandom, getNoteInScale, getChordNotes } from '../theory';

describe('SeededRandom', () => {
  it('produces reproducible results with same seed', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);

    expect(rng1.next()).toBe(rng2.next());
    expect(rng1.next()).toBe(rng2.next());
  });
});

describe('getNoteInScale', () => {
  it('returns correct note for degree 0 in C major', () => {
    expect(getNoteInScale('C', 'major', 0, 4)).toBe('C4');
  });

  it('returns correct note for degree 4 (fifth) in C major', () => {
    expect(getNoteInScale('C', 'major', 4, 4)).toBe('G4');
  });
});

describe('getChordNotes', () => {
  it('returns triad for C major chord', () => {
    const notes = getChordNotes('C', 'major', 0, 4);
    expect(notes).toEqual(['C4', 'E4', 'G4']);
  });
});
