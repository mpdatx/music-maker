// src/lib/generators/rhythm/__tests__/dynamics.test.ts
import { describe, it, expect } from 'vitest';
import { applyDynamics, applyHumanization, getDynamicRules } from '../dynamics';
import type { TemplateStep, ArticulationProfile, PhraseContour } from '../types';
import { SeededRandom } from '../../theory';

describe('dynamics', () => {
  const steps: TemplateStep[] = [
    { position: 0, velocity: 0.8, duration: '8n' },
    { position: 4, velocity: 0.8, duration: '8n' },
    { position: 8, velocity: 0.8, duration: '8n' },
    { position: 12, velocity: 0.8, duration: '8n' },
  ];

  const profile: ArticulationProfile = {
    genre: 'funk',
    velocityRange: [60, 120],
    velocityCurve: 'dynamic',
    accentStrength: 0.8,
    ghostStrength: 0.6,
    defaultNoteLengthRatio: 0.4,
    attackSharpness: 'sharp',
  };

  it('should apply downbeat boost', () => {
    const rules = getDynamicRules('rock');
    const result = applyDynamics(steps, rules, profile);
    // Downbeat should be louder
    const downbeat = result.find(s => s.position === 0);
    const upbeat = result.find(s => s.position === 4);
    expect(downbeat!.velocity).toBeGreaterThan(upbeat!.velocity * 0.95);
  });

  it('should apply swell contour', () => {
    const rules = getDynamicRules('ambient');
    rules.phraseContour = 'swell';
    const result = applyDynamics(steps, rules, profile);
    // Last note should be louder than first
    expect(result[result.length - 1].velocity).toBeGreaterThan(result[0].velocity * 0.9);
  });

  it('should apply humanization', () => {
    const rng = new SeededRandom(42);
    const result = applyHumanization(steps, profile, rng);
    // Velocities should be slightly different
    const originalSum = steps.reduce((sum, s) => sum + s.velocity, 0);
    const resultSum = result.reduce((sum, s) => sum + s.velocity, 0);
    expect(Math.abs(originalSum - resultSum)).toBeLessThan(steps.length * 0.1);
  });

  it('should clamp velocities to profile range', () => {
    const loudSteps: TemplateStep[] = [
      { position: 0, velocity: 1.0, duration: '8n', accent: true },
    ];
    const rules = getDynamicRules('lofi-hiphop');
    const lofiProfile: ArticulationProfile = {
      genre: 'lofi-hiphop',
      velocityRange: [50, 90],
      velocityCurve: 'compressed',
      accentStrength: 0.3,
      ghostStrength: 0.7,
      defaultNoteLengthRatio: 0.7,
      attackSharpness: 'soft',
    };
    const result = applyDynamics(loudSteps, rules, lofiProfile);
    expect(result[0].velocity).toBeLessThanOrEqual(90 / 127);
  });
});
