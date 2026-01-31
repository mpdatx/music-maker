// src/lib/generators/rhythm/__tests__/types.test.ts
import { describe, it, expect } from 'vitest';
import type { RhythmTemplate, GrooveProfile, ArticulationProfile, TransformationType } from '../types';

describe('rhythm types', () => {
  it('should allow creating a valid RhythmTemplate', () => {
    const template: RhythmTemplate = {
      id: 'rock-basic',
      name: 'Basic Rock',
      genre: 'rock',
      instrument: 'drums',
      energyLevel: 'mid',
      feel: 'straight',
      steps: [
        { position: 0, velocity: 0.9, duration: '8n', accent: true },
        { position: 4, velocity: 0.85, duration: '8n', accent: true },
      ],
      variationPoints: [2, 6, 10, 14],
    };
    expect(template.id).toBe('rock-basic');
    expect(template.energyLevel).toBe('mid');
  });

  it('should allow creating a valid GrooveProfile', () => {
    const profile: GrooveProfile = {
      genre: 'lofi-hiphop',
      swingAmount: 0.3,
      swingTarget: 'sixteenths',
      pocket: 'behind',
      tightness: 0.3,
      pushPull: { 0: 0, 4: -5, 8: 0, 12: 5 },
    };
    expect(profile.swingAmount).toBe(0.3);
    expect(profile.pocket).toBe('behind');
  });

  it('should allow creating a valid ArticulationProfile', () => {
    const profile: ArticulationProfile = {
      genre: 'funk',
      velocityRange: [60, 120],
      velocityCurve: 'dynamic',
      accentStrength: 0.8,
      ghostStrength: 0.6,
      defaultNoteLengthRatio: 0.4,
      attackSharpness: 'sharp',
    };
    expect(profile.velocityCurve).toBe('dynamic');
  });
});
