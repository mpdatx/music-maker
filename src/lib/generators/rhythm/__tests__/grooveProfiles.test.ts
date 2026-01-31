// src/lib/generators/rhythm/__tests__/grooveProfiles.test.ts
import { describe, it, expect } from 'vitest';
import { getGrooveProfile, GROOVE_PROFILES } from '../grooveProfiles';

describe('grooveProfiles', () => {
  it('should return groove profile for each genre', () => {
    const genres = ['lofi-hiphop', 'edm-house', 'rock', 'ambient', 'funk', 'pop'] as const;
    for (const genre of genres) {
      const profile = getGrooveProfile(genre);
      expect(profile.genre).toBe(genre);
      expect(profile.swingAmount).toBeGreaterThanOrEqual(0);
      expect(profile.swingAmount).toBeLessThanOrEqual(1);
    }
  });

  it('should have correct lofi profile values', () => {
    const profile = getGrooveProfile('lofi-hiphop');
    expect(profile.pocket).toBe('behind');
    expect(profile.tightness).toBeLessThan(0.5);
    expect(profile.swingAmount).toBeGreaterThan(0.2);
  });

  it('should have correct EDM profile values', () => {
    const profile = getGrooveProfile('edm-house');
    expect(profile.pocket).toBe('center');
    expect(profile.tightness).toBeGreaterThan(0.8);
    expect(profile.swingAmount).toBe(0);
  });

  it('should have correct funk profile values', () => {
    const profile = getGrooveProfile('funk');
    expect(profile.pocket).toBe('ahead');
    expect(profile.swingAmount).toBeGreaterThan(0);
  });
});
