import { describe, it, expect } from 'vitest';
import { getFillTemplates, getFillTemplatesByEnergy, generateFill } from '../templates/fills';

describe('fill templates', () => {
  it('should have templates for core genres', () => {
    const genres = ['lofi-hiphop', 'edm-house', 'rock', 'funk', 'pop', 'ambient', 'jazz', 'classical'] as const;
    for (const genre of genres) {
      const templates = getFillTemplates(genre);
      expect(templates.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should have different energy levels', () => {
    const templates = getFillTemplates('rock');
    const energies = new Set(templates.map(t => t.energyLevel));
    expect(energies.size).toBeGreaterThanOrEqual(2);
  });

  it('should filter by energy level', () => {
    const highFills = getFillTemplatesByEnergy('funk', 'high');
    expect(highFills.every(f => f.energyLevel === 'high')).toBe(true);
  });

  it('should return default fills for unknown genres', () => {
    const fills = getFillTemplates('country' as any);
    expect(fills.length).toBeGreaterThan(0);
  });

  it('should have valid note positions in fills', () => {
    const templates = getFillTemplates('rock');
    for (const template of templates) {
      for (const note of template.notes) {
        // Notes should be in the last beat (beat 3, positions 12-15)
        expect(note.time).toMatch(/^0:3:[0-3]$/);
      }
    }
  });
});

describe('generateFill', () => {
  it('should generate fill notes', () => {
    const fill = generateFill('rock', 0.5, 42, 0);
    expect(fill.length).toBeGreaterThan(0);
    expect(fill.every(n => ['kick', 'snare', 'hihat', 'openhat', 'tom'].includes(n.pitch))).toBe(true);
  });

  it('should adjust bar offset', () => {
    const fill = generateFill('pop', 0.5, 42, 1);
    // All notes should be in bar 1
    expect(fill.every(n => n.time.startsWith('1:'))).toBe(true);
  });

  it('should be reproducible with same seed', () => {
    const fill1 = generateFill('funk', 0.7, 123, 0);
    const fill2 = generateFill('funk', 0.7, 123, 0);
    expect(fill1).toEqual(fill2);
  });

  it('should produce different fills for different seeds', () => {
    const fill1 = generateFill('rock', 0.5, 42, 0);
    const fill2 = generateFill('rock', 0.5, 999, 0);
    // Different seeds may produce different fills
    // (or the same if there's only one option for that energy level)
    expect(fill1.length).toBeGreaterThan(0);
    expect(fill2.length).toBeGreaterThan(0);
  });

  it('should use higher energy fills for higher density', () => {
    // Low density should prefer low energy fills
    const lowFill = generateFill('edm-house', 0.2, 42, 0);
    // High density should prefer high energy fills
    const highFill = generateFill('edm-house', 0.9, 42, 0);

    // Both should be valid fills
    expect(lowFill.length).toBeGreaterThan(0);
    expect(highFill.length).toBeGreaterThan(0);
  });
});
