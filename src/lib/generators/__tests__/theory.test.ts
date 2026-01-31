import { describe, it, expect } from 'vitest';
import { SeededRandom, getNoteInScale, getChordNotes, resolveChordDegree, getChordTonesForDegree } from '../theory';
import type { ChordDegree } from '../../types/music';

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

describe('resolveChordDegree', () => {
  it('resolves I to root note', () => {
    expect(resolveChordDegree('I', 'C', 'major')).toBe(0);
  });

  it('resolves IV to fourth degree', () => {
    expect(resolveChordDegree('IV', 'C', 'major')).toBe(3);
  });

  it('resolves vi to sixth degree', () => {
    expect(resolveChordDegree('vi', 'C', 'major')).toBe(5);
  });

  it('resolves ii7 to second degree', () => {
    expect(resolveChordDegree('ii7', 'C', 'major')).toBe(1);
  });
});

describe('getChordTonesForDegree', () => {
  it('returns triad tones for I in C major', () => {
    const tones = getChordTonesForDegree('I', 'C', 'major', 4);
    expect(tones).toContain('C4');
    expect(tones).toContain('E4');
    expect(tones).toContain('G4');
  });

  it('returns 7th chord tones for Imaj7', () => {
    const tones = getChordTonesForDegree('Imaj7', 'C', 'major', 4);
    expect(tones.length).toBe(4);
    expect(tones).toContain('B4');
  });

  it('returns minor triad for vi', () => {
    const tones = getChordTonesForDegree('vi', 'C', 'major', 4);
    expect(tones).toContain('A4');
    expect(tones).toContain('C5');
    expect(tones).toContain('E5');
  });
});
