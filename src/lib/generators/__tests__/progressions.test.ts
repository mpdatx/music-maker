import { describe, it, expect } from 'vitest';
import type { ChordDegree, ChordProgression } from '../../types/music';

describe('ChordProgression types', () => {
  it('accepts valid chord degrees', () => {
    const degrees: ChordDegree[] = ['I', 'IV', 'V', 'vi'];
    expect(degrees.length).toBe(4);
  });

  it('accepts valid progression structure', () => {
    const progression: ChordProgression = {
      id: 'classic-pop',
      name: 'Classic Pop',
      genre: 'pop',
      chords: ['I', 'V', 'vi', 'IV'],
      isDefault: true,
    };
    expect(progression.chords.length).toBe(4);
  });
});
