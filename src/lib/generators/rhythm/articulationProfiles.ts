// src/lib/generators/rhythm/articulationProfiles.ts
import type { GenrePreset } from '../../types/music';
import type { ArticulationProfile } from './types';

export const ARTICULATION_PROFILES: Record<GenrePreset, ArticulationProfile> = {
  'lofi-hiphop': {
    genre: 'lofi-hiphop',
    velocityRange: [50, 90],
    velocityCurve: 'compressed',
    accentStrength: 0.3,
    ghostStrength: 0.7,
    defaultNoteLengthRatio: 0.7,
    attackSharpness: 'soft',
  },
  'edm-house': {
    genre: 'edm-house',
    velocityRange: [80, 127],
    velocityCurve: 'flat',
    accentStrength: 0.9,
    ghostStrength: 0.1,
    defaultNoteLengthRatio: 0.5,
    attackSharpness: 'sharp',
  },
  'rock': {
    genre: 'rock',
    velocityRange: [70, 127],
    velocityCurve: 'dynamic',
    accentStrength: 0.8,
    ghostStrength: 0.4,
    defaultNoteLengthRatio: 0.6,
    attackSharpness: 'medium',
  },
  'ambient': {
    genre: 'ambient',
    velocityRange: [40, 80],
    velocityCurve: 'dynamic',
    accentStrength: 0.2,
    ghostStrength: 0,
    defaultNoteLengthRatio: 1.0,
    attackSharpness: 'soft',
  },
  'funk': {
    genre: 'funk',
    velocityRange: [60, 120],
    velocityCurve: 'dynamic',
    accentStrength: 0.8,
    ghostStrength: 0.7,
    defaultNoteLengthRatio: 0.4,
    attackSharpness: 'sharp',
  },
  'pop': {
    genre: 'pop',
    velocityRange: [60, 110],
    velocityCurve: 'dynamic',
    accentStrength: 0.6,
    ghostStrength: 0.4,
    defaultNoteLengthRatio: 0.6,
    attackSharpness: 'medium',
  },
};

export function getArticulationProfile(genre: GenrePreset): ArticulationProfile {
  return ARTICULATION_PROFILES[genre];
}
