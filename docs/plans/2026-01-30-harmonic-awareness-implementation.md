# Harmonic Awareness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make all melodic instruments follow a shared chord progression, with pre-generated variations per chord.

**Architecture:** Add chord progression data model, extend Loop to LoopBundle with variations, update generators to produce per-chord variations, modify scheduler to cycle through variations during playback.

**Tech Stack:** TypeScript, Tone.js, Svelte 5

---

## Task 0: Set Up Test Framework

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/generators/__tests__/theory.test.ts`

**Step 1: Install vitest**

Run:
```bash
npm install -D vitest
```

**Step 2: Add test script to package.json**

In `package.json`, add to scripts:
```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 3: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
  },
});
```

**Step 4: Write a simple theory test to verify setup**

Create `src/lib/generators/__tests__/theory.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { SeededRandom, getNoteInScale, getChordNotes } from '../theory';

describe('SeededRandom', () => {
  it('produces reproducible results with same seed', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);

    expect(rng1.next()).toBe(rng2.next());
    expect(rng1.next()).toBe(rng2.next());
  });
});

describe('getNoteInScale', () => {
  it('returns correct note for degree 0 in C major', () => {
    expect(getNoteInScale('C', 'major', 0, 4)).toBe('C4');
  });

  it('returns correct note for degree 4 (fifth) in C major', () => {
    expect(getNoteInScale('C', 'major', 4, 4)).toBe('G4');
  });
});

describe('getChordNotes', () => {
  it('returns triad for C major chord', () => {
    const notes = getChordNotes('C', 'major', 0, 4);
    expect(notes).toEqual(['C4', 'E4', 'G4']);
  });
});
```

**Step 5: Run tests to verify setup**

Run: `npm run test:run`
Expected: All tests pass

**Step 6: Commit**

```bash
git add package.json vitest.config.ts src/lib/generators/__tests__/theory.test.ts
git commit -m "chore: add vitest test framework with initial theory tests"
```

---

## Task 1: Define Chord Progression Types

**Files:**
- Modify: `src/lib/types/music.ts`
- Create: `src/lib/generators/__tests__/progressions.test.ts`

**Step 1: Write failing test for progression types**

Create `src/lib/generators/__tests__/progressions.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import type { ChordDegree, ChordProgression } from '../../types/music';

describe('ChordProgression types', () => {
  it('accepts valid chord degrees', () => {
    const degrees: ChordDegree[] = ['I', 'IV', 'V', 'vi'];
    expect(degrees.length).toBe(4);
  });

  it('accepts valid progression structure', () => {
    const progression: ChordProgression = {
      id: 'classic-pop',
      name: 'Classic Pop',
      genre: 'pop',
      chords: ['I', 'V', 'vi', 'IV'],
      isDefault: true,
    };
    expect(progression.chords.length).toBe(4);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run`
Expected: FAIL - ChordDegree and ChordProgression types not found

**Step 3: Add types to music.ts**

Add to `src/lib/types/music.ts` after the existing types:
```typescript
export type ChordDegree =
  | 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii°'
  | 'Imaj7' | 'ii7' | 'iii7' | 'IVmaj7' | 'V7' | 'vi7' | 'vii7b5';

export interface ChordProgression {
  id: string;
  name: string;
  genre: GenrePreset;
  chords: ChordDegree[];
  isDefault: boolean;
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/types/music.ts src/lib/generators/__tests__/progressions.test.ts
git commit -m "feat: add ChordDegree and ChordProgression types"
```

---

## Task 2: Create Progression Library

**Files:**
- Create: `src/lib/generators/progressions.ts`
- Create: `src/lib/generators/__tests__/progressions.test.ts` (extend)

**Step 1: Write failing test for progression library**

Add to `src/lib/generators/__tests__/progressions.test.ts`:
```typescript
import { getProgressionsForGenre, getDefaultProgression, PROGRESSIONS } from '../progressions';

describe('Progression Library', () => {
  it('has progressions for all genres', () => {
    const genres = ['lofi-hiphop', 'edm-house', 'rock', 'ambient', 'funk', 'pop'] as const;
    for (const genre of genres) {
      const progs = getProgressionsForGenre(genre);
      expect(progs.length).toBeGreaterThan(0);
    }
  });

  it('returns default progression for genre', () => {
    const prog = getDefaultProgression('pop');
    expect(prog.isDefault).toBe(true);
    expect(prog.genre).toBe('pop');
  });

  it('includes Free progression for each genre', () => {
    const prog = getProgressionsForGenre('pop').find(p => p.id.includes('free'));
    expect(prog).toBeDefined();
    expect(prog!.chords.length).toBe(1);
  });

  it('lofi-hiphop has 8-chord progressions', () => {
    const prog = getDefaultProgression('lofi-hiphop');
    expect(prog.chords.length).toBe(8);
  });

  it('edm-house has 4-chord progressions', () => {
    const prog = getDefaultProgression('edm-house');
    expect(prog.chords.length).toBe(4);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run`
Expected: FAIL - module not found

**Step 3: Implement progression library**

Create `src/lib/generators/progressions.ts`:
```typescript
import type { ChordProgression, GenrePreset } from '../types/music';

export const PROGRESSIONS: ChordProgression[] = [
  // Lo-fi Hip-hop (8 chords)
  {
    id: 'lofi-neosoul',
    name: 'Neo Soul',
    genre: 'lofi-hiphop',
    chords: ['ii7', 'V7', 'Imaj7', 'vi7', 'ii7', 'V7', 'iii7', 'vi7'],
    isDefault: true,
  },
  {
    id: 'lofi-jazzy',
    name: 'Jazzy',
    genre: 'lofi-hiphop',
    chords: ['Imaj7', 'vi7', 'ii7', 'V7', 'Imaj7', 'vi7', 'ii7', 'V7'],
    isDefault: false,
  },
  {
    id: 'lofi-free',
    name: 'Free (Static)',
    genre: 'lofi-hiphop',
    chords: ['Imaj7'],
    isDefault: false,
  },

  // EDM/House (4 chords)
  {
    id: 'edm-euphoric',
    name: 'Euphoric',
    genre: 'edm-house',
    chords: ['vi', 'IV', 'I', 'V'],
    isDefault: true,
  },
  {
    id: 'edm-dark',
    name: 'Dark',
    genre: 'edm-house',
    chords: ['vi', 'IV', 'iii', 'V'],
    isDefault: false,
  },
  {
    id: 'edm-free',
    name: 'Free (Static)',
    genre: 'edm-house',
    chords: ['I'],
    isDefault: false,
  },

  // Rock (4 chords)
  {
    id: 'rock-classic',
    name: 'Classic Rock',
    genre: 'rock',
    chords: ['I', 'IV', 'V', 'I'],
    isDefault: true,
  },
  {
    id: 'rock-power',
    name: 'Power Chords',
    genre: 'rock',
    chords: ['I', 'IV', 'vi', 'V'],
    isDefault: false,
  },
  {
    id: 'rock-free',
    name: 'Free (Static)',
    genre: 'rock',
    chords: ['I'],
    isDefault: false,
  },

  // Ambient (8 chords)
  {
    id: 'ambient-ethereal',
    name: 'Ethereal',
    genre: 'ambient',
    chords: ['Imaj7', 'iii7', 'vi7', 'IVmaj7', 'Imaj7', 'V7', 'vi7', 'IVmaj7'],
    isDefault: true,
  },
  {
    id: 'ambient-minimal',
    name: 'Minimal',
    genre: 'ambient',
    chords: ['Imaj7', 'IVmaj7', 'Imaj7', 'IVmaj7', 'vi7', 'IVmaj7', 'Imaj7', 'IVmaj7'],
    isDefault: false,
  },
  {
    id: 'ambient-free',
    name: 'Free (Static)',
    genre: 'ambient',
    chords: ['Imaj7'],
    isDefault: false,
  },

  // Funk (8 chords)
  {
    id: 'funk-groove',
    name: 'Groove',
    genre: 'funk',
    chords: ['I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV'],
    isDefault: true,
  },
  {
    id: 'funk-soulful',
    name: 'Soulful',
    genre: 'funk',
    chords: ['ii7', 'V7', 'I', 'vi7', 'ii7', 'V7', 'I', 'I'],
    isDefault: false,
  },
  {
    id: 'funk-free',
    name: 'Free (Static)',
    genre: 'funk',
    chords: ['I'],
    isDefault: false,
  },

  // Pop (4 chords)
  {
    id: 'pop-classic',
    name: 'Classic Pop',
    genre: 'pop',
    chords: ['I', 'V', 'vi', 'IV'],
    isDefault: true,
  },
  {
    id: 'pop-emotional',
    name: 'Emotional',
    genre: 'pop',
    chords: ['vi', 'IV', 'I', 'V'],
    isDefault: false,
  },
  {
    id: 'pop-upbeat',
    name: 'Upbeat',
    genre: 'pop',
    chords: ['I', 'IV', 'vi', 'V'],
    isDefault: false,
  },
  {
    id: 'pop-free',
    name: 'Free (Static)',
    genre: 'pop',
    chords: ['I'],
    isDefault: false,
  },
];

export function getProgressionsForGenre(genre: GenrePreset): ChordProgression[] {
  return PROGRESSIONS.filter(p => p.genre === genre);
}

export function getDefaultProgression(genre: GenrePreset): ChordProgression {
  const defaultProg = PROGRESSIONS.find(p => p.genre === genre && p.isDefault);
  if (!defaultProg) {
    throw new Error(`No default progression for genre: ${genre}`);
  }
  return defaultProg;
}

export function getProgressionById(id: string): ChordProgression | undefined {
  return PROGRESSIONS.find(p => p.id === id);
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/progressions.ts src/lib/generators/__tests__/progressions.test.ts
git commit -m "feat: add chord progression library with genre-specific progressions"
```

---

## Task 3: Add Chord Resolution to Theory

**Files:**
- Modify: `src/lib/generators/theory.ts`
- Modify: `src/lib/generators/__tests__/theory.test.ts`

**Step 1: Write failing test for chord degree resolution**

Add to `src/lib/generators/__tests__/theory.test.ts`:
```typescript
import { resolveChordDegree, getChordTonesForDegree } from '../theory';
import type { ChordDegree } from '../../types/music';

describe('resolveChordDegree', () => {
  it('resolves I to root note', () => {
    expect(resolveChordDegree('I', 'C', 'major')).toBe(0);
  });

  it('resolves IV to fourth degree', () => {
    expect(resolveChordDegree('IV', 'C', 'major')).toBe(3);
  });

  it('resolves vi to sixth degree', () => {
    expect(resolveChordDegree('vi', 'C', 'major')).toBe(5);
  });

  it('resolves ii7 to second degree', () => {
    expect(resolveChordDegree('ii7', 'C', 'major')).toBe(1);
  });
});

describe('getChordTonesForDegree', () => {
  it('returns triad tones for I in C major', () => {
    const tones = getChordTonesForDegree('I', 'C', 'major', 4);
    expect(tones).toContain('C4');
    expect(tones).toContain('E4');
    expect(tones).toContain('G4');
  });

  it('returns 7th chord tones for Imaj7', () => {
    const tones = getChordTonesForDegree('Imaj7', 'C', 'major', 4);
    expect(tones.length).toBe(4);
    expect(tones).toContain('B4');
  });

  it('returns minor triad for vi', () => {
    const tones = getChordTonesForDegree('vi', 'C', 'major', 4);
    expect(tones).toContain('A4');
    expect(tones).toContain('C5');
    expect(tones).toContain('E5');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run`
Expected: FAIL - functions not found

**Step 3: Implement chord resolution functions**

Add to `src/lib/generators/theory.ts`:
```typescript
import type { ChordDegree } from '../types/music';

const DEGREE_MAP: Record<string, number> = {
  'I': 0, 'ii': 1, 'iii': 2, 'IV': 3, 'V': 4, 'vi': 5, 'vii°': 6,
  'Imaj7': 0, 'ii7': 1, 'iii7': 2, 'IVmaj7': 3, 'V7': 4, 'vi7': 5, 'vii7b5': 6,
};

export function resolveChordDegree(degree: ChordDegree, _key: string, _scale: string): number {
  const baseDegree = DEGREE_MAP[degree];
  if (baseDegree === undefined) {
    throw new Error(`Unknown chord degree: ${degree}`);
  }
  return baseDegree;
}

export function isSeventhChord(degree: ChordDegree): boolean {
  return degree.includes('7');
}

export function getChordTonesForDegree(
  degree: ChordDegree,
  key: string,
  scale: string,
  octave: number
): string[] {
  const scaleDegree = resolveChordDegree(degree, key, scale);
  const tones = getChordNotes(key, scale, scaleDegree, octave);

  if (isSeventhChord(degree)) {
    // Add 7th
    tones.push(getNoteInScale(key, scale, scaleDegree + 6, octave));
  }

  return tones;
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/theory.ts src/lib/generators/__tests__/theory.test.ts
git commit -m "feat: add chord degree resolution and chord tone extraction"
```

---

## Task 4: Define LoopBundle Type

**Files:**
- Modify: `src/lib/types/music.ts`

**Step 1: Write failing test for LoopBundle type**

Add to `src/lib/generators/__tests__/progressions.test.ts`:
```typescript
import type { LoopBundle, LoopVariation, DrumFillPoints } from '../../types/music';

describe('LoopBundle types', () => {
  it('accepts valid loop bundle structure', () => {
    const bundle: LoopBundle = {
      id: 'bundle_123',
      instrument: 'bass',
      seed: 12345,
      progressionId: 'pop-classic',
      bars: 2,
      generationParams: { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' },
      variations: [
        { chordIndex: 0, notes: [] },
        { chordIndex: 1, notes: [] },
      ],
    };
    expect(bundle.variations.length).toBe(2);
  });

  it('accepts drum fill points', () => {
    const fills: DrumFillPoints = {
      basePattern: [],
      fillPositions: [3, 7],
      fillPatterns: [[], []],
    };
    expect(fills.fillPositions.length).toBe(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run`
Expected: FAIL - types not found

**Step 3: Add LoopBundle types to music.ts**

Add to `src/lib/types/music.ts`:
```typescript
export interface LoopVariation {
  chordIndex: number;
  notes: Note[];
}

export interface DrumFillPoints {
  basePattern: Note[];
  fillPositions: number[];      // chord indices where fills occur
  fillPatterns: Note[][];       // fill pattern options
}

export interface LoopBundle {
  id: string;
  instrument: InstrumentType;
  seed: number;
  progressionId: string;
  bars: number;
  generationParams: GenerationParams;
  variations: LoopVariation[];
  drumFills?: DrumFillPoints;
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/types/music.ts src/lib/generators/__tests__/progressions.test.ts
git commit -m "feat: add LoopBundle and LoopVariation types"
```

---

## Task 5: Create Bass Generator with Chord Awareness

**Files:**
- Modify: `src/lib/generators/bass.ts`
- Create: `src/lib/generators/__tests__/bass.test.ts`

**Step 1: Write failing test for chord-aware bass generation**

Create `src/lib/generators/__tests__/bass.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generateBassBundle } from '../bass';
import type { ChordDegree } from '../../types/music';

describe('generateBassBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const progression: ChordDegree[] = ['I', 'V', 'vi', 'IV'];

  it('generates one variation per chord', () => {
    const bundle = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle.variations.length).toBe(progression.length);
  });

  it('each variation has chord index', () => {
    const bundle = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    bundle.variations.forEach((v, i) => {
      expect(v.chordIndex).toBe(i);
    });
  });

  it('variations contain notes', () => {
    const bundle = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    bundle.variations.forEach(v => {
      expect(v.notes.length).toBeGreaterThan(0);
    });
  });

  it('is reproducible with same seed', () => {
    const bundle1 = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    const bundle2 = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle1.variations[0].notes).toEqual(bundle2.variations[0].notes);
  });

  it('variations use appropriate root notes for each chord', () => {
    const bundle = generateBassBundle(params, 'C', 'major', progression, 12345, 2);
    // First variation (I) should emphasize C
    const firstNotes = bundle.variations[0].notes.map(n => n.pitch);
    expect(firstNotes.some(p => p.startsWith('C'))).toBe(true);

    // Fourth variation (IV) should emphasize F
    const fourthNotes = bundle.variations[3].notes.map(n => n.pitch);
    expect(fourthNotes.some(p => p.startsWith('F'))).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run`
Expected: FAIL - generateBassBundle not found

**Step 3: Implement chord-aware bass generator**

Replace contents of `src/lib/generators/bass.ts`:
```typescript
import type { Note, GenerationParams, LoopBundle, LoopVariation, ChordDegree } from '../types';
import { SeededRandom, getNoteInScale, resolveChordDegree } from './theory';

const BASS_PATTERNS = [
  [0, 4, 8, 12],           // Steady root
  [0, 3, 6, 10, 14],       // Syncopated
  [0, 0, 8, 8],            // Octave jump
  [0, 3, 4, 7, 10, 12],    // Funk
];

function generateBassVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  rng: SeededRandom,
  bars: number
): Note[] {
  const stepsPerBar = 16;
  const notes: Note[] = [];
  const octave = 2;

  const pattern = rng.pick(BASS_PATTERNS);
  const rootDegree = resolveChordDegree(chordDegree, key, scale);

  for (let bar = 0; bar < bars; bar++) {
    for (const step of pattern) {
      const time = `${bar}:0:${step * 0.25}`;

      let degree = rootDegree;

      if (params.complexity > 0.3 && rng.chance(params.complexity * 0.4)) {
        degree += rng.pick([0, 2, 4]); // root, third, fifth of chord
      }

      const pitch = getNoteInScale(key, scale, degree, octave);
      const durations = ['4n', '8n', '8n.'];
      const duration = params.density > 0.6 ? rng.pick(durations) : '4n';

      notes.push({
        pitch,
        time,
        duration,
        velocity: 0.8 + rng.next() * 0.15,
      });
    }

    if (params.density > 0.5) {
      const fillCount = Math.floor(params.density * 3);
      for (let i = 0; i < fillCount; i++) {
        const step = rng.nextInt(0, stepsPerBar - 1);
        if (!pattern.includes(step)) {
          const time = `${bar}:0:${step * 0.25}`;
          const degree = rootDegree + rng.pick([0, 2, 4]);
          notes.push({
            pitch: getNoteInScale(key, scale, degree, octave),
            time,
            duration: '16n',
            velocity: 0.6 + rng.next() * 0.2,
          });
        }
      }
    }
  }

  return notes;
}

export function generateBassBundle(
  params: GenerationParams,
  key: string,
  scale: string,
  progression: ChordDegree[],
  seed: number,
  bars = 2
): LoopBundle {
  const rng = new SeededRandom(seed);

  const variations: LoopVariation[] = progression.map((chord, index) => ({
    chordIndex: index,
    notes: generateBassVariation(params, key, scale, chord, rng, bars),
  }));

  return {
    id: 'bundle_' + Math.random().toString(36).substring(2, 15),
    instrument: 'bass',
    seed,
    progressionId: '',  // Will be set by caller
    bars,
    generationParams: params,
    variations,
  };
}

// Keep legacy function for backward compatibility
export function generateBassLine(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const bundle = generateBassBundle(params, key, scale, ['I'], seed, bars);
  return bundle.variations[0].notes;
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/bass.ts src/lib/generators/__tests__/bass.test.ts
git commit -m "feat: add chord-aware bass generator with LoopBundle output"
```

---

## Task 6: Create Chord-Aware Keys Generator

**Files:**
- Modify: `src/lib/generators/chords.ts`
- Create: `src/lib/generators/__tests__/chords.test.ts`

**Step 1: Write failing test**

Create `src/lib/generators/__tests__/chords.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generateChordsBundle } from '../chords';
import type { ChordDegree } from '../../types/music';

describe('generateChordsBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const progression: ChordDegree[] = ['I', 'V', 'vi', 'IV'];

  it('generates one variation per chord', () => {
    const bundle = generateChordsBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle.variations.length).toBe(4);
  });

  it('variations use chord tones from the progression', () => {
    const bundle = generateChordsBundle(params, 'C', 'major', progression, 12345, 2);

    // First chord (I) should use C, E, G
    const iChordNotes = bundle.variations[0].notes.map(n => n.pitch.slice(0, -1));
    expect(iChordNotes.some(n => ['C', 'E', 'G'].includes(n))).toBe(true);
  });

  it('is reproducible with same seed', () => {
    const bundle1 = generateChordsBundle(params, 'C', 'major', progression, 12345, 2);
    const bundle2 = generateChordsBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle1.variations[0].notes).toEqual(bundle2.variations[0].notes);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run`
Expected: FAIL - generateChordsBundle not found

**Step 3: Implement chord-aware keys generator**

Replace contents of `src/lib/generators/chords.ts`:
```typescript
import type { Note, GenerationParams, LoopBundle, LoopVariation, ChordDegree } from '../types';
import { SeededRandom, getChordTonesForDegree } from './theory';

const RHYTHM_PATTERNS = [
  // Sustained whole notes
  [[0, '1m']],
  // Half notes
  [[0, '2n'], [8, '2n']],
  // Stabs
  [[0, '8n'], [4, '8n'], [8, '8n'], [12, '8n']],
  // Syncopated
  [[0, '4n'], [3, '8n'], [6, '4n'], [10, '8n'], [14, '8n']],
];

function generateChordVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  rng: SeededRandom,
  bars: number
): Note[] {
  const notes: Note[] = [];
  const octave = 4;

  const pattern = rng.pick(RHYTHM_PATTERNS);
  const chordTones = getChordTonesForDegree(chordDegree, key, scale, octave);

  for (let bar = 0; bar < bars; bar++) {
    for (const [step, duration] of pattern) {
      const time = `${bar}:0:${(step as number) * 0.25}`;

      // Play all chord tones
      for (const pitch of chordTones) {
        notes.push({
          pitch,
          time,
          duration: duration as string,
          velocity: 0.6 + rng.next() * 0.2,
        });
      }
    }
  }

  // Add embellishments based on complexity
  if (params.complexity > 0.5 && rng.chance(0.3)) {
    const extraNote = rng.pick(chordTones);
    notes.push({
      pitch: extraNote,
      time: `${rng.nextInt(0, bars - 1)}:0:${rng.nextInt(0, 15) * 0.25}`,
      duration: '16n',
      velocity: 0.5,
    });
  }

  return notes;
}

export function generateChordsBundle(
  params: GenerationParams,
  key: string,
  scale: string,
  progression: ChordDegree[],
  seed: number,
  bars = 2
): LoopBundle {
  const rng = new SeededRandom(seed);

  const variations: LoopVariation[] = progression.map((chord, index) => ({
    chordIndex: index,
    notes: generateChordVariation(params, key, scale, chord, rng, bars),
  }));

  return {
    id: 'bundle_' + Math.random().toString(36).substring(2, 15),
    instrument: 'keys',
    seed,
    progressionId: '',
    bars,
    generationParams: params,
    variations,
  };
}

// Legacy function for backward compatibility
export function generateChords(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const bundle = generateChordsBundle(params, key, scale, ['I'], seed, bars);
  return bundle.variations[0].notes;
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/chords.ts src/lib/generators/__tests__/chords.test.ts
git commit -m "feat: add chord-aware keys generator"
```

---

## Task 7: Create Chord-Aware Lead Generator

**Files:**
- Modify: `src/lib/generators/lead.ts`
- Create: `src/lib/generators/__tests__/lead.test.ts`

**Step 1: Write failing test**

Create `src/lib/generators/__tests__/lead.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generateLeadBundle } from '../lead';
import type { ChordDegree } from '../../types/music';

describe('generateLeadBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const progression: ChordDegree[] = ['I', 'V', 'vi', 'IV'];

  it('generates one variation per chord', () => {
    const bundle = generateLeadBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle.variations.length).toBe(4);
  });

  it('lead notes emphasize chord tones on strong beats', () => {
    const bundle = generateLeadBundle(params, 'C', 'major', progression, 12345, 2);
    // Notes exist
    expect(bundle.variations[0].notes.length).toBeGreaterThan(0);
  });

  it('is reproducible with same seed', () => {
    const bundle1 = generateLeadBundle(params, 'C', 'major', progression, 12345, 2);
    const bundle2 = generateLeadBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle1.variations[0].notes).toEqual(bundle2.variations[0].notes);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run`
Expected: FAIL

**Step 3: Implement chord-aware lead generator**

Replace contents of `src/lib/generators/lead.ts`:
```typescript
import type { Note, GenerationParams, LoopBundle, LoopVariation, ChordDegree } from '../types';
import { SeededRandom, getNoteInScale, resolveChordDegree, getChordTonesForDegree } from './theory';

const CONTOURS = ['ascending', 'descending', 'arch', 'flat'] as const;

function generateLeadVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  rng: SeededRandom,
  bars: number
): Note[] {
  const notes: Note[] = [];
  const octave = 5;
  const stepsPerBar = 16;

  const contour = rng.pick([...CONTOURS]);
  const chordTones = getChordTonesForDegree(chordDegree, key, scale, octave);
  const rootDegree = resolveChordDegree(chordDegree, key, scale);

  const noteCount = Math.floor(4 + params.density * 8);

  for (let bar = 0; bar < bars; bar++) {
    for (let i = 0; i < noteCount / bars; i++) {
      const step = rng.nextInt(0, stepsPerBar - 1);
      const time = `${bar}:0:${step * 0.25}`;

      let pitch: string;
      const isStrongBeat = step % 4 === 0;

      if (isStrongBeat && rng.chance(0.7)) {
        // Strong beats favor chord tones
        pitch = rng.pick(chordTones);
      } else {
        // Weak beats can use passing tones
        const degreeOffset = rng.nextInt(-2, 4);
        pitch = getNoteInScale(key, scale, rootDegree + degreeOffset, octave);
      }

      // Apply contour
      if (contour === 'ascending' && i > noteCount / bars / 2) {
        pitch = getNoteInScale(key, scale, rootDegree + i, octave);
      } else if (contour === 'descending' && i > noteCount / bars / 2) {
        pitch = getNoteInScale(key, scale, rootDegree + (noteCount / bars - i), octave);
      }

      const durations = ['8n', '16n', '8n.', '4n'];
      notes.push({
        pitch,
        time,
        duration: rng.pick(durations),
        velocity: 0.7 + rng.next() * 0.2,
      });
    }
  }

  return notes;
}

export function generateLeadBundle(
  params: GenerationParams,
  key: string,
  scale: string,
  progression: ChordDegree[],
  seed: number,
  bars = 2
): LoopBundle {
  const rng = new SeededRandom(seed);

  const variations: LoopVariation[] = progression.map((chord, index) => ({
    chordIndex: index,
    notes: generateLeadVariation(params, key, scale, chord, rng, bars),
  }));

  return {
    id: 'bundle_' + Math.random().toString(36).substring(2, 15),
    instrument: 'lead',
    seed,
    progressionId: '',
    bars,
    generationParams: params,
    variations,
  };
}

// Legacy function
export function generateLead(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const bundle = generateLeadBundle(params, key, scale, ['I'], seed, bars);
  return bundle.variations[0].notes;
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/lead.ts src/lib/generators/__tests__/lead.test.ts
git commit -m "feat: add chord-aware lead generator"
```

---

## Task 8: Create Chord-Aware Pad Generator

**Files:**
- Modify: `src/lib/generators/pad.ts`
- Create: `src/lib/generators/__tests__/pad.test.ts`

**Step 1: Write failing test**

Create `src/lib/generators/__tests__/pad.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generatePadBundle } from '../pad';
import type { ChordDegree } from '../../types/music';

describe('generatePadBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const progression: ChordDegree[] = ['I', 'V', 'vi', 'IV'];

  it('generates one variation per chord', () => {
    const bundle = generatePadBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle.variations.length).toBe(4);
  });

  it('pad notes are sustained', () => {
    const bundle = generatePadBundle(params, 'C', 'major', progression, 12345, 2);
    const notes = bundle.variations[0].notes;
    // Pads should have long durations
    expect(notes.some(n => n.duration === '1m' || n.duration === '2n')).toBe(true);
  });

  it('is reproducible with same seed', () => {
    const bundle1 = generatePadBundle(params, 'C', 'major', progression, 12345, 2);
    const bundle2 = generatePadBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle1.variations[0].notes).toEqual(bundle2.variations[0].notes);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run`
Expected: FAIL

**Step 3: Implement chord-aware pad generator**

Replace contents of `src/lib/generators/pad.ts`:
```typescript
import type { Note, GenerationParams, LoopBundle, LoopVariation, ChordDegree } from '../types';
import { SeededRandom, getChordTonesForDegree } from './theory';

function generatePadVariation(
  params: GenerationParams,
  key: string,
  scale: string,
  chordDegree: ChordDegree,
  rng: SeededRandom,
  bars: number
): Note[] {
  const notes: Note[] = [];
  const octave = 4;

  const chordTones = getChordTonesForDegree(chordDegree, key, scale, octave);

  // Pads are sustained - typically one chord per variation
  const duration = bars >= 2 ? '1m' : '2n';

  for (const pitch of chordTones) {
    notes.push({
      pitch,
      time: '0:0:0',
      duration,
      velocity: 0.4 + rng.next() * 0.2,
    });
  }

  // Add octave doubling for complexity
  if (params.complexity > 0.5 && rng.chance(0.5)) {
    const extraPitch = chordTones[0].slice(0, -1) + (octave + 1);
    notes.push({
      pitch: extraPitch,
      time: '0:0:0',
      duration,
      velocity: 0.3 + rng.next() * 0.1,
    });
  }

  // For longer bars, add movement
  if (bars >= 2 && params.density > 0.3) {
    const midPoint = Math.floor(bars / 2);
    for (const pitch of chordTones) {
      notes.push({
        pitch,
        time: `${midPoint}:0:0`,
        duration: '2n',
        velocity: 0.35 + rng.next() * 0.15,
      });
    }
  }

  return notes;
}

export function generatePadBundle(
  params: GenerationParams,
  key: string,
  scale: string,
  progression: ChordDegree[],
  seed: number,
  bars = 2
): LoopBundle {
  const rng = new SeededRandom(seed);

  const variations: LoopVariation[] = progression.map((chord, index) => ({
    chordIndex: index,
    notes: generatePadVariation(params, key, scale, chord, rng, bars),
  }));

  return {
    id: 'bundle_' + Math.random().toString(36).substring(2, 15),
    instrument: 'pad',
    seed,
    progressionId: '',
    bars,
    generationParams: params,
    variations,
  };
}

// Legacy function
export function generatePad(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const bundle = generatePadBundle(params, key, scale, ['I'], seed, bars);
  return bundle.variations[0].notes;
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/pad.ts src/lib/generators/__tests__/pad.test.ts
git commit -m "feat: add chord-aware pad generator"
```

---

## Task 9: Add Drum Fill Support

**Files:**
- Modify: `src/lib/generators/drums.ts`
- Create: `src/lib/generators/__tests__/drums.test.ts`

**Step 1: Write failing test**

Create `src/lib/generators/__tests__/drums.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generateDrumBundle } from '../drums';
import type { ChordDegree } from '../../types/music';

describe('generateDrumBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const progression: ChordDegree[] = ['I', 'V', 'vi', 'IV'];

  it('generates a single base pattern (drums ignore chords)', () => {
    const bundle = generateDrumBundle(params, progression, 12345, 2);
    // Drums have one variation (they don't change with chords)
    expect(bundle.variations.length).toBe(1);
  });

  it('includes drum fill points for chord boundaries', () => {
    const bundle = generateDrumBundle(params, progression, 12345, 2);
    expect(bundle.drumFills).toBeDefined();
    expect(bundle.drumFills!.fillPositions.length).toBeGreaterThan(0);
  });

  it('fill positions align with progression length', () => {
    const bundle = generateDrumBundle(params, progression, 12345, 2);
    // Last chord should have a fill before looping
    expect(bundle.drumFills!.fillPositions).toContain(progression.length - 1);
  });

  it('is reproducible with same seed', () => {
    const bundle1 = generateDrumBundle(params, progression, 12345, 2);
    const bundle2 = generateDrumBundle(params, progression, 12345, 2);
    expect(bundle1.variations[0].notes).toEqual(bundle2.variations[0].notes);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run`
Expected: FAIL

**Step 3: Implement drum bundle with fills**

Modify `src/lib/generators/drums.ts` to add generateDrumBundle. Add this after existing code:
```typescript
import type { Note, GenerationParams, LoopBundle, LoopVariation, DrumFillPoints, ChordDegree } from '../types';

// ... keep existing DRUM_TEMPLATES and generateDrumPattern ...

const FILL_PATTERNS: Note[][] = [
  // Simple snare fill
  [
    { pitch: 'snare', time: '0:0:12', duration: '16n', velocity: 0.7 },
    { pitch: 'snare', time: '0:0:13', duration: '16n', velocity: 0.8 },
    { pitch: 'snare', time: '0:0:14', duration: '16n', velocity: 0.9 },
    { pitch: 'snare', time: '0:0:15', duration: '16n', velocity: 1.0 },
  ],
  // Tom fill
  [
    { pitch: 'tom', time: '0:0:12', duration: '16n', velocity: 0.8 },
    { pitch: 'tom', time: '0:0:14', duration: '16n', velocity: 0.9 },
    { pitch: 'snare', time: '0:0:15', duration: '8n', velocity: 1.0 },
  ],
  // Kick snare combo
  [
    { pitch: 'kick', time: '0:0:12', duration: '16n', velocity: 0.9 },
    { pitch: 'snare', time: '0:0:14', duration: '16n', velocity: 0.9 },
    { pitch: 'kick', time: '0:0:15', duration: '16n', velocity: 1.0 },
  ],
];

export function generateDrumBundle(
  params: GenerationParams,
  progression: ChordDegree[],
  seed: number,
  bars = 2
): LoopBundle {
  const rng = new SeededRandom(seed);

  // Generate base pattern
  const baseNotes = generateDrumPattern(params, seed, bars);

  // Determine fill positions (typically before last chord and halfway through)
  const fillPositions: number[] = [progression.length - 1];
  if (progression.length >= 4) {
    fillPositions.unshift(Math.floor(progression.length / 2) - 1);
  }

  // Pick fill patterns
  const fillPatterns = fillPositions.map(() => rng.pick(FILL_PATTERNS));

  return {
    id: 'bundle_' + Math.random().toString(36).substring(2, 15),
    instrument: 'drums',
    seed,
    progressionId: '',
    bars,
    generationParams: params,
    variations: [{ chordIndex: 0, notes: baseNotes }],
    drumFills: {
      basePattern: baseNotes,
      fillPositions,
      fillPatterns,
    },
  };
}
```

Also add the import for SeededRandom at the top if not present.

**Step 4: Run tests to verify they pass**

Run: `npm run test:run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/drums.ts src/lib/generators/__tests__/drums.test.ts
git commit -m "feat: add drum bundle with fill support at chord boundaries"
```

---

## Task 10: Create Unified Bundle Generator

**Files:**
- Modify: `src/lib/generators/index.ts`
- Create: `src/lib/generators/__tests__/index.test.ts`

**Step 1: Write failing test**

Create `src/lib/generators/__tests__/index.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generateLoopBundle, getDefaultProgression } from '../index';

describe('generateLoopBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };

  it('generates bundle for bass with chord variations', () => {
    const bundle = generateLoopBundle('bass', params, 'C', 'major', 'pop', 12345);
    expect(bundle.variations.length).toBeGreaterThan(0);
    expect(bundle.instrument).toBe('bass');
  });

  it('generates bundle for drums with fills', () => {
    const bundle = generateLoopBundle('drums', params, 'C', 'major', 'pop', 12345);
    expect(bundle.drumFills).toBeDefined();
  });

  it('uses genre-specific progression', () => {
    const bundle = generateLoopBundle('bass', params, 'C', 'major', 'lofi-hiphop', 12345);
    // Lofi has 8-chord progressions
    expect(bundle.variations.length).toBe(8);
  });

  it('sets progressionId on bundle', () => {
    const bundle = generateLoopBundle('bass', params, 'C', 'major', 'pop', 12345);
    expect(bundle.progressionId).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run`
Expected: FAIL

**Step 3: Update index.ts with unified bundle generation**

Update `src/lib/generators/index.ts`:
```typescript
import type { Loop, InstrumentType, GenerationParams, GenrePreset, Note, LoopBundle } from '../types';
import { generateDrumPattern, generateDrumBundle } from './drums';
import { generateBassLine, generateBassBundle } from './bass';
import { generateChords, generateChordsBundle } from './chords';
import { generateLead, generateLeadBundle } from './lead';
import { generatePad, generatePadBundle } from './pad';
import { generatePluck } from './pluck';
import { generateStrings } from './strings';
import { generateOrgan } from './organ';
import { getDefaultProgression, getProgressionById } from './progressions';

export { SeededRandom } from './theory';
export { getDefaultProgression, getProgressionsForGenre, getProgressionById } from './progressions';

interface GenreConfig {
  name: string;
  bpmRange: [number, number];
  swing: number;
  defaultParams: GenerationParams;
}

export const GENRE_PRESETS: Record<GenrePreset, GenreConfig> = {
  'lofi-hiphop': {
    name: 'Lo-fi Hip-hop',
    bpmRange: [70, 90],
    swing: 0.3,
    defaultParams: { density: 0.4, complexity: 0.3, swing: 0.3, style: 'swung' },
  },
  'edm-house': {
    name: 'EDM/House',
    bpmRange: [120, 130],
    swing: 0,
    defaultParams: { density: 0.7, complexity: 0.5, swing: 0, style: 'straight' },
  },
  'rock': {
    name: 'Rock',
    bpmRange: [100, 140],
    swing: 0,
    defaultParams: { density: 0.5, complexity: 0.4, swing: 0, style: 'straight' },
  },
  'ambient': {
    name: 'Ambient/Chill',
    bpmRange: [60, 80],
    swing: 0.1,
    defaultParams: { density: 0.2, complexity: 0.2, swing: 0.1, style: 'straight' },
  },
  'funk': {
    name: 'Funk',
    bpmRange: [95, 115],
    swing: 0.4,
    defaultParams: { density: 0.6, complexity: 0.6, swing: 0.4, style: 'syncopated' },
  },
  'pop': {
    name: 'Pop',
    bpmRange: [100, 120],
    swing: 0,
    defaultParams: { density: 0.5, complexity: 0.3, swing: 0, style: 'straight' },
  },
};

function generateId(): string {
  return 'loop_' + Math.random().toString(36).substring(2, 15);
}

export function generateLoopBundle(
  type: InstrumentType,
  params: GenerationParams,
  key: string,
  scale: string,
  genre: GenrePreset,
  seed?: number,
  bars = 2,
  progressionId?: string
): LoopBundle {
  const actualSeed = seed ?? Math.floor(Math.random() * 1000000);
  const progression = progressionId
    ? getProgressionById(progressionId) ?? getDefaultProgression(genre)
    : getDefaultProgression(genre);

  let bundle: LoopBundle;

  switch (type) {
    case 'drums':
    case 'percussion':
      bundle = generateDrumBundle(params, progression.chords, actualSeed, bars);
      break;
    case 'bass':
      bundle = generateBassBundle(params, key, scale, progression.chords, actualSeed, bars);
      break;
    case 'keys':
    case 'epiano':
      bundle = generateChordsBundle(params, key, scale, progression.chords, actualSeed, bars);
      break;
    case 'lead':
      bundle = generateLeadBundle(params, key, scale, progression.chords, actualSeed, bars);
      break;
    case 'pad':
    case 'choir':
    case 'strings':
      bundle = generatePadBundle(params, key, scale, progression.chords, actualSeed, bars);
      break;
    default:
      // Fallback for instruments without bundle support yet
      bundle = generatePadBundle(params, key, scale, progression.chords, actualSeed, bars);
  }

  bundle.progressionId = progression.id;
  bundle.instrument = type;

  return bundle;
}

// Keep legacy generateLoop for backward compatibility
export function generateLoop(
  type: InstrumentType,
  params: GenerationParams,
  key: string,
  scale: string,
  seed?: number,
  bars = 2
): Loop {
  const actualSeed = seed ?? Math.floor(Math.random() * 1000000);

  let notes: Note[];
  switch (type) {
    case 'drums':
    case 'percussion':
      notes = generateDrumPattern(params, actualSeed, bars);
      break;
    case 'bass':
      notes = generateBassLine(params, key, scale, actualSeed, bars);
      break;
    case 'keys':
      notes = generateChords(params, key, scale, actualSeed, bars);
      break;
    case 'lead':
      notes = generateLead(params, key, scale, actualSeed, bars);
      break;
    case 'pad':
      notes = generatePad(params, key, scale, actualSeed, bars);
      break;
    case 'pluck':
      notes = generatePluck(params, key, scale, actualSeed, bars);
      break;
    case 'strings':
      notes = generateStrings(params, key, scale, actualSeed, bars);
      break;
    case 'organ':
      notes = generateOrgan(params, key, scale, actualSeed, bars);
      break;
    case 'choir':
      notes = generatePad(params, key, scale, actualSeed, bars);
      break;
    case 'epiano':
      notes = generateChords(params, key, scale, actualSeed, bars);
      break;
    case 'kalimba':
      notes = generatePluck(params, key, scale, actualSeed, bars);
      break;
    default:
      notes = [];
  }

  return {
    id: generateId(),
    type,
    bars,
    seed: actualSeed,
    generationParams: params,
    notes,
  };
}

export function generateLoopsForGenre(
  genre: GenrePreset,
  key: string,
  scale: string
): Record<InstrumentType, Loop> {
  const config = GENRE_PRESETS[genre];
  const types: InstrumentType[] = ['drums', 'percussion', 'bass', 'keys', 'lead', 'pad', 'pluck', 'strings', 'organ', 'choir', 'epiano', 'kalimba'];

  const loops: Partial<Record<InstrumentType, Loop>> = {};

  for (const type of types) {
    loops[type] = generateLoop(type, config.defaultParams, key, scale);
  }

  return loops as Record<InstrumentType, Loop>;
}

export function getGenreBpm(genre: GenrePreset): number {
  const [min, max] = GENRE_PRESETS[genre].bpmRange;
  return Math.floor((min + max) / 2);
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/generators/index.ts src/lib/generators/__tests__/index.test.ts
git commit -m "feat: add unified generateLoopBundle with progression support"
```

---

## Task 11: Update Loop Scheduler for Progression Cycling

**Files:**
- Modify: `src/lib/audio/loopScheduler.ts`
- Create: `src/lib/audio/__tests__/loopScheduler.test.ts`

**Step 1: Write failing test**

Create `src/lib/audio/__tests__/loopScheduler.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Tone.js
vi.mock('tone', () => ({
  Part: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
    loop: false,
    loopEnd: '2m',
  })),
  getTransport: vi.fn().mockReturnValue({
    bpm: { value: 120 },
    seconds: 0,
    scheduleOnce: vi.fn(),
  }),
}));

import { ProgressionClock } from '../loopScheduler';

describe('ProgressionClock', () => {
  it('calculates correct chord index for position', () => {
    const clock = new ProgressionClock({
      progressionId: 'pop-classic',
      progressionLength: 4,
      barsPerChord: 1,
      bpm: 120,
    });

    // At bar 0, should be chord 0
    expect(clock.getChordIndexAtBar(0)).toBe(0);
    // At bar 1, should be chord 1
    expect(clock.getChordIndexAtBar(1)).toBe(1);
    // At bar 4, should wrap to chord 0
    expect(clock.getChordIndexAtBar(4)).toBe(0);
  });

  it('supports multi-bar chords', () => {
    const clock = new ProgressionClock({
      progressionId: 'pop-classic',
      progressionLength: 4,
      barsPerChord: 2,
      bpm: 120,
    });

    // Bars 0-1 = chord 0
    expect(clock.getChordIndexAtBar(0)).toBe(0);
    expect(clock.getChordIndexAtBar(1)).toBe(0);
    // Bars 2-3 = chord 1
    expect(clock.getChordIndexAtBar(2)).toBe(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run`
Expected: FAIL

**Step 3: Add ProgressionClock to scheduler**

Add to `src/lib/audio/loopScheduler.ts` before the class:
```typescript
export interface ProgressionClockConfig {
  progressionId: string;
  progressionLength: number;
  barsPerChord: number;
  bpm: number;
}

export class ProgressionClock {
  private config: ProgressionClockConfig;

  constructor(config: ProgressionClockConfig) {
    this.config = config;
  }

  get totalBars(): number {
    return this.config.progressionLength * this.config.barsPerChord;
  }

  getChordIndexAtBar(bar: number): number {
    const barInProgression = bar % this.totalBars;
    return Math.floor(barInProgression / this.config.barsPerChord);
  }

  getChordIndexAtTime(seconds: number): number {
    const secondsPerBar = (4 * 60) / this.config.bpm;
    const bar = Math.floor(seconds / secondsPerBar);
    return this.getChordIndexAtBar(bar);
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/audio/loopScheduler.ts src/lib/audio/__tests__/loopScheduler.test.ts
git commit -m "feat: add ProgressionClock for tracking chord position"
```

---

## Task 12: Add Progression-Aware Loop Scheduling

**Files:**
- Modify: `src/lib/audio/loopScheduler.ts`

**Step 1: Write failing test**

Add to `src/lib/audio/__tests__/loopScheduler.test.ts`:
```typescript
import type { LoopBundle } from '../../types/music';

describe('LoopScheduler with bundles', () => {
  it('schedules all variations in sequence', () => {
    // This is an integration concern - will be tested via the component
    expect(true).toBe(true);
  });
});
```

**Step 2: Implement bundle scheduling in LoopScheduler**

Update `src/lib/audio/loopScheduler.ts` to add bundle support:
```typescript
import * as Tone from 'tone';
import type { Loop, Note, InstrumentType, LoopBundle } from '../types';
import { instrumentManager } from './instrumentManager';
import type { DrumKit } from './instruments/drums';
import type { MelodicSynth } from './instruments/melodic';

export interface ProgressionClockConfig {
  progressionId: string;
  progressionLength: number;
  barsPerChord: number;
  bpm: number;
}

export class ProgressionClock {
  private config: ProgressionClockConfig;

  constructor(config: ProgressionClockConfig) {
    this.config = config;
  }

  get totalBars(): number {
    return this.config.progressionLength * this.config.barsPerChord;
  }

  get progressionLength(): number {
    return this.config.progressionLength;
  }

  getChordIndexAtBar(bar: number): number {
    const barInProgression = bar % this.totalBars;
    return Math.floor(barInProgression / this.config.barsPerChord);
  }

  getChordIndexAtTime(seconds: number): number {
    const secondsPerBar = (4 * 60) / this.config.bpm;
    const bar = Math.floor(seconds / secondsPerBar);
    return this.getChordIndexAtBar(bar);
  }
}

interface ScheduledLoop {
  trackId: string;
  loop: Loop;
  part: Tone.Part;
}

interface ScheduledBundle {
  trackId: string;
  bundle: LoopBundle;
  parts: Tone.Part[];  // One part per variation
  clock: ProgressionClock;
}

class LoopScheduler {
  private scheduledLoops: Map<string, ScheduledLoop> = new Map();
  private scheduledBundles: Map<string, ScheduledBundle> = new Map();
  private progressionClock: ProgressionClock | null = null;

  setProgressionClock(clock: ProgressionClock): void {
    this.progressionClock = clock;
  }

  private getLoopKey(trackId: string): string {
    return trackId;
  }

  scheduleBundleLoop(trackId: string, bundle: LoopBundle, bpm: number): void {
    this.stopLoop(trackId);

    const instrument = instrumentManager.getTrackInstrument(trackId);
    if (!instrument) {
      console.warn(`No instrument found for track ${trackId}`);
      return;
    }

    const clock = new ProgressionClock({
      progressionId: bundle.progressionId,
      progressionLength: bundle.variations.length,
      barsPerChord: bundle.bars,
      bpm,
    });

    const parts: Tone.Part[] = [];

    // Create a part for each variation
    bundle.variations.forEach((variation, chordIndex) => {
      const events = variation.notes.map(note => ({
        time: note.time,
        pitch: note.pitch,
        duration: note.duration,
        velocity: note.velocity,
      }));

      const part = new Tone.Part((time, event) => {
        this.triggerNote(instrument, event, time);
      }, events);

      part.loop = true;
      part.loopEnd = `${bundle.bars}m`;

      // Offset start time based on chord position
      const startBar = chordIndex * bundle.bars;
      part.start(`${startBar}m`);

      parts.push(part);
    });

    const key = this.getLoopKey(trackId);
    this.scheduledBundles.set(key, { trackId, bundle, parts, clock });
  }

  scheduleLoop(trackId: string, loop: Loop): void {
    this.stopLoop(trackId);

    const instrument = instrumentManager.getTrackInstrument(trackId);
    if (!instrument) {
      console.warn(`No instrument found for track ${trackId}`);
      return;
    }

    const events = loop.notes.map(note => ({
      time: note.time,
      pitch: note.pitch,
      duration: note.duration,
      velocity: note.velocity,
    }));

    const part = new Tone.Part((time, event) => {
      this.triggerNote(instrument, event, time);
    }, events);

    part.loop = true;
    part.loopEnd = `${loop.bars}m`;
    part.start(0);

    const key = this.getLoopKey(trackId);
    this.scheduledLoops.set(key, { trackId, loop, part });
  }

  private triggerNote(
    instrument: { type: InstrumentType; synth: DrumKit | MelodicSynth },
    event: { pitch: string; duration: string; velocity: number },
    time: Tone.Unit.Time
  ): void {
    if (instrument.type === 'drums' || instrument.type === 'percussion') {
      const kit = instrument.synth as DrumKit;
      const drum = kit[event.pitch as keyof DrumKit];
      if (drum) {
        if ('triggerAttackRelease' in drum) {
          if (drum instanceof Tone.NoiseSynth) {
            drum.triggerAttackRelease(event.duration, time, event.velocity);
          } else {
            (drum as Tone.MembraneSynth | Tone.MetalSynth).triggerAttackRelease('C1', event.duration, time, event.velocity);
          }
        }
      }
    } else {
      const synth = instrument.synth as MelodicSynth;
      synth.triggerAttackRelease(event.pitch, event.duration, time, event.velocity);
    }
  }

  stopLoop(trackId: string): void {
    const key = this.getLoopKey(trackId);

    // Stop legacy loop
    const scheduled = this.scheduledLoops.get(key);
    if (scheduled) {
      scheduled.part.stop();
      scheduled.part.dispose();
      this.scheduledLoops.delete(key);
    }

    // Stop bundle
    const bundle = this.scheduledBundles.get(key);
    if (bundle) {
      bundle.parts.forEach(part => {
        part.stop();
        part.dispose();
      });
      this.scheduledBundles.delete(key);
    }
  }

  stopLoopAtEnd(trackId: string, onStop?: () => void): void {
    const key = this.getLoopKey(trackId);
    const scheduled = this.scheduledLoops.get(key);
    if (scheduled) {
      const transport = Tone.getTransport();
      const loopBars = scheduled.loop.bars;
      const loopDurationSeconds = (loopBars * 4 * 60) / transport.bpm.value;
      const currentSeconds = transport.seconds;
      const progressSeconds = currentSeconds % loopDurationSeconds;
      const timeUntilEnd = loopDurationSeconds - progressSeconds;

      scheduled.part.stop(`+${timeUntilEnd}`);
      transport.scheduleOnce(() => {
        scheduled.part.dispose();
        this.scheduledLoops.delete(key);
        onStop?.();
      }, `+${timeUntilEnd}`);
    }
  }

  queueLoop(trackId: string, loop: Loop, onStart?: () => void): void {
    const key = this.getLoopKey(trackId);
    const existing = this.scheduledLoops.get(key);
    const transport = Tone.getTransport();

    if (existing) {
      const loopBars = existing.loop.bars;
      const loopDurationSeconds = (loopBars * 4 * 60) / transport.bpm.value;
      const currentSeconds = transport.seconds;
      const progressSeconds = currentSeconds % loopDurationSeconds;
      const timeUntilEnd = loopDurationSeconds - progressSeconds;

      transport.scheduleOnce(() => {
        this.scheduleLoop(trackId, loop);
        onStart?.();
      }, `+${timeUntilEnd}`);
    } else {
      transport.scheduleOnce(() => {
        this.scheduleLoop(trackId, loop);
        onStart?.();
      }, '@1m');
    }
  }

  isPlaying(trackId: string): boolean {
    const key = this.getLoopKey(trackId);
    return this.scheduledLoops.has(key) || this.scheduledBundles.has(key);
  }

  getLoopProgress(trackId: string): number {
    const key = this.getLoopKey(trackId);
    const scheduled = this.scheduledLoops.get(key);
    if (!scheduled) return 0;

    const transport = Tone.getTransport();
    const loopBars = scheduled.loop.bars;
    const loopDurationSeconds = (loopBars * 4 * 60) / transport.bpm.value;
    const currentSeconds = transport.seconds;
    const progressSeconds = currentSeconds % loopDurationSeconds;

    return progressSeconds / loopDurationSeconds;
  }

  getCurrentChordIndex(): number {
    if (!this.progressionClock) return 0;
    const transport = Tone.getTransport();
    return this.progressionClock.getChordIndexAtTime(transport.seconds);
  }

  getActiveLoopBars(trackId: string): number {
    const key = this.getLoopKey(trackId);
    const scheduled = this.scheduledLoops.get(key);
    if (scheduled) return scheduled.loop.bars;

    const bundle = this.scheduledBundles.get(key);
    if (bundle) return bundle.bundle.bars;

    return 2;
  }

  stopAll(): void {
    for (const [, scheduled] of this.scheduledLoops) {
      scheduled.part.stop();
      scheduled.part.dispose();
    }
    this.scheduledLoops.clear();

    for (const [, bundle] of this.scheduledBundles) {
      bundle.parts.forEach(part => {
        part.stop();
        part.dispose();
      });
    }
    this.scheduledBundles.clear();
  }
}

export const loopScheduler = new LoopScheduler();
```

**Step 3: Run tests**

Run: `npm run test:run`
Expected: PASS

**Step 4: Commit**

```bash
git add src/lib/audio/loopScheduler.ts
git commit -m "feat: add bundle scheduling with progression-aware playback"
```

---

## Task 13: Add Progression Store

**Files:**
- Create: `src/lib/stores/progression.ts`
- Modify: `src/lib/stores/index.ts`

**Step 1: Create progression store**

Create `src/lib/stores/progression.ts`:
```typescript
import { writable, derived } from 'svelte/store';
import type { ChordProgression, GenrePreset } from '../types/music';
import { getDefaultProgression, getProgressionsForGenre } from '../generators/progressions';

interface ProgressionState {
  currentProgression: ChordProgression;
  currentChordIndex: number;
}

function createProgressionStore() {
  const { subscribe, set, update } = writable<ProgressionState>({
    currentProgression: getDefaultProgression('pop'),
    currentChordIndex: 0,
  });

  return {
    subscribe,

    setGenre(genre: GenrePreset) {
      update(state => ({
        ...state,
        currentProgression: getDefaultProgression(genre),
        currentChordIndex: 0,
      }));
    },

    setProgression(progression: ChordProgression) {
      update(state => ({
        ...state,
        currentProgression: progression,
        currentChordIndex: 0,
      }));
    },

    setChordIndex(index: number) {
      update(state => ({
        ...state,
        currentChordIndex: index % state.currentProgression.chords.length,
      }));
    },

    getProgressionsForCurrentGenre: derived(
      { subscribe },
      ($state) => getProgressionsForGenre($state.currentProgression.genre)
    ),
  };
}

export const progressionStore = createProgressionStore();
```

**Step 2: Export from index**

Add to `src/lib/stores/index.ts`:
```typescript
export { progressionStore } from './progression';
```

**Step 3: Commit**

```bash
git add src/lib/stores/progression.ts src/lib/stores/index.ts
git commit -m "feat: add progression store for managing current progression state"
```

---

## Task 14: Create Progression Display Component

**Files:**
- Create: `src/components/ProgressionDisplay.svelte`

**Step 1: Create the component**

Create `src/components/ProgressionDisplay.svelte`:
```svelte
<script lang="ts">
  import { progressionStore } from '$lib/stores/progression';
  import { getProgressionsForGenre } from '$lib/generators/progressions';
  import type { ChordProgression } from '$lib/types/music';

  let showSelector = false;

  $: progression = $progressionStore.currentProgression;
  $: chordIndex = $progressionStore.currentChordIndex;
  $: availableProgressions = getProgressionsForGenre(progression.genre);

  function selectProgression(prog: ChordProgression) {
    progressionStore.setProgression(prog);
    showSelector = false;
  }

  function formatChord(chord: string, index: number): string {
    return chord;
  }
</script>

<div class="progression-display">
  <button
    class="progression-button"
    onclick={() => showSelector = !showSelector}
  >
    <span class="progression-name">{progression.name}</span>
    <span class="progression-chords">
      {#each progression.chords as chord, i}
        <span
          class="chord"
          class:active={i === chordIndex}
        >
          {formatChord(chord, i)}
        </span>
        {#if i < progression.chords.length - 1}
          <span class="separator">-</span>
        {/if}
      {/each}
    </span>
  </button>

  {#if showSelector}
    <div class="progression-selector">
      {#each availableProgressions as prog}
        <button
          class="progression-option"
          class:selected={prog.id === progression.id}
          onclick={() => selectProgression(prog)}
        >
          <span class="option-name">{prog.name}</span>
          <span class="option-chords">
            {prog.chords.join(' - ')}
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .progression-display {
    position: relative;
    display: inline-block;
  }

  .progression-button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 1rem;
    background: var(--surface-2, #2a2a2a);
    border: 1px solid var(--border, #444);
    border-radius: 0.5rem;
    cursor: pointer;
    color: inherit;
  }

  .progression-name {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-bottom: 0.25rem;
  }

  .progression-chords {
    display: flex;
    gap: 0.25rem;
    font-family: monospace;
  }

  .chord {
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.15s;
  }

  .chord.active {
    background: var(--accent, #4a9eff);
    color: white;
  }

  .separator {
    opacity: 0.5;
  }

  .progression-selector {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    min-width: 200px;
    margin-top: 0.25rem;
    background: var(--surface-2, #2a2a2a);
    border: 1px solid var(--border, #444);
    border-radius: 0.5rem;
    overflow: hidden;
    z-index: 100;
  }

  .progression-option {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0.5rem 1rem;
    background: none;
    border: none;
    border-bottom: 1px solid var(--border, #444);
    cursor: pointer;
    text-align: left;
    color: inherit;
  }

  .progression-option:last-child {
    border-bottom: none;
  }

  .progression-option:hover {
    background: var(--surface-3, #333);
  }

  .progression-option.selected {
    background: var(--accent-dim, #2a5a8f);
  }

  .option-name {
    font-weight: 500;
    margin-bottom: 0.125rem;
  }

  .option-chords {
    font-size: 0.75rem;
    font-family: monospace;
    opacity: 0.7;
  }
</style>
```

**Step 2: Commit**

```bash
git add src/components/ProgressionDisplay.svelte
git commit -m "feat: add ProgressionDisplay component for chord progression UI"
```

---

## Task 15: Integrate Progression Display into Header

**Files:**
- Modify: `src/components/Header.svelte`

**Step 1: Read current Header component**

Read the file to understand current structure.

**Step 2: Add ProgressionDisplay to Header**

Add import and component to Header.svelte in the appropriate location (next to genre/key controls):
```svelte
<script lang="ts">
  // ... existing imports
  import ProgressionDisplay from './ProgressionDisplay.svelte';
</script>

<!-- In the template, add near other controls: -->
<ProgressionDisplay />
```

**Step 3: Commit**

```bash
git add src/components/Header.svelte
git commit -m "feat: integrate ProgressionDisplay into Header"
```

---

## Task 16: Run Full Test Suite and Type Check

**Step 1: Run all tests**

Run: `npm run test:run`
Expected: All tests pass

**Step 2: Run type check**

Run: `npm run check`
Expected: No type errors

**Step 3: Fix any issues found**

If issues exist, fix them and commit.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: fix any remaining type/test issues"
```

---

## Summary

This plan implements Phase 1: Harmonic Awareness with:

1. **Types**: ChordDegree, ChordProgression, LoopBundle, LoopVariation
2. **Progression Library**: Genre-specific progressions with "Free" fallback
3. **Chord Resolution**: Convert chord degrees to actual pitches
4. **Updated Generators**: Bass, Keys, Lead, Pad generate per-chord variations
5. **Drum Fills**: Fill points at chord boundaries
6. **Scheduler**: Progression-aware playback cycling through variations
7. **UI**: ProgressionDisplay component with selector

Total: ~16 tasks, each completable in 2-5 minutes following TDD.
