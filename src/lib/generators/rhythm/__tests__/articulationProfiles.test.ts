// src/lib/generators/rhythm/__tests__/articulationProfiles.test.ts
import { describe, it, expect } from 'vitest';
import { getArticulationProfile, ARTICULATION_PROFILES } from '../articulationProfiles';

describe('articulationProfiles', () => {
  it('should return articulation profile for each genre', () => {
    const genres = ['lofi-hiphop', 'edm-house', 'rock', 'ambient', 'funk', 'pop'] as const;
    for (const genre of genres) {
      const profile = getArticulationProfile(genre);
      expect(profile.genre).toBe(genre);
      expect(profile.velocityRange[0]).toBeLessThan(profile.velocityRange[1]);
    }
  });

  it('should have compressed dynamics for lofi', () => {
    const profile = getArticulationProfile('lofi-hiphop');
    expect(profile.velocityCurve).toBe('compressed');
    expect(profile.velocityRange[1]).toBeLessThan(100);
  });

  it('should have flat dynamics for EDM', () => {
    const profile = getArticulationProfile('edm-house');
    expect(profile.velocityCurve).toBe('flat');
    expect(profile.velocityRange[1]).toBe(127);
  });

  it('should have dynamic velocity for funk', () => {
    const profile = getArticulationProfile('funk');
    expect(profile.velocityCurve).toBe('dynamic');
    expect(profile.ghostStrength).toBeGreaterThan(0.5);
  });
});
