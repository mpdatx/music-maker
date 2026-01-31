// src/lib/generators/rhythm/dynamics.ts
import type { TemplateStep, ArticulationProfile, DynamicRules, PhraseContour } from './types';
import type { GenrePreset } from '../../types/music';
import type { SeededRandom } from '../theory';

const GENRE_DYNAMIC_RULES: Record<GenrePreset, DynamicRules> = {
  'lofi-hiphop': {
    downbeatBoost: 0.05,
    backbeatBoost: 0.08,
    phraseContour: 'flat',
    accentPositions: [0, 8],
    ghostPositions: [3, 7, 11, 15],
  },
  'edm-house': {
    downbeatBoost: 0.1,
    backbeatBoost: 0.05,
    phraseContour: 'flat',
    accentPositions: [0, 4, 8, 12],
    ghostPositions: [],
  },
  'rock': {
    downbeatBoost: 0.08,
    backbeatBoost: 0.12,
    phraseContour: 'arc',
    accentPositions: [0, 4, 8, 12],
    ghostPositions: [2, 6, 10, 14],
  },
  'ambient': {
    downbeatBoost: 0.03,
    backbeatBoost: 0,
    phraseContour: 'swell',
    accentPositions: [0],
    ghostPositions: [],
  },
  'funk': {
    downbeatBoost: 0.15,
    backbeatBoost: 0.1,
    phraseContour: 'arc',
    accentPositions: [0],
    ghostPositions: [1, 3, 5, 7, 9, 11, 13, 15],
  },
  'pop': {
    downbeatBoost: 0.08,
    backbeatBoost: 0.1,
    phraseContour: 'arc',
    accentPositions: [0, 4, 8, 12],
    ghostPositions: [2, 6, 10, 14],
  },
};

export function getDynamicRules(genre: GenrePreset): DynamicRules {
  return { ...GENRE_DYNAMIC_RULES[genre] };
}

function getContourMultiplier(position: number, totalPositions: number, contour: PhraseContour): number {
  const progress = position / Math.max(1, totalPositions - 1);
  switch (contour) {
    case 'flat': return 1;
    case 'swell': return 0.85 + progress * 0.15;
    case 'decay': return 1 - progress * 0.15;
    // Arc builds to middle then falls - applied subtly to not overwhelm beat boosts
    case 'arc': return 0.95 + Math.sin(progress * Math.PI) * 0.05;
  }
}

export function applyDynamics(
  steps: TemplateStep[],
  rules: DynamicRules,
  profile: ArticulationProfile
): TemplateStep[] {
  const [minVel, maxVel] = profile.velocityRange;
  const minNorm = minVel / 127;
  const maxNorm = maxVel / 127;

  return steps.map((step, index) => {
    let velocity = step.velocity;

    // Apply contour
    velocity *= getContourMultiplier(index, steps.length, rules.phraseContour);

    // Apply downbeat boost (beat 1 only)
    if (step.position === 0) {
      velocity += rules.downbeatBoost;
    }

    // Apply backbeat boost (beats 2 and 4 = positions 4 and 12)
    if (step.position === 4 || step.position === 12) {
      velocity += rules.backbeatBoost;
    }

    // Apply beat boost for beats 3 (position 8) - less than downbeat
    if (step.position === 8) {
      velocity += rules.downbeatBoost * 0.5;
    }

    // Apply accent positions
    if (rules.accentPositions.includes(step.position)) {
      velocity *= 1 + profile.accentStrength * 0.15;
    }

    // Ghost notes are quieter
    if (step.ghost || rules.ghostPositions.includes(step.position)) {
      velocity *= profile.ghostStrength;
    }

    // Clamp to profile range
    velocity = Math.max(minNorm, Math.min(maxNorm, velocity));

    return { ...step, velocity };
  });
}

export function applyHumanization(
  steps: TemplateStep[],
  profile: ArticulationProfile,
  rng: SeededRandom
): TemplateStep[] {
  const tightness = profile.attackSharpness === 'sharp' ? 0.9 :
                    profile.attackSharpness === 'medium' ? 0.7 : 0.5;

  return steps.map(step => {
    const velocityJitter = (rng.next() - 0.5) * 0.1 * (1 - tightness);
    const velocity = Math.max(0.1, Math.min(1, step.velocity + velocityJitter));

    return { ...step, velocity };
  });
}
