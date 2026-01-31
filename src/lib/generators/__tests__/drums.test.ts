import { describe, it, expect } from 'vitest';
import { generateDrumBundle } from '../drums';
import type { ChordDegree } from '../../types/music';

describe('generateDrumBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const progression: ChordDegree[] = ['I', 'V', 'vi', 'IV'];

  it('generates a single base pattern (drums ignore chords)', () => {
    const bundle = generateDrumBundle(params, progression, 12345, 2);
    // Drums have one variation (they don't change with chords)
    expect(bundle.variations.length).toBe(1);
  });

  it('includes drum fill points for chord boundaries', () => {
    const bundle = generateDrumBundle(params, progression, 12345, 2);
    expect(bundle.drumFills).toBeDefined();
    expect(bundle.drumFills!.fillPositions.length).toBeGreaterThan(0);
  });

  it('fill positions align with progression length', () => {
    const bundle = generateDrumBundle(params, progression, 12345, 2);
    // Last chord should have a fill before looping
    expect(bundle.drumFills!.fillPositions).toContain(progression.length - 1);
  });

  it('is reproducible with same seed', () => {
    const bundle1 = generateDrumBundle(params, progression, 12345, 2);
    const bundle2 = generateDrumBundle(params, progression, 12345, 2);
    expect(bundle1.variations[0].notes).toEqual(bundle2.variations[0].notes);
  });
});
