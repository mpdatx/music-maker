import { describe, it, expect } from 'vitest';
import { generateBassBundle } from '../bass';
import type { ChordDegree } from '../../types/music';

describe('generateBassBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const progression: ChordDegree[] = ['I', 'V', 'vi', 'IV'];

  it('generates one variation per chord', () => {
    const bundle = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle.variations.length).toBe(progression.length);
  });

  it('each variation has chord index', () => {
    const bundle = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    bundle.variations.forEach((v, i) => {
      expect(v.chordIndex).toBe(i);
    });
  });

  it('variations contain notes', () => {
    const bundle = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    bundle.variations.forEach(v => {
      expect(v.notes.length).toBeGreaterThan(0);
    });
  });

  it('is reproducible with same seed', () => {
    const bundle1 = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    const bundle2 = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle1.variations[0].notes).toEqual(bundle2.variations[0].notes);
  });

  it('variations use appropriate root notes for each chord', () => {
    const bundle = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    // First variation (I) should emphasize C
    const firstNotes = bundle.variations[0].notes.map(n => n.pitch);
    expect(firstNotes.some(p => p.startsWith('C'))).toBe(true);

    // Fourth variation (IV) should emphasize F
    const fourthNotes = bundle.variations[3].notes.map(n => n.pitch);
    expect(fourthNotes.some(p => p.startsWith('F'))).toBe(true);
  });
});
