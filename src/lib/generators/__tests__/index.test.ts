import { describe, it, expect } from 'vitest';
import { generateLoopBundle, getDefaultProgression } from '../index';

describe('generateLoopBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };

  it('generates bundle for bass with chord variations', () => {
    const bundle = generateLoopBundle('bass', params, 'C', 'major', 'pop', 12345);
    expect(bundle.variations.length).toBeGreaterThan(0);
    expect(bundle.instrument).toBe('bass');
  });

  it('generates bundle for drums with fills', () => {
    const bundle = generateLoopBundle('drums', params, 'C', 'major', 'pop', 12345);
    expect(bundle.drumFills).toBeDefined();
  });

  it('uses genre-specific progression', () => {
    const bundle = generateLoopBundle('bass', params, 'C', 'major', 'lofi-hiphop', 12345);
    // Lofi has 8-chord progressions
    expect(bundle.variations.length).toBe(8);
  });

  it('sets progressionId on bundle', () => {
    const bundle = generateLoopBundle('bass', params, 'C', 'major', 'pop', 12345);
    expect(bundle.progressionId).toBeTruthy();
  });
});

describe('getDefaultProgression', () => {
  it('is exported from index', () => {
    expect(typeof getDefaultProgression).toBe('function');
  });

  it('returns default progression for genre', () => {
    const prog = getDefaultProgression('pop');
    expect(prog.genre).toBe('pop');
    expect(prog.isDefault).toBe(true);
  });
});
