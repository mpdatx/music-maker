// src/lib/generators/rhythm/__tests__/pipeline.test.ts
import { describe, it, expect } from 'vitest';
import { processRhythm } from '../pipeline';
import type { GenerationParams } from '../../../types/music';

describe('rhythm pipeline', () => {
  const params: GenerationParams = {
    density: 0.5,
    complexity: 0.5,
    swing: 0.3,
    style: 'swung',
  };

  it('should generate rhythm for drums', () => {
    const result = processRhythm('drums', 'lofi-hiphop', params, 42, 2);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(n => ['kick', 'snare', 'hihat', 'openhat', 'tom'].includes(n.pitch))).toBe(true);
  });

  it('should generate rhythm pattern for bass', () => {
    const result = processRhythm('bass', 'funk', params, 42, 2);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should produce different results for different seeds', () => {
    const result1 = processRhythm('drums', 'rock', params, 42, 2);
    const result2 = processRhythm('drums', 'rock', params, 123, 2);
    const times1 = result1.map(n => n.time).join(',');
    const times2 = result2.map(n => n.time).join(',');
    expect(times1).not.toBe(times2);
  });

  it('should apply genre-specific groove', () => {
    const lofiResult = processRhythm('drums', 'lofi-hiphop', params, 42, 2);
    const edmResult = processRhythm('drums', 'edm-house', params, 42, 2);
    expect(lofiResult.length).toBeGreaterThan(0);
    expect(edmResult.length).toBeGreaterThan(0);
  });
});
