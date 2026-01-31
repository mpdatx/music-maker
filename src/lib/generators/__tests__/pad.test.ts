import { describe, it, expect } from 'vitest';
import { generatePadBundle } from '../pad';
import type { ChordDegree } from '../../types/music';

describe('generatePadBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const progression: ChordDegree[] = ['I', 'V', 'vi', 'IV'];

  it('generates one variation per chord', () => {
    const bundle = generatePadBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle.variations.length).toBe(4);
  });

  it('pad notes are sustained', () => {
    const bundle = generatePadBundle(params, 'C', 'major', progression, 12345, 2);
    const notes = bundle.variations[0].notes;
    // Pads should have long durations
    expect(notes.some(n => n.duration === '1m' || n.duration === '2n')).toBe(true);
  });

  it('is reproducible with same seed', () => {
    const bundle1 = generatePadBundle(params, 'C', 'major', progression, 12345, 2);
    const bundle2 = generatePadBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle1.variations[0].notes).toEqual(bundle2.variations[0].notes);
  });
});
