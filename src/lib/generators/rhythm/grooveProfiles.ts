// src/lib/generators/rhythm/grooveProfiles.ts
import type { GenrePreset } from '../../types/music';
import type { GrooveProfile } from './types';

export const GROOVE_PROFILES: Record<GenrePreset, GrooveProfile> = {
  'lofi-hiphop': {
    genre: 'lofi-hiphop',
    swingAmount: 0.35,
    swingTarget: 'sixteenths',
    pocket: 'behind',
    tightness: 0.3,
    pushPull: { 0: 0, 4: -8, 8: 0, 12: -5 },
  },
  'edm-house': {
    genre: 'edm-house',
    swingAmount: 0,
    swingTarget: 'sixteenths',
    pocket: 'center',
    tightness: 0.9,
    pushPull: { 0: 0, 4: 0, 8: 0, 12: 0 },
  },
  'rock': {
    genre: 'rock',
    swingAmount: 0.1,
    swingTarget: 'eighths',
    pocket: 'center',
    tightness: 0.7,
    pushPull: { 0: 0, 4: 3, 8: 0, 12: 3 },
  },
  'ambient': {
    genre: 'ambient',
    swingAmount: 0.1,
    swingTarget: 'eighths',
    pocket: 'behind',
    tightness: 0.4,
    pushPull: { 0: 0, 4: -3, 8: 0, 12: -3 },
  },
  'funk': {
    genre: 'funk',
    swingAmount: 0.15,
    swingTarget: 'sixteenths',
    pocket: 'ahead',
    tightness: 0.6,
    pushPull: { 0: 5, 4: 0, 8: 5, 12: 0 },
  },
  'pop': {
    genre: 'pop',
    swingAmount: 0.15,
    swingTarget: 'sixteenths',
    pocket: 'center',
    tightness: 0.8,
    pushPull: { 0: 0, 4: 0, 8: 0, 12: 0 },
  },
};

export function getGrooveProfile(genre: GenrePreset): GrooveProfile {
  return GROOVE_PROFILES[genre];
}
