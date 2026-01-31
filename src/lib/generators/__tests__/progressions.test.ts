import { describe, it, expect } from 'vitest';
import type { ChordDegree, ChordProgression, LoopBundle, LoopVariation, DrumFillPoints } from '../../types/music';
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

describe('LoopBundle types', () => {
  it('accepts valid loop bundle structure', () => {
    const bundle: LoopBundle = {
      id: 'bundle_123',
      instrument: 'bass',
      seed: 12345,
      progressionId: 'pop-classic',
      bars: 2,
      generationParams: { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' },
      variations: [
        { chordIndex: 0, notes: [] },
        { chordIndex: 1, notes: [] },
      ],
    };
    expect(bundle.variations.length).toBe(2);
  });

  it('accepts drum fill points', () => {
    const fills: DrumFillPoints = {
      basePattern: [],
      fillPositions: [3, 7],
      fillPatterns: [[], []],
    };
    expect(fills.fillPositions.length).toBe(2);
  });
});
