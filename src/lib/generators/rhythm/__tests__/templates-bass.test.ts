// src/lib/generators/rhythm/__tests__/templates-bass.test.ts
import { describe, it, expect } from 'vitest';
import { getBassTemplates, getBassTemplatesByEnergy } from '../templates/bass';

describe('bass templates', () => {
  it('should have templates for each genre', () => {
    const genres = ['lofi-hiphop', 'edm-house', 'rock', 'funk', 'pop', 'ambient'] as const;
    for (const genre of genres) {
      const templates = getBassTemplates(genre);
      expect(templates.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('should have energy levels represented', () => {
    const templates = getBassTemplates('funk');
    const energyLevels = new Set(templates.map(t => t.energyLevel));
    expect(energyLevels.size).toBeGreaterThanOrEqual(2);
  });

  it('should filter by energy level', () => {
    const highTemplates = getBassTemplatesByEnergy('edm-house', 'high');
    expect(highTemplates.every(t => t.energyLevel === 'high')).toBe(true);
  });
});
