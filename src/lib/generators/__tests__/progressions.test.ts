import { describe, it, expect } from 'vitest';
import type { ChordDegree, ChordProgression } from '../../types/music';
import { getProgressionsForGenre, getDefaultProgression, PROGRESSIONS } from '../progressions';

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

describe('Progression Library', () => {
  it('has progressions for all genres', () => {
    const genres = ['lofi-hiphop', 'edm-house', 'rock', 'ambient', 'funk', 'pop'] as const;
    for (const genre of genres) {
      const progs = getProgressionsForGenre(genre);
      expect(progs.length).toBeGreaterThan(0);
    }
  });

  it('returns default progression for genre', () => {
    const prog = getDefaultProgression('pop');
    expect(prog.isDefault).toBe(true);
    expect(prog.genre).toBe('pop');
  });

  it('includes Free progression for each genre', () => {
    const prog = getProgressionsForGenre('pop').find(p => p.id.includes('free'));
    expect(prog).toBeDefined();
    expect(prog!.chords.length).toBe(1);
  });

  it('lofi-hiphop has 8-chord progressions', () => {
    const prog = getDefaultProgression('lofi-hiphop');
    expect(prog.chords.length).toBe(8);
  });

  it('edm-house has 4-chord progressions', () => {
    const prog = getDefaultProgression('edm-house');
    expect(prog.chords.length).toBe(4);
  });
});
