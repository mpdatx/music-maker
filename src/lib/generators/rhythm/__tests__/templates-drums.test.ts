// src/lib/generators/rhythm/__tests__/templates-drums.test.ts
import { describe, it, expect } from 'vitest';
import { getDrumTemplates, getDrumTemplatesByEnergy } from '../templates/drums';

describe('drum templates', () => {
  it('should have templates for each genre', () => {
    const genres = ['lofi-hiphop', 'edm-house', 'rock', 'funk', 'pop', 'ambient'] as const;
    for (const genre of genres) {
      const templates = getDrumTemplates(genre);
      expect(templates.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('should have low/mid/high energy templates per genre', () => {
    const templates = getDrumTemplates('rock');
    const low = templates.filter(t => t.energyLevel === 'low');
    const mid = templates.filter(t => t.energyLevel === 'mid');
    const high = templates.filter(t => t.energyLevel === 'high');
    expect(low.length).toBeGreaterThanOrEqual(1);
    expect(mid.length).toBeGreaterThanOrEqual(2);
    expect(high.length).toBeGreaterThanOrEqual(1);
  });

  it('should filter by energy level', () => {
    const midTemplates = getDrumTemplatesByEnergy('funk', 'mid');
    expect(midTemplates.every(t => t.energyLevel === 'mid')).toBe(true);
  });

  it('should have valid step positions (0-15)', () => {
    const templates = getDrumTemplates('lofi-hiphop');
    for (const template of templates) {
      for (const step of template.steps) {
        expect(step.position).toBeGreaterThanOrEqual(0);
        expect(step.position).toBeLessThanOrEqual(15);
      }
    }
  });
});
