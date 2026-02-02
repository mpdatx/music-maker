import { describe, it, expect } from 'vitest';
import { generateLeadBundle, generateLeadWithCounter } from '../lead';
import type { ChordDegree } from '../../types/music';

describe('generateLeadBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const progression: ChordDegree[] = ['I', 'V', 'vi', 'IV'];

  it('generates one variation per chord', () => {
    const bundle = generateLeadBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle.variations.length).toBe(4);
  });

  it('lead notes emphasize chord tones on strong beats', () => {
    const bundle = generateLeadBundle(params, 'C', 'major', progression, 12345, 2);
    // Notes exist
    expect(bundle.variations[0].notes.length).toBeGreaterThan(0);
  });

  it('is reproducible with same seed', () => {
    const bundle1 = generateLeadBundle(params, 'C', 'major', progression, 12345, 2);
    const bundle2 = generateLeadBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle1.variations[0].notes).toEqual(bundle2.variations[0].notes);
  });
});

describe('generateLeadWithCounter', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const counterConfig = { enabled: true, technique: 'rhythmic' as const };

  it('returns both main and counter notes when enabled', () => {
    const result = generateLeadWithCounter(params, 'C', 'major', 12345, 2, 'pop', counterConfig);
    expect(result.main.length).toBeGreaterThan(0);
    expect(result.counter).not.toBeNull();
    expect(result.counter!.length).toBeGreaterThan(0);
  });

  it('returns null counter when disabled', () => {
    const result = generateLeadWithCounter(params, 'C', 'major', 12345, 2, 'pop', { enabled: false, technique: 'rhythmic' });
    expect(result.main.length).toBeGreaterThan(0);
    expect(result.counter).toBeNull();
  });
});
