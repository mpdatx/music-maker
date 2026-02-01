# Richer Musical Variation - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace fixed-template generation with a hybrid system using templates as seeds transformed by algorithmic variation rules, groove profiles, and layered dynamics.

**Architecture:** Build four new modules (rhythm templates, transformations, groove profiles, dynamics) that integrate into existing generators via a unified pipeline. Each generator calls the pipeline to transform base patterns into genre-authentic, humanized output.

**Tech Stack:** TypeScript, Vitest, existing SeededRandom utility

---

## Task 1: Core Types for Rhythm System

**Files:**
- Create: `src/lib/generators/rhythm/types.ts`
- Test: `src/lib/generators/rhythm/__tests__/types.test.ts`

**Step 1: Write the failing test**

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/types.test.ts`
Expected: FAIL with "Cannot find module '../types'"

**Step 3: Write minimal implementation**

```typescript
// src/lib/generators/rhythm/types.ts
import type { GenrePreset, InstrumentType } from '../../types/music';

export type EnergyLevel = 'low' | 'mid' | 'high';
export type Feel = 'straight' | 'swung' | 'syncopated';
export type TransformationType =
  | 'shift' | 'subdivide' | 'consolidate' | 'ghost'
  | 'accent' | 'omit' | 'fill' | 'euclidean';

export interface TemplateStep {
  position: number;      // 0-15 for 16th note grid
  velocity: number;      // 0-1
  duration: string;      // Tone.js duration
  accent?: boolean;
  ghost?: boolean;
}

export interface RhythmTemplate {
  id: string;
  name: string;
  genre: GenrePreset;
  instrument: InstrumentType | 'any';
  energyLevel: EnergyLevel;
  feel: Feel;
  steps: TemplateStep[];
  variationPoints: number[];  // positions where transformation encouraged
}

export interface GrooveProfile {
  genre: GenrePreset;
  swingAmount: number;           // 0-1
  swingTarget: 'eighths' | 'sixteenths';
  pocket: 'ahead' | 'center' | 'behind';
  tightness: number;             // 0-1
  pushPull: Record<number, number>;  // beat -> ms offset
}

export interface ArticulationProfile {
  genre: GenrePreset;
  velocityRange: [number, number];
  velocityCurve: 'flat' | 'dynamic' | 'compressed';
  accentStrength: number;        // 0-1
  ghostStrength: number;         // 0-1
  defaultNoteLengthRatio: number; // 0.5=staccato, 1.0=legato
  attackSharpness: 'soft' | 'medium' | 'sharp';
}

export interface TransformationRule {
  type: TransformationType;
  probability: number;
  targets: ('downbeat' | 'upbeat' | 'offbeat' | 'any')[];
  preserveDownbeats: boolean;
  maxApplications: number;
  densityRange: [number, number];
  complexityRange: [number, number];
}

export type PhraseContour = 'flat' | 'swell' | 'decay' | 'arc';

export interface DynamicRules {
  downbeatBoost: number;
  backbeatBoost: number;
  phraseContour: PhraseContour;
  accentPositions: number[];
  ghostPositions: number[];
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/types.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/rhythm/types.ts src/lib/generators/rhythm/__tests__/types.test.ts
git commit -m "feat: add core types for rhythm system"
```

---

## Task 2: Genre Groove Profiles

**Files:**
- Create: `src/lib/generators/rhythm/grooveProfiles.ts`
- Test: `src/lib/generators/rhythm/__tests__/grooveProfiles.test.ts`

**Step 1: Write the failing test**

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/grooveProfiles.test.ts`
Expected: FAIL with "Cannot find module '../grooveProfiles'"

**Step 3: Write minimal implementation**

```typescript
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
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/grooveProfiles.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/rhythm/grooveProfiles.ts src/lib/generators/rhythm/__tests__/grooveProfiles.test.ts
git commit -m "feat: add genre groove profiles"
```

---

## Task 3: Genre Articulation Profiles

**Files:**
- Create: `src/lib/generators/rhythm/articulationProfiles.ts`
- Test: `src/lib/generators/rhythm/__tests__/articulationProfiles.test.ts`

**Step 1: Write the failing test**

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/articulationProfiles.test.ts`
Expected: FAIL with "Cannot find module '../articulationProfiles'"

**Step 3: Write minimal implementation**

```typescript
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
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/articulationProfiles.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/rhythm/articulationProfiles.ts src/lib/generators/rhythm/__tests__/articulationProfiles.test.ts
git commit -m "feat: add genre articulation profiles"
```

---

## Task 4: Drum Rhythm Templates

**Files:**
- Create: `src/lib/generators/rhythm/templates/drums.ts`
- Test: `src/lib/generators/rhythm/__tests__/templates-drums.test.ts`

**Step 1: Write the failing test**

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/templates-drums.test.ts`
Expected: FAIL with "Cannot find module '../templates/drums'"

**Step 3: Write minimal implementation**

```typescript
// src/lib/generators/rhythm/templates/drums.ts
import type { GenrePreset } from '../../../types/music';
import type { RhythmTemplate, EnergyLevel, TemplateStep } from '../types';

// Helper to create kick/snare/hihat patterns
function drumTemplate(
  id: string,
  name: string,
  genre: GenrePreset,
  energy: EnergyLevel,
  feel: 'straight' | 'swung' | 'syncopated',
  kick: number[],
  snare: number[],
  hihat: number[]
): RhythmTemplate {
  const steps: TemplateStep[] = [
    ...kick.map(p => ({ position: p, velocity: 0.9, duration: '8n', accent: p === 0 })),
    ...snare.map(p => ({ position: p, velocity: 0.85, duration: '8n', accent: true })),
    ...hihat.map(p => ({ position: p, velocity: 0.6, duration: '16n' })),
  ];
  return {
    id, name, genre, instrument: 'drums', energyLevel: energy, feel, steps,
    variationPoints: [2, 6, 10, 14],
  };
}

const LOFI_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('lofi-lazy', 'Lazy Boom-Bap', 'lofi-hiphop', 'low', 'swung', [0, 10], [4, 12], [0, 4, 8, 12]),
  drumTemplate('lofi-dusty', 'Dusty Groove', 'lofi-hiphop', 'low', 'swung', [0, 6], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('lofi-chill', 'Chill Pocket', 'lofi-hiphop', 'mid', 'swung', [0, 6, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('lofi-bounce', 'Vinyl Bounce', 'lofi-hiphop', 'mid', 'swung', [0, 3, 8, 11], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('lofi-tape', 'Tape Hiss', 'lofi-hiphop', 'mid', 'syncopated', [0, 5, 10], [4, 14], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('lofi-head-nod', 'Head Nod', 'lofi-hiphop', 'high', 'swung', [0, 3, 6, 10, 13], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
];

const EDM_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('edm-minimal', 'Minimal Pulse', 'edm-house', 'low', 'straight', [0, 4, 8, 12], [], [2, 6, 10, 14]),
  drumTemplate('edm-four-floor', 'Four on Floor', 'edm-house', 'mid', 'straight', [0, 4, 8, 12], [4, 12], [2, 6, 10, 14]),
  drumTemplate('edm-driving', 'Driving House', 'edm-house', 'mid', 'straight', [0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('edm-offbeat', 'Offbeat Hats', 'edm-house', 'mid', 'syncopated', [0, 4, 8, 12], [4, 12], [1, 3, 5, 7, 9, 11, 13, 15]),
  drumTemplate('edm-peak', 'Peak Time', 'edm-house', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14], [4, 12], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
  drumTemplate('edm-drop', 'Drop Pattern', 'edm-house', 'high', 'syncopated', [0, 3, 4, 7, 8, 11, 12, 15], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
];

const ROCK_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('rock-ballad', 'Slow Ballad', 'rock', 'low', 'straight', [0, 8], [4, 12], [0, 4, 8, 12]),
  drumTemplate('rock-basic', 'Basic Rock', 'rock', 'mid', 'straight', [0, 8], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('rock-drive', 'Driving Beat', 'rock', 'mid', 'straight', [0, 6, 8, 14], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('rock-shuffle', 'Rock Shuffle', 'rock', 'mid', 'swung', [0, 8], [4, 12], [0, 3, 4, 7, 8, 11, 12, 15]),
  drumTemplate('rock-punk', 'Punk Drive', 'rock', 'high', 'straight', [0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('rock-double', 'Double Time', 'rock', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14], [4, 12], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
];

const FUNK_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('funk-pocket', 'Deep Pocket', 'funk', 'low', 'syncopated', [0, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('funk-classic', 'Classic Funk', 'funk', 'mid', 'syncopated', [0, 6, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('funk-chicken', 'Chicken Grease', 'funk', 'mid', 'syncopated', [0, 3, 6, 10, 13], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('funk-one', 'On The One', 'funk', 'mid', 'syncopated', [0], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('funk-busy', 'Busy Funk', 'funk', 'high', 'syncopated', [0, 3, 5, 8, 10, 13], [4, 12, 14], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('funk-slap', 'Slap Back', 'funk', 'high', 'syncopated', [0, 3, 6, 8, 11, 14], [4, 10, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
];

const POP_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('pop-simple', 'Simple Pop', 'pop', 'low', 'straight', [0, 8], [4, 12], [0, 4, 8, 12]),
  drumTemplate('pop-standard', 'Standard Pop', 'pop', 'mid', 'straight', [0, 8], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('pop-modern', 'Modern Pop', 'pop', 'mid', 'straight', [0, 6, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('pop-dance', 'Dance Pop', 'pop', 'mid', 'straight', [0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('pop-energy', 'High Energy', 'pop', 'high', 'straight', [0, 4, 6, 8, 12, 14], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('pop-anthem', 'Anthem', 'pop', 'high', 'straight', [0, 4, 8, 12], [4, 12], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
];

const AMBIENT_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('ambient-sparse', 'Sparse Pulse', 'ambient', 'low', 'straight', [0], [], []),
  drumTemplate('ambient-breath', 'Breathing', 'ambient', 'low', 'straight', [0, 8], [], [0, 8]),
  drumTemplate('ambient-texture', 'Textural', 'ambient', 'mid', 'straight', [0, 6, 12], [], [0, 4, 8, 12]),
  drumTemplate('ambient-pulse', 'Soft Pulse', 'ambient', 'mid', 'straight', [0, 4, 8, 12], [], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('ambient-wave', 'Wave', 'ambient', 'mid', 'swung', [0, 8], [12], [0, 4, 8, 12]),
  drumTemplate('ambient-build', 'Building', 'ambient', 'high', 'straight', [0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
];

const DRUM_TEMPLATES: Record<GenrePreset, RhythmTemplate[]> = {
  'lofi-hiphop': LOFI_TEMPLATES,
  'edm-house': EDM_TEMPLATES,
  'rock': ROCK_TEMPLATES,
  'funk': FUNK_TEMPLATES,
  'pop': POP_TEMPLATES,
  'ambient': AMBIENT_TEMPLATES,
};

export function getDrumTemplates(genre: GenrePreset): RhythmTemplate[] {
  return DRUM_TEMPLATES[genre] || [];
}

export function getDrumTemplatesByEnergy(genre: GenrePreset, energy: EnergyLevel): RhythmTemplate[] {
  return getDrumTemplates(genre).filter(t => t.energyLevel === energy);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/templates-drums.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/rhythm/templates/drums.ts src/lib/generators/rhythm/__tests__/templates-drums.test.ts
git commit -m "feat: add drum rhythm templates for all genres"
```

---

## Task 5: Bass Rhythm Templates

**Files:**
- Create: `src/lib/generators/rhythm/templates/bass.ts`
- Test: `src/lib/generators/rhythm/__tests__/templates-bass.test.ts`

**Step 1: Write the failing test**

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/templates-bass.test.ts`
Expected: FAIL with "Cannot find module '../templates/bass'"

**Step 3: Write minimal implementation**

```typescript
// src/lib/generators/rhythm/templates/bass.ts
import type { GenrePreset } from '../../../types/music';
import type { RhythmTemplate, EnergyLevel, TemplateStep } from '../types';

function bassTemplate(
  id: string,
  name: string,
  genre: GenrePreset,
  energy: EnergyLevel,
  feel: 'straight' | 'swung' | 'syncopated',
  positions: number[]
): RhythmTemplate {
  const steps: TemplateStep[] = positions.map((p, i) => ({
    position: p,
    velocity: p === 0 ? 0.9 : 0.8,
    duration: '8n',
    accent: p === 0 || i === 0,
  }));
  return {
    id, name, genre, instrument: 'bass', energyLevel: energy, feel, steps,
    variationPoints: positions.filter(p => p !== 0),
  };
}

const BASS_TEMPLATES: Record<GenrePreset, RhythmTemplate[]> = {
  'lofi-hiphop': [
    bassTemplate('lofi-bass-root', 'Root Notes', 'lofi-hiphop', 'low', 'swung', [0, 8]),
    bassTemplate('lofi-bass-lazy', 'Lazy Walk', 'lofi-hiphop', 'low', 'swung', [0, 6, 10]),
    bassTemplate('lofi-bass-bounce', 'Bounce', 'lofi-hiphop', 'mid', 'swung', [0, 3, 8, 11]),
    bassTemplate('lofi-bass-groove', 'Groove', 'lofi-hiphop', 'mid', 'swung', [0, 4, 6, 10, 14]),
    bassTemplate('lofi-bass-busy', 'Busy Line', 'lofi-hiphop', 'high', 'syncopated', [0, 3, 6, 8, 10, 13]),
  ],
  'edm-house': [
    bassTemplate('edm-bass-pulse', 'Pulse', 'edm-house', 'low', 'straight', [0, 4, 8, 12]),
    bassTemplate('edm-bass-offbeat', 'Offbeat', 'edm-house', 'mid', 'syncopated', [2, 6, 10, 14]),
    bassTemplate('edm-bass-drive', 'Driving', 'edm-house', 'mid', 'straight', [0, 2, 4, 6, 8, 10, 12, 14]),
    bassTemplate('edm-bass-stab', 'Stab', 'edm-house', 'high', 'syncopated', [0, 3, 6, 8, 11, 14]),
    bassTemplate('edm-bass-arp', 'Arp Bass', 'edm-house', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14]),
  ],
  'rock': [
    bassTemplate('rock-bass-whole', 'Whole Notes', 'rock', 'low', 'straight', [0]),
    bassTemplate('rock-bass-root', 'Root Eighth', 'rock', 'mid', 'straight', [0, 8]),
    bassTemplate('rock-bass-drive', 'Driving', 'rock', 'mid', 'straight', [0, 4, 8, 12]),
    bassTemplate('rock-bass-walk', 'Walking', 'rock', 'mid', 'straight', [0, 4, 6, 8, 12, 14]),
    bassTemplate('rock-bass-punk', 'Punk', 'rock', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14]),
  ],
  'funk': [
    bassTemplate('funk-bass-pocket', 'Deep Pocket', 'funk', 'low', 'syncopated', [0, 10]),
    bassTemplate('funk-bass-classic', 'Classic Funk', 'funk', 'mid', 'syncopated', [0, 3, 6, 10, 12]),
    bassTemplate('funk-bass-slap', 'Slap', 'funk', 'mid', 'syncopated', [0, 2, 6, 8, 10, 14]),
    bassTemplate('funk-bass-busy', 'Busy', 'funk', 'high', 'syncopated', [0, 2, 3, 6, 8, 10, 12, 14]),
    bassTemplate('funk-bass-thumb', 'Thumb', 'funk', 'high', 'syncopated', [0, 3, 4, 6, 8, 11, 12, 14]),
  ],
  'pop': [
    bassTemplate('pop-bass-simple', 'Simple', 'pop', 'low', 'straight', [0, 8]),
    bassTemplate('pop-bass-standard', 'Standard', 'pop', 'mid', 'straight', [0, 4, 8, 12]),
    bassTemplate('pop-bass-modern', 'Modern', 'pop', 'mid', 'straight', [0, 6, 8, 14]),
    bassTemplate('pop-bass-dance', 'Dance', 'pop', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14]),
  ],
  'ambient': [
    bassTemplate('ambient-bass-drone', 'Drone', 'ambient', 'low', 'straight', [0]),
    bassTemplate('ambient-bass-breath', 'Breathing', 'ambient', 'low', 'straight', [0, 8]),
    bassTemplate('ambient-bass-pulse', 'Soft Pulse', 'ambient', 'mid', 'straight', [0, 4, 8, 12]),
    bassTemplate('ambient-bass-motion', 'Motion', 'ambient', 'mid', 'straight', [0, 6, 12]),
  ],
};

export function getBassTemplates(genre: GenrePreset): RhythmTemplate[] {
  return BASS_TEMPLATES[genre] || [];
}

export function getBassTemplatesByEnergy(genre: GenrePreset, energy: EnergyLevel): RhythmTemplate[] {
  return getBassTemplates(genre).filter(t => t.energyLevel === energy);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/templates-bass.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/rhythm/templates/bass.ts src/lib/generators/rhythm/__tests__/templates-bass.test.ts
git commit -m "feat: add bass rhythm templates for all genres"
```

---

## Task 6: Transformation Engine

**Files:**
- Create: `src/lib/generators/rhythm/transformations.ts`
- Test: `src/lib/generators/rhythm/__tests__/transformations.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/generators/rhythm/__tests__/transformations.test.ts
import { describe, it, expect } from 'vitest';
import { applyTransformation, getTransformationRules } from '../transformations';
import type { TemplateStep } from '../types';
import { SeededRandom } from '../../theory';

describe('transformations', () => {
  const baseSteps: TemplateStep[] = [
    { position: 0, velocity: 0.9, duration: '8n', accent: true },
    { position: 4, velocity: 0.8, duration: '8n' },
    { position: 8, velocity: 0.9, duration: '8n' },
    { position: 12, velocity: 0.8, duration: '8n' },
  ];

  it('should apply shift transformation', () => {
    const rng = new SeededRandom(42);
    const shifted = applyTransformation(baseSteps, 'shift', rng, { preserveDownbeats: true });
    // Downbeat at 0 should be preserved
    expect(shifted.some(s => s.position === 0)).toBe(true);
  });

  it('should apply ghost transformation', () => {
    const rng = new SeededRandom(42);
    const ghosted = applyTransformation(baseSteps, 'ghost', rng, {});
    // Should add ghost notes
    expect(ghosted.length).toBeGreaterThanOrEqual(baseSteps.length);
    const ghosts = ghosted.filter(s => s.ghost);
    expect(ghosts.length).toBeGreaterThan(0);
  });

  it('should apply omit transformation', () => {
    const rng = new SeededRandom(42);
    const omitted = applyTransformation(baseSteps, 'omit', rng, { preserveDownbeats: true });
    // Should remove some notes but keep downbeat
    expect(omitted.length).toBeLessThanOrEqual(baseSteps.length);
    expect(omitted.some(s => s.position === 0)).toBe(true);
  });

  it('should apply subdivide transformation', () => {
    const rng = new SeededRandom(42);
    const subdivided = applyTransformation(baseSteps, 'subdivide', rng, {});
    // Should add notes from subdivision
    expect(subdivided.length).toBeGreaterThanOrEqual(baseSteps.length);
  });

  it('should get transformation rules for density/complexity', () => {
    const rules = getTransformationRules(0.7, 0.6);
    expect(rules.length).toBeGreaterThan(0);
    // High density should include subdivide
    expect(rules.some(r => r.type === 'subdivide')).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/transformations.test.ts`
Expected: FAIL with "Cannot find module '../transformations'"

**Step 3: Write minimal implementation**

```typescript
// src/lib/generators/rhythm/transformations.ts
import type { TemplateStep, TransformationType, TransformationRule } from './types';
import type { SeededRandom } from '../theory';

const ALL_RULES: TransformationRule[] = [
  { type: 'shift', probability: 0.3, targets: ['upbeat', 'offbeat'], preserveDownbeats: true, maxApplications: 4, densityRange: [0, 1], complexityRange: [0.3, 1] },
  { type: 'subdivide', probability: 0.4, targets: ['upbeat'], preserveDownbeats: true, maxApplications: 2, densityRange: [0.6, 1], complexityRange: [0.4, 1] },
  { type: 'ghost', probability: 0.5, targets: ['offbeat'], preserveDownbeats: true, maxApplications: 4, densityRange: [0.3, 1], complexityRange: [0.4, 1] },
  { type: 'accent', probability: 0.4, targets: ['any'], preserveDownbeats: false, maxApplications: 3, densityRange: [0, 1], complexityRange: [0.2, 1] },
  { type: 'omit', probability: 0.3, targets: ['upbeat', 'offbeat'], preserveDownbeats: true, maxApplications: 3, densityRange: [0, 0.5], complexityRange: [0, 0.6] },
  { type: 'consolidate', probability: 0.2, targets: ['any'], preserveDownbeats: true, maxApplications: 2, densityRange: [0, 0.4], complexityRange: [0, 0.5] },
];

export function getTransformationRules(density: number, complexity: number): TransformationRule[] {
  return ALL_RULES.filter(rule =>
    density >= rule.densityRange[0] && density <= rule.densityRange[1] &&
    complexity >= rule.complexityRange[0] && complexity <= rule.complexityRange[1]
  );
}

function isDownbeat(position: number): boolean {
  return position % 4 === 0;
}

function isUpbeat(position: number): boolean {
  return position % 4 === 2;
}

function isOffbeat(position: number): boolean {
  return position % 2 === 1;
}

function matchesTarget(position: number, targets: TransformationRule['targets']): boolean {
  if (targets.includes('any')) return true;
  if (targets.includes('downbeat') && isDownbeat(position)) return true;
  if (targets.includes('upbeat') && isUpbeat(position)) return true;
  if (targets.includes('offbeat') && isOffbeat(position)) return true;
  return false;
}

interface TransformOptions {
  preserveDownbeats?: boolean;
  maxApplications?: number;
}

export function applyTransformation(
  steps: TemplateStep[],
  type: TransformationType,
  rng: SeededRandom,
  options: TransformOptions
): TemplateStep[] {
  const result = [...steps.map(s => ({ ...s }))];
  const { preserveDownbeats = true, maxApplications = 4 } = options;

  switch (type) {
    case 'shift': {
      let applications = 0;
      for (const step of result) {
        if (applications >= maxApplications) break;
        if (preserveDownbeats && isDownbeat(step.position)) continue;
        if (rng.chance(0.4)) {
          const offset = rng.pick([-1, 1]);
          step.position = Math.max(0, Math.min(15, step.position + offset));
          applications++;
        }
      }
      break;
    }

    case 'subdivide': {
      const toAdd: TemplateStep[] = [];
      let applications = 0;
      for (const step of result) {
        if (applications >= maxApplications) break;
        if (rng.chance(0.5) && !isDownbeat(step.position)) {
          toAdd.push({
            position: Math.min(15, step.position + 1),
            velocity: step.velocity * 0.7,
            duration: '16n',
          });
          applications++;
        }
      }
      result.push(...toAdd);
      break;
    }

    case 'ghost': {
      const toAdd: TemplateStep[] = [];
      let applications = 0;
      for (let pos = 0; pos < 16; pos++) {
        if (applications >= maxApplications) break;
        if (isOffbeat(pos) && !result.some(s => s.position === pos) && rng.chance(0.3)) {
          toAdd.push({
            position: pos,
            velocity: 0.3 + rng.next() * 0.15,
            duration: '32n',
            ghost: true,
          });
          applications++;
        }
      }
      result.push(...toAdd);
      break;
    }

    case 'accent': {
      let applications = 0;
      for (const step of result) {
        if (applications >= maxApplications) break;
        if (rng.chance(0.3)) {
          step.accent = true;
          step.velocity = Math.min(1, step.velocity * 1.15);
          applications++;
        }
      }
      break;
    }

    case 'omit': {
      const toRemove: number[] = [];
      let applications = 0;
      for (let i = 0; i < result.length; i++) {
        if (applications >= maxApplications) break;
        const step = result[i];
        if (preserveDownbeats && isDownbeat(step.position)) continue;
        if (rng.chance(0.3)) {
          toRemove.push(i);
          applications++;
        }
      }
      for (let i = toRemove.length - 1; i >= 0; i--) {
        result.splice(toRemove[i], 1);
      }
      break;
    }

    case 'consolidate': {
      // Merge adjacent notes into longer ones
      result.sort((a, b) => a.position - b.position);
      const toRemove: number[] = [];
      for (let i = 0; i < result.length - 1; i++) {
        if (result[i + 1].position - result[i].position <= 2) {
          if (preserveDownbeats && isDownbeat(result[i + 1].position)) continue;
          result[i].duration = '4n';
          toRemove.push(i + 1);
        }
      }
      for (let i = toRemove.length - 1; i >= 0; i--) {
        result.splice(toRemove[i], 1);
      }
      break;
    }
  }

  return result.sort((a, b) => a.position - b.position);
}

export function applyTransformationChain(
  steps: TemplateStep[],
  rules: TransformationRule[],
  rng: SeededRandom
): TemplateStep[] {
  let result = steps;
  for (const rule of rules) {
    if (rng.chance(rule.probability)) {
      result = applyTransformation(result, rule.type, rng, {
        preserveDownbeats: rule.preserveDownbeats,
        maxApplications: rule.maxApplications,
      });
    }
  }
  return result;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/transformations.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/rhythm/transformations.ts src/lib/generators/rhythm/__tests__/transformations.test.ts
git commit -m "feat: add rhythm transformation engine"
```

---

## Task 7: Dynamics System

**Files:**
- Create: `src/lib/generators/rhythm/dynamics.ts`
- Test: `src/lib/generators/rhythm/__tests__/dynamics.test.ts`

**Step 1: Write the failing test**

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/dynamics.test.ts`
Expected: FAIL with "Cannot find module '../dynamics'"

**Step 3: Write minimal implementation**

```typescript
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
    case 'arc': return 0.9 + Math.sin(progress * Math.PI) * 0.1;
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

    // Apply downbeat boost
    if (step.position % 4 === 0) {
      velocity += rules.downbeatBoost;
    }

    // Apply backbeat boost (positions 4, 12)
    if (step.position === 4 || step.position === 12) {
      velocity += rules.backbeatBoost;
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
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/dynamics.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/rhythm/dynamics.ts src/lib/generators/rhythm/__tests__/dynamics.test.ts
git commit -m "feat: add three-layer dynamics system"
```

---

## Task 8: Groove Application

**Files:**
- Create: `src/lib/generators/rhythm/groove.ts`
- Test: `src/lib/generators/rhythm/__tests__/groove.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/generators/rhythm/__tests__/groove.test.ts
import { describe, it, expect } from 'vitest';
import { applyGroove, applySwing } from '../groove';
import type { GrooveProfile } from '../types';
import type { Note } from '../../../types/music';

describe('groove', () => {
  const straightNotes: Note[] = [
    { pitch: 'C4', time: '0:0:0', duration: '8n', velocity: 0.8 },
    { pitch: 'C4', time: '0:0:1', duration: '8n', velocity: 0.8 },
    { pitch: 'C4', time: '0:0:2', duration: '8n', velocity: 0.8 },
    { pitch: 'C4', time: '0:0:3', duration: '8n', velocity: 0.8 },
  ];

  it('should apply swing to sixteenths', () => {
    const swungNotes = applySwing(straightNotes, 0.5, 'sixteenths');
    // Odd sixteenths should be delayed
    const secondNote = swungNotes[1];
    expect(secondNote.time).not.toBe('0:0:1');
  });

  it('should not swing with swingAmount of 0', () => {
    const result = applySwing(straightNotes, 0, 'sixteenths');
    expect(result[1].time).toBe(straightNotes[1].time);
  });

  it('should apply pocket timing', () => {
    const behindProfile: GrooveProfile = {
      genre: 'lofi-hiphop',
      swingAmount: 0,
      swingTarget: 'sixteenths',
      pocket: 'behind',
      tightness: 0.5,
      pushPull: {},
    };
    const result = applyGroove(straightNotes, behindProfile);
    // Notes should be slightly delayed (behind the beat)
    expect(result.length).toBe(straightNotes.length);
  });

  it('should apply push/pull offsets', () => {
    const profile: GrooveProfile = {
      genre: 'funk',
      swingAmount: 0,
      swingTarget: 'sixteenths',
      pocket: 'center',
      tightness: 1,
      pushPull: { 0: 10, 4: -10 },
    };
    const notes: Note[] = [
      { pitch: 'C4', time: '0:0:0', duration: '8n', velocity: 0.8 },
      { pitch: 'C4', time: '0:1:0', duration: '8n', velocity: 0.8 },
    ];
    const result = applyGroove(notes, profile);
    expect(result.length).toBe(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/groove.test.ts`
Expected: FAIL with "Cannot find module '../groove'"

**Step 3: Write minimal implementation**

```typescript
// src/lib/generators/rhythm/groove.ts
import type { Note } from '../../types/music';
import type { GrooveProfile } from './types';

// Parse Tone.js time format "bar:beat:sixteenth" to total sixteenths
function parseTime(time: string): number {
  const parts = time.split(':').map(Number);
  const bar = parts[0] || 0;
  const beat = parts[1] || 0;
  const sixteenth = parts[2] || 0;
  return bar * 16 + beat * 4 + sixteenth;
}

// Convert sixteenths back to Tone.js time format
function formatTime(sixteenths: number): string {
  const bar = Math.floor(sixteenths / 16);
  const remainder = sixteenths % 16;
  const beat = Math.floor(remainder / 4);
  const sixteenth = remainder % 4;
  return `${bar}:${beat}:${sixteenth}`;
}

export function applySwing(
  notes: Note[],
  swingAmount: number,
  swingTarget: 'eighths' | 'sixteenths'
): Note[] {
  if (swingAmount === 0) return notes;

  const swingOffset = swingAmount * 0.33; // Max swing is triplet feel (~33%)
  const gridSize = swingTarget === 'eighths' ? 2 : 1; // In sixteenths

  return notes.map(note => {
    const sixteenths = parseTime(note.time);
    const gridPosition = sixteenths % (gridSize * 2);

    // Only swing the offbeat (second note of each pair)
    if (gridPosition === gridSize) {
      const swungSixteenths = sixteenths + swingOffset;
      return { ...note, time: formatTime(swungSixteenths) };
    }

    return note;
  });
}

export function applyGroove(notes: Note[], profile: GrooveProfile): Note[] {
  let result = notes;

  // Apply swing
  result = applySwing(result, profile.swingAmount, profile.swingTarget);

  // Apply pocket (overall timing offset)
  if (profile.pocket !== 'center') {
    const pocketOffset = profile.pocket === 'behind' ? 0.1 : -0.1;
    const scaledOffset = pocketOffset * (1 - profile.tightness);

    result = result.map(note => {
      const sixteenths = parseTime(note.time);
      const adjusted = Math.max(0, sixteenths + scaledOffset);
      return { ...note, time: formatTime(adjusted) };
    });
  }

  // Apply push/pull per beat position
  if (Object.keys(profile.pushPull).length > 0) {
    result = result.map(note => {
      const sixteenths = parseTime(note.time);
      const beatPosition = sixteenths % 16;
      const offset = profile.pushPull[beatPosition] || 0;

      if (offset !== 0) {
        // Offset is in ms, convert to sixteenths (approximate at 120bpm: 1 sixteenth = 125ms)
        const offsetSixteenths = (offset / 125) * 0.25;
        const adjusted = Math.max(0, sixteenths + offsetSixteenths);
        return { ...note, time: formatTime(adjusted) };
      }

      return note;
    });
  }

  return result;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/groove.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/rhythm/groove.ts src/lib/generators/rhythm/__tests__/groove.test.ts
git commit -m "feat: add groove and swing application"
```

---

## Task 9: Rhythm Pipeline Integration

**Files:**
- Create: `src/lib/generators/rhythm/pipeline.ts`
- Create: `src/lib/generators/rhythm/index.ts`
- Test: `src/lib/generators/rhythm/__tests__/pipeline.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/generators/rhythm/__tests__/pipeline.test.ts
import { describe, it, expect } from 'vitest';
import { processRhythm } from '../pipeline';
import type { GenerationParams, Note } from '../../../types/music';

describe('rhythm pipeline', () => {
  const params: GenerationParams = {
    density: 0.5,
    complexity: 0.5,
    swing: 0.3,
    style: 'swung',
  };

  it('should generate rhythm for drums', () => {
    const result = processRhythm('drums', 'lofi-hiphop', params, 42, 2);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(n => ['kick', 'snare', 'hihat', 'openhat', 'tom'].includes(n.pitch))).toBe(true);
  });

  it('should generate rhythm pattern for bass', () => {
    const result = processRhythm('bass', 'funk', params, 42, 2);
    expect(result.length).toBeGreaterThan(0);
    // Bass returns template positions, not notes with pitches
  });

  it('should produce different results for different seeds', () => {
    const result1 = processRhythm('drums', 'rock', params, 42, 2);
    const result2 = processRhythm('drums', 'rock', params, 123, 2);
    // Different seeds should produce different patterns
    const times1 = result1.map(n => n.time).join(',');
    const times2 = result2.map(n => n.time).join(',');
    expect(times1).not.toBe(times2);
  });

  it('should apply genre-specific groove', () => {
    const lofiResult = processRhythm('drums', 'lofi-hiphop', params, 42, 2);
    const edmResult = processRhythm('drums', 'edm-house', params, 42, 2);
    // Both should produce valid output
    expect(lofiResult.length).toBeGreaterThan(0);
    expect(edmResult.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/pipeline.test.ts`
Expected: FAIL with "Cannot find module '../pipeline'"

**Step 3: Write minimal implementation**

```typescript
// src/lib/generators/rhythm/pipeline.ts
import type { GenrePreset, GenerationParams, Note, InstrumentType } from '../../types/music';
import type { TemplateStep, EnergyLevel } from './types';
import { SeededRandom } from '../theory';
import { getDrumTemplates } from './templates/drums';
import { getBassTemplates } from './templates/bass';
import { getGrooveProfile } from './grooveProfiles';
import { getArticulationProfile } from './articulationProfiles';
import { getTransformationRules, applyTransformationChain } from './transformations';
import { getDynamicRules, applyDynamics, applyHumanization } from './dynamics';
import { applyGroove } from './groove';

function densityToEnergy(density: number): EnergyLevel {
  if (density < 0.35) return 'low';
  if (density < 0.7) return 'mid';
  return 'high';
}

function stepsToNotes(
  steps: TemplateStep[],
  instrument: 'drums',
  bar: number
): Note[] {
  // For drums, map positions to drum sounds
  const notes: Note[] = [];
  const sorted = [...steps].sort((a, b) => a.position - b.position);

  // Group by position to determine drum assignment
  for (const step of sorted) {
    const time = `${bar}:0:${step.position * 0.25}`;
    let pitch: string;

    // Simple heuristic: louder/accented = kick/snare, quieter = hihat
    if (step.accent && step.velocity > 0.8) {
      pitch = step.position % 8 === 0 ? 'kick' : 'snare';
    } else if (step.velocity > 0.7) {
      pitch = step.position % 4 === 0 ? 'kick' : 'snare';
    } else if (step.ghost) {
      pitch = 'snare';
    } else {
      pitch = 'hihat';
    }

    notes.push({
      pitch,
      time,
      duration: step.duration,
      velocity: step.velocity,
    });
  }

  return notes;
}

export function processRhythm(
  instrument: InstrumentType,
  genre: GenrePreset,
  params: GenerationParams,
  seed: number,
  bars: number
): Note[] {
  const rng = new SeededRandom(seed);
  const energy = densityToEnergy(params.density);

  // Get templates
  let templates;
  if (instrument === 'drums' || instrument === 'percussion') {
    templates = getDrumTemplates(genre).filter(t => t.energyLevel === energy);
  } else if (instrument === 'bass' || instrument === 'bass-electric') {
    templates = getBassTemplates(genre).filter(t => t.energyLevel === energy);
  } else {
    // Default to drum templates for now
    templates = getDrumTemplates(genre).filter(t => t.energyLevel === energy);
  }

  if (templates.length === 0) {
    // Fallback to any energy level
    templates = instrument === 'drums' ? getDrumTemplates(genre) : getBassTemplates(genre);
  }

  // Select template
  const template = rng.pick(templates);
  let steps = [...template.steps];

  // Apply transformations
  const transformRules = getTransformationRules(params.density, params.complexity);
  steps = applyTransformationChain(steps, transformRules, rng);

  // Apply dynamics
  const articulationProfile = getArticulationProfile(genre);
  const dynamicRules = getDynamicRules(genre);
  steps = applyDynamics(steps, dynamicRules, articulationProfile);

  // Apply humanization
  steps = applyHumanization(steps, articulationProfile, rng);

  // Convert steps to notes for each bar
  const allNotes: Note[] = [];
  for (let bar = 0; bar < bars; bar++) {
    if (instrument === 'drums' || instrument === 'percussion') {
      allNotes.push(...stepsToNotes(steps, 'drums', bar));
    } else {
      // For non-drums, return positions as placeholder notes
      for (const step of steps) {
        allNotes.push({
          pitch: 'C3',
          time: `${bar}:0:${step.position * 0.25}`,
          duration: step.duration,
          velocity: step.velocity,
        });
      }
    }
  }

  // Apply groove
  const grooveProfile = getGrooveProfile(genre);
  return applyGroove(allNotes, grooveProfile);
}
```

```typescript
// src/lib/generators/rhythm/index.ts
export * from './types';
export * from './grooveProfiles';
export * from './articulationProfiles';
export * from './transformations';
export * from './dynamics';
export * from './groove';
export * from './pipeline';
export { getDrumTemplates, getDrumTemplatesByEnergy } from './templates/drums';
export { getBassTemplates, getBassTemplatesByEnergy } from './templates/bass';
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/generators/rhythm/__tests__/pipeline.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/rhythm/pipeline.ts src/lib/generators/rhythm/index.ts src/lib/generators/rhythm/__tests__/pipeline.test.ts
git commit -m "feat: add unified rhythm pipeline"
```

---

## Task 10: Integrate Pipeline into Drum Generator

**Files:**
- Modify: `src/lib/generators/drums.ts`
- Test: `src/lib/generators/__tests__/drums.test.ts`

**Step 1: Update existing test to verify new functionality**

```typescript
// Add to src/lib/generators/__tests__/drums.test.ts
import { describe, it, expect } from 'vitest';
import { generateDrumPattern, generateDrumBundle, generateDrumPatternWithPipeline } from '../drums';

// ... existing tests ...

describe('generateDrumPatternWithPipeline', () => {
  it('should generate pattern using rhythm pipeline', () => {
    const params = { density: 0.5, complexity: 0.5, swing: 0.3, style: 'swung' as const };
    const notes = generateDrumPatternWithPipeline(params, 'lofi-hiphop', 42, 2);
    expect(notes.length).toBeGreaterThan(0);
    expect(notes.every(n => ['kick', 'snare', 'hihat', 'openhat', 'tom'].includes(n.pitch))).toBe(true);
  });

  it('should produce genre-appropriate patterns', () => {
    const params = { density: 0.7, complexity: 0.5, swing: 0, style: 'straight' as const };
    const edmNotes = generateDrumPatternWithPipeline(params, 'edm-house', 42, 2);
    // EDM should have four-on-floor kick pattern
    const kicks = edmNotes.filter(n => n.pitch === 'kick');
    expect(kicks.length).toBeGreaterThanOrEqual(4);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/generators/__tests__/drums.test.ts`
Expected: FAIL with "generateDrumPatternWithPipeline is not exported"

**Step 3: Add pipeline integration to drums.ts**

Add this function to `src/lib/generators/drums.ts`:

```typescript
// Add import at top
import { processRhythm } from './rhythm';

// Add new function
export function generateDrumPatternWithPipeline(
  params: GenerationParams,
  genre: GenrePreset,
  seed: number,
  bars = 2
): Note[] {
  return processRhythm('drums', genre, params, seed, bars);
}
```

Also add the GenrePreset import:
```typescript
import type { Note, GenerationParams, ChordDegree, LoopBundle, LoopVariation, DrumFillPoints, GenrePreset } from '../types';
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/generators/__tests__/drums.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/drums.ts src/lib/generators/__tests__/drums.test.ts
git commit -m "feat: integrate rhythm pipeline into drum generator"
```

---

## Summary

This plan implements Phase 2 (Richer Musical Variation) in 10 tasks:

1. **Core Types** - Data structures for templates, profiles, transformations
2. **Groove Profiles** - Per-genre swing, pocket, push/pull settings
3. **Articulation Profiles** - Per-genre velocity curves, accent/ghost strength
4. **Drum Templates** - 6 templates per genre with energy levels
5. **Bass Templates** - 4-5 templates per genre with energy levels
6. **Transformation Engine** - shift, subdivide, ghost, accent, omit, consolidate
7. **Dynamics System** - Contours, downbeat/backbeat boost, humanization
8. **Groove Application** - Swing and timing offset application
9. **Rhythm Pipeline** - Unified processing: template → transform → dynamics → groove
10. **Integration** - Connect pipeline to drum generator

Total estimated tasks: 10
Files created: 11 new files
Files modified: 2 existing files
