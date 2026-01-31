// src/lib/generators/rhythm/__tests__/transformations.test.ts
import { describe, it, expect } from 'vitest';
import { applyTransformation, getTransformationRules } from '../transformations';
import type { TemplateStep } from '../types';
import { SeededRandom } from '../../theory';

describe('transformations', () => {
  const baseSteps: TemplateStep[] = [
    { position: 0, velocity: 0.9, duration: '8n', accent: true },
    { position: 4, velocity: 0.8, duration: '8n' },
    { position: 8, velocity: 0.9, duration: '8n' },
    { position: 12, velocity: 0.8, duration: '8n' },
  ];

  it('should apply shift transformation', () => {
    const rng = new SeededRandom(42);
    const shifted = applyTransformation(baseSteps, 'shift', rng, { preserveDownbeats: true });
    // Downbeat at 0 should be preserved
    expect(shifted.some(s => s.position === 0)).toBe(true);
  });

  it('should apply ghost transformation', () => {
    const rng = new SeededRandom(42);
    const ghosted = applyTransformation(baseSteps, 'ghost', rng, {});
    // Should add ghost notes
    expect(ghosted.length).toBeGreaterThanOrEqual(baseSteps.length);
    const ghosts = ghosted.filter(s => s.ghost);
    expect(ghosts.length).toBeGreaterThan(0);
  });

  it('should apply omit transformation', () => {
    const rng = new SeededRandom(42);
    const omitted = applyTransformation(baseSteps, 'omit', rng, { preserveDownbeats: true });
    // Should remove some notes but keep downbeat
    expect(omitted.length).toBeLessThanOrEqual(baseSteps.length);
    expect(omitted.some(s => s.position === 0)).toBe(true);
  });

  it('should apply subdivide transformation', () => {
    const rng = new SeededRandom(42);
    const subdivided = applyTransformation(baseSteps, 'subdivide', rng, {});
    // Should add notes from subdivision
    expect(subdivided.length).toBeGreaterThanOrEqual(baseSteps.length);
  });

  it('should get transformation rules for density/complexity', () => {
    const rules = getTransformationRules(0.7, 0.6);
    expect(rules.length).toBeGreaterThan(0);
    // High density should include subdivide
    expect(rules.some(r => r.type === 'subdivide')).toBe(true);
  });
});
