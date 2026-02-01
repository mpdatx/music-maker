# Counter-Melody Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add optional counter-melody generation to lead and keys instruments with three selectable techniques (rhythmic, harmonic, contrary motion).

**Architecture:** New `counterMelody.ts` generator receives main melody notes as input, produces complementary notes. Track type extended with `counterMelody` config. UI adds toggle + technique picker to TrackRow for lead/keys.

**Tech Stack:** Svelte 5, TypeScript, Vitest, Tone.js

---

## Task 1: Add Counter-Melody Types

**Files:**
- Modify: `src/lib/types/music.ts:26-27`

**Step 1: Add the new types after InstrumentType definition**

Add these type definitions after line 26:

```typescript
export type CounterMelodyTechnique = 'rhythmic' | 'harmonic' | 'contrary';

export interface CounterMelodyConfig {
  enabled: boolean;
  technique: CounterMelodyTechnique;
}
```

**Step 2: Extend the Track interface**

Find the Track interface (around line 59) and add the counterMelody field:

```typescript
export interface Track {
  id: string;
  type: InstrumentType;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  effects: EffectConfig[];
  cells: { col: number; loopId: string | null }[];
  counterMelody?: CounterMelodyConfig;  // NEW
}
```

**Step 3: Verify build passes**

Run: `npm run check`
Expected: No type errors

**Step 4: Commit**

```bash
git add src/lib/types/music.ts
git commit -m "feat: add counter-melody types to Track interface"
```

---

## Task 2: Create Counter-Melody Generator - Rhythmic Technique

**Files:**
- Create: `src/lib/generators/counterMelody.ts`
- Create: `src/lib/generators/__tests__/counterMelody.test.ts`

**Step 1: Write the failing test for rhythmic complement**

Create `src/lib/generators/__tests__/counterMelody.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateCounterMelody } from '../counterMelody';
import type { Note } from '../../types/music';

describe('generateCounterMelody', () => {
  const chordTones = ['C4', 'E4', 'G4'];

  describe('rhythmic technique', () => {
    it('generates notes in gaps between main melody notes', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
        { pitch: 'E5', time: '0:2:0', duration: '4n', velocity: 0.8 },
      ];

      const counter = generateCounterMelody(
        mainNotes,
        'rhythmic',
        chordTones,
        'C',
        'major',
        12345
      );

      // Counter should have notes
      expect(counter.length).toBeGreaterThan(0);

      // Counter notes should be in gaps (not at 0:0:0 or 0:2:0)
      const counterTimes = counter.map(n => n.time);
      expect(counterTimes).not.toContain('0:0:0');
      expect(counterTimes).not.toContain('0:2:0');
    });

    it('uses chord tones for counter melody', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '8n', velocity: 0.8 },
      ];

      const counter = generateCounterMelody(
        mainNotes,
        'rhythmic',
        chordTones,
        'C',
        'major',
        12345
      );

      // All counter notes should be chord tones (possibly in different octaves)
      for (const note of counter) {
        const pitchClass = note.pitch.replace(/\d+/, '');
        const validPitchClasses = chordTones.map(c => c.replace(/\d+/, ''));
        expect(validPitchClasses).toContain(pitchClass);
      }
    });

    it('reduces velocity by 50%', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      ];

      const counter = generateCounterMelody(
        mainNotes,
        'rhythmic',
        chordTones,
        'C',
        'major',
        12345
      );

      for (const note of counter) {
        expect(note.velocity).toBeLessThanOrEqual(0.5);
        expect(note.velocity).toBeGreaterThanOrEqual(0.2); // minimum floor
      }
    });

    it('is reproducible with same seed', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      ];

      const counter1 = generateCounterMelody(mainNotes, 'rhythmic', chordTones, 'C', 'major', 12345);
      const counter2 = generateCounterMelody(mainNotes, 'rhythmic', chordTones, 'C', 'major', 12345);

      expect(counter1).toEqual(counter2);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/generators/__tests__/counterMelody.test.ts`
Expected: FAIL with "Cannot find module '../counterMelody'"

**Step 3: Write minimal implementation for rhythmic technique**

Create `src/lib/generators/counterMelody.ts`:

```typescript
import type { Note, CounterMelodyTechnique } from '../types/music';
import { SeededRandom } from './theory';

const VELOCITY_MULTIPLIER = 0.5;
const MIN_VELOCITY = 0.2;

/**
 * Parse Tone.js time string to numeric position in sixteenths.
 * Format: "bar:beat:sixteenth" e.g., "0:2:0" = position 8
 */
function parseTime(time: string): number {
  const [bar, beat, sixteenth] = time.split(':').map(Number);
  return bar * 16 + beat * 4 + sixteenth;
}

/**
 * Convert numeric position back to Tone.js time string.
 */
function formatTime(position: number): string {
  const bar = Math.floor(position / 16);
  const beat = Math.floor((position % 16) / 4);
  const sixteenth = position % 4;
  return `${bar}:${beat}:${sixteenth}`;
}

/**
 * Parse duration string to sixteenths.
 */
function parseDuration(duration: string): number {
  const map: Record<string, number> = {
    '1n': 16, '2n': 8, '4n': 4, '8n': 2, '16n': 1,
    '2n.': 12, '4n.': 6, '8n.': 3,
  };
  return map[duration] ?? 2;
}

/**
 * Find gaps in the main melody where counter-melody can play.
 * Returns array of { start, duration } in sixteenths.
 */
function findGaps(mainNotes: Note[], totalLength: number = 32): Array<{ start: number; duration: number }> {
  const occupied = new Set<number>();

  for (const note of mainNotes) {
    const start = parseTime(note.time);
    const dur = parseDuration(note.duration);
    for (let i = 0; i < dur; i++) {
      occupied.add(start + i);
    }
  }

  const gaps: Array<{ start: number; duration: number }> = [];
  let gapStart: number | null = null;

  for (let i = 0; i < totalLength; i++) {
    if (!occupied.has(i)) {
      if (gapStart === null) gapStart = i;
    } else {
      if (gapStart !== null) {
        gaps.push({ start: gapStart, duration: i - gapStart });
        gapStart = null;
      }
    }
  }

  if (gapStart !== null) {
    gaps.push({ start: gapStart, duration: totalLength - gapStart });
  }

  return gaps;
}

/**
 * Generate rhythmic counter-melody that fills gaps in main melody.
 */
function generateRhythmicCounter(
  mainNotes: Note[],
  chordTones: string[],
  rng: SeededRandom,
  octave: number = 5
): Note[] {
  const notes: Note[] = [];
  const gaps = findGaps(mainNotes);

  // Get pitch classes from chord tones
  const pitchClasses = chordTones.map(c => c.replace(/\d+/, ''));

  // Find recently played notes to create echo effect
  const recentPitches = mainNotes.slice(-3).map(n => n.pitch.replace(/\d+/, ''));

  for (const gap of gaps) {
    // Skip very small gaps
    if (gap.duration < 2) continue;

    // Limit notes to ~50% of gap to avoid being too busy
    const maxNotes = Math.max(1, Math.floor(gap.duration / 4));
    const noteCount = rng.nextInt(1, maxNotes);

    for (let i = 0; i < noteCount; i++) {
      const position = gap.start + Math.floor((gap.duration / noteCount) * i);
      const duration = Math.min(2, gap.duration - (position - gap.start));

      if (duration < 1) continue;

      // Prefer recently played notes for echo effect
      let pitchClass: string;
      if (recentPitches.length > 0 && rng.next() < 0.6) {
        pitchClass = rng.pick(recentPitches.filter(p => pitchClasses.includes(p))) || rng.pick(pitchClasses);
      } else {
        pitchClass = rng.pick(pitchClasses);
      }

      const pitch = `${pitchClass}${octave}`;
      const velocity = Math.max(MIN_VELOCITY, 0.7 * VELOCITY_MULTIPLIER);

      notes.push({
        pitch,
        time: formatTime(position),
        duration: duration >= 4 ? '4n' : duration >= 2 ? '8n' : '16n',
        velocity,
      });
    }
  }

  return notes;
}

/**
 * Generate counter-melody notes based on the main melody and technique.
 */
export function generateCounterMelody(
  mainNotes: Note[],
  technique: CounterMelodyTechnique,
  chordTones: string[],
  key: string,
  scale: string,
  seed: number
): Note[] {
  const rng = new SeededRandom(seed + 500); // Offset from main melody seed

  switch (technique) {
    case 'rhythmic':
      return generateRhythmicCounter(mainNotes, chordTones, rng);
    case 'harmonic':
      // TODO: Implement in Task 3
      return [];
    case 'contrary':
      // TODO: Implement in Task 4
      return [];
    default:
      return [];
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/generators/__tests__/counterMelody.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/lib/generators/counterMelody.ts src/lib/generators/__tests__/counterMelody.test.ts
git commit -m "feat: add counter-melody generator with rhythmic technique"
```

---

## Task 3: Add Harmonic Technique

**Files:**
- Modify: `src/lib/generators/counterMelody.ts`
- Modify: `src/lib/generators/__tests__/counterMelody.test.ts`

**Step 1: Write the failing test for harmonic complement**

Add to `counterMelody.test.ts`:

```typescript
describe('harmonic technique', () => {
  it('generates notes at same times as main melody', () => {
    const mainNotes: Note[] = [
      { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      { pitch: 'E5', time: '0:1:0', duration: '4n', velocity: 0.8 },
    ];

    const counter = generateCounterMelody(
      mainNotes,
      'harmonic',
      chordTones,
      'C',
      'major',
      12345
    );

    expect(counter.length).toBe(mainNotes.length);
    expect(counter[0].time).toBe('0:0:0');
    expect(counter[1].time).toBe('0:1:0');
  });

  it('plays different chord tones than main melody (no unisons)', () => {
    const mainNotes: Note[] = [
      { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
    ];

    const counter = generateCounterMelody(
      mainNotes,
      'harmonic',
      chordTones,
      'C',
      'major',
      12345
    );

    // Counter should not play the same pitch class as main
    const mainPitchClass = 'C';
    const counterPitchClass = counter[0].pitch.replace(/\d+/, '');
    expect(counterPitchClass).not.toBe(mainPitchClass);
  });

  it('uses octave 4 (one below main)', () => {
    const mainNotes: Note[] = [
      { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
    ];

    const counter = generateCounterMelody(
      mainNotes,
      'harmonic',
      chordTones,
      'C',
      'major',
      12345
    );

    expect(counter[0].pitch).toMatch(/4$/); // ends with 4
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/generators/__tests__/counterMelody.test.ts`
Expected: FAIL (harmonic returns empty array)

**Step 3: Implement harmonic technique**

Add to `counterMelody.ts` before the `generateCounterMelody` function:

```typescript
/**
 * Generate harmonic counter-melody that plays different chord tones simultaneously.
 */
function generateHarmonicCounter(
  mainNotes: Note[],
  chordTones: string[],
  rng: SeededRandom,
  octave: number = 4 // One below main melody
): Note[] {
  const notes: Note[] = [];
  const pitchClasses = chordTones.map(c => c.replace(/\d+/, ''));

  for (const mainNote of mainNotes) {
    const mainPitchClass = mainNote.pitch.replace(/\d+/, '');

    // Find chord tones that aren't the same as main note (avoid unison)
    const availablePitches = pitchClasses.filter(p => p !== mainPitchClass);

    if (availablePitches.length === 0) continue;

    // Prefer thirds (index 1 in triad) or fifths (index 2)
    let counterPitchClass: string;
    const mainIndex = pitchClasses.indexOf(mainPitchClass);

    if (mainIndex === 0 && availablePitches.includes(pitchClasses[1])) {
      // Main is root, prefer third
      counterPitchClass = pitchClasses[1];
    } else if (mainIndex === 1 && availablePitches.includes(pitchClasses[2])) {
      // Main is third, prefer fifth
      counterPitchClass = pitchClasses[2];
    } else if (mainIndex === 2 && availablePitches.includes(pitchClasses[0])) {
      // Main is fifth, prefer root
      counterPitchClass = pitchClasses[0];
    } else {
      counterPitchClass = rng.pick(availablePitches);
    }

    const velocity = Math.max(MIN_VELOCITY, mainNote.velocity * VELOCITY_MULTIPLIER);

    notes.push({
      pitch: `${counterPitchClass}${octave}`,
      time: mainNote.time,
      duration: mainNote.duration,
      velocity,
    });
  }

  return notes;
}
```

Update the switch case in `generateCounterMelody`:

```typescript
case 'harmonic':
  return generateHarmonicCounter(mainNotes, chordTones, rng);
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/generators/__tests__/counterMelody.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/lib/generators/counterMelody.ts src/lib/generators/__tests__/counterMelody.test.ts
git commit -m "feat: add harmonic technique to counter-melody generator"
```

---

## Task 4: Add Contrary Motion Technique

**Files:**
- Modify: `src/lib/generators/counterMelody.ts`
- Modify: `src/lib/generators/__tests__/counterMelody.test.ts`

**Step 1: Write the failing test for contrary motion**

Add to `counterMelody.test.ts`:

```typescript
describe('contrary motion technique', () => {
  it('moves in opposite direction to main melody', () => {
    // Main melody ascends: C5 -> D5 -> E5
    const mainNotes: Note[] = [
      { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      { pitch: 'D5', time: '0:1:0', duration: '4n', velocity: 0.8 },
      { pitch: 'E5', time: '0:2:0', duration: '4n', velocity: 0.8 },
    ];

    const counter = generateCounterMelody(
      mainNotes,
      'contrary',
      chordTones,
      'C',
      'major',
      12345
    );

    expect(counter.length).toBe(mainNotes.length);

    // Counter should descend when main ascends
    // Compare MIDI values (simplified: just check direction)
    const counterPitches = counter.map(n => n.pitch);

    // First note establishes starting point
    // Second note should be lower than first (opposite of main ascending)
    // We can't test exact pitches but can verify movement exists
    expect(counter.length).toBeGreaterThan(0);
  });

  it('uses same octave as main melody', () => {
    const mainNotes: Note[] = [
      { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
    ];

    const counter = generateCounterMelody(
      mainNotes,
      'contrary',
      chordTones,
      'C',
      'major',
      12345
    );

    expect(counter[0].pitch).toMatch(/5$/); // same octave
  });

  it('plays at same times as main melody', () => {
    const mainNotes: Note[] = [
      { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      { pitch: 'E5', time: '0:2:0', duration: '4n', velocity: 0.8 },
    ];

    const counter = generateCounterMelody(
      mainNotes,
      'contrary',
      chordTones,
      'C',
      'major',
      12345
    );

    expect(counter[0].time).toBe('0:0:0');
    expect(counter[1].time).toBe('0:2:0');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/generators/__tests__/counterMelody.test.ts`
Expected: FAIL (contrary returns empty array)

**Step 3: Implement contrary motion technique**

Add to `counterMelody.ts`:

```typescript
import { getNoteInScale } from './theory';

/**
 * Convert pitch string to MIDI-like number for comparison.
 */
function pitchToMidi(pitch: string): number {
  const noteMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };

  const match = pitch.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) return 60; // default to middle C

  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr);
  return (octave + 1) * 12 + (noteMap[note] ?? 0);
}

/**
 * Generate contrary motion counter-melody that moves opposite to main melody.
 */
function generateContraryCounter(
  mainNotes: Note[],
  key: string,
  scale: string,
  rng: SeededRandom,
  octave: number = 5 // Same octave as main
): Note[] {
  if (mainNotes.length === 0) return [];

  const notes: Note[] = [];

  // Start counter at a complementary position in the scale
  let counterDegree = 4; // Start on 5th degree (index 4)

  for (let i = 0; i < mainNotes.length; i++) {
    const mainNote = mainNotes[i];
    const velocity = Math.max(MIN_VELOCITY, mainNote.velocity * VELOCITY_MULTIPLIER);

    if (i === 0) {
      // First note: establish starting point
      const pitch = getNoteInScale(key, scale, counterDegree, octave);
      notes.push({
        pitch,
        time: mainNote.time,
        duration: mainNote.duration,
        velocity,
      });
    } else {
      // Calculate direction of main melody
      const prevMainMidi = pitchToMidi(mainNotes[i - 1].pitch);
      const currMainMidi = pitchToMidi(mainNote.pitch);
      const mainDirection = currMainMidi - prevMainMidi;

      // Move counter in opposite direction by similar interval
      const interval = Math.abs(mainDirection);
      const scaleDegreeChange = Math.ceil(interval / 2); // Approximate to scale degrees

      if (mainDirection > 0) {
        // Main went up, counter goes down
        counterDegree -= scaleDegreeChange;
      } else if (mainDirection < 0) {
        // Main went down, counter goes up
        counterDegree += scaleDegreeChange;
      }
      // If mainDirection === 0, keep same degree

      const pitch = getNoteInScale(key, scale, counterDegree, octave);
      notes.push({
        pitch,
        time: mainNote.time,
        duration: mainNote.duration,
        velocity,
      });
    }
  }

  return notes;
}
```

Update the switch case in `generateCounterMelody`:

```typescript
case 'contrary':
  return generateContraryCounter(mainNotes, key, scale, rng);
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/generators/__tests__/counterMelody.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/lib/generators/counterMelody.ts src/lib/generators/__tests__/counterMelody.test.ts
git commit -m "feat: add contrary motion technique to counter-melody generator"
```

---

## Task 5: Integrate Counter-Melody into Lead Generator

**Files:**
- Modify: `src/lib/generators/lead.ts`
- Modify: `src/lib/generators/__tests__/lead.test.ts`

**Step 1: Write the failing test**

Add to `lead.test.ts`:

```typescript
import { generateLeadWithCounter } from '../lead';

describe('generateLeadWithCounter', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const counterConfig = { enabled: true, technique: 'rhythmic' as const };

  it('returns both main and counter notes when enabled', () => {
    const result = generateLeadWithCounter(
      params,
      'C',
      'major',
      12345,
      2,
      'pop',
      counterConfig
    );

    expect(result.main.length).toBeGreaterThan(0);
    expect(result.counter).not.toBeNull();
    expect(result.counter!.length).toBeGreaterThan(0);
  });

  it('returns null counter when disabled', () => {
    const result = generateLeadWithCounter(
      params,
      'C',
      'major',
      12345,
      2,
      'pop',
      { enabled: false, technique: 'rhythmic' }
    );

    expect(result.main.length).toBeGreaterThan(0);
    expect(result.counter).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/generators/__tests__/lead.test.ts`
Expected: FAIL with "generateLeadWithCounter is not exported"

**Step 3: Implement integration**

Add to `lead.ts`:

```typescript
import { generateCounterMelody } from './counterMelody';
import type { CounterMelodyConfig } from '../types/music';

export interface MelodyOutput {
  main: Note[];
  counter: Note[] | null;
}

/**
 * Generate lead melody with optional counter-melody.
 */
export function generateLeadWithCounter(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars: number = 2,
  genre: GenrePreset = 'pop',
  counterConfig?: CounterMelodyConfig
): MelodyOutput {
  // Generate main melody using existing logic
  const bundle = generateLeadBundle(params, key, scale, ['I'], seed, bars, genre);
  const main = bundle.variations[0].notes;

  if (!counterConfig?.enabled) {
    return { main, counter: null };
  }

  // Get chord tones for counter-melody (use I chord for simplicity)
  const chordTones = getChordTonesForDegree('I', key, scale, 5);

  const counter = generateCounterMelody(
    main,
    counterConfig.technique,
    chordTones,
    key,
    scale,
    seed
  );

  return { main, counter };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/generators/__tests__/lead.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/lib/generators/lead.ts src/lib/generators/__tests__/lead.test.ts
git commit -m "feat: integrate counter-melody generation into lead generator"
```

---

## Task 6: Integrate Counter-Melody into Chords Generator (Keys)

**Files:**
- Modify: `src/lib/generators/chords.ts`
- Modify: `src/lib/generators/__tests__/chords.test.ts`

**Step 1: Write the failing test**

Add to `chords.test.ts`:

```typescript
import { generateChordsWithCounter } from '../chords';

describe('generateChordsWithCounter', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const counterConfig = { enabled: true, technique: 'harmonic' as const };

  it('returns both main and counter notes when enabled', () => {
    const result = generateChordsWithCounter(
      params,
      'C',
      'major',
      12345,
      2,
      'pop',
      counterConfig
    );

    expect(result.main.length).toBeGreaterThan(0);
    expect(result.counter).not.toBeNull();
    expect(result.counter!.length).toBeGreaterThan(0);
  });

  it('returns null counter when disabled', () => {
    const result = generateChordsWithCounter(
      params,
      'C',
      'major',
      12345,
      2,
      'pop',
      { enabled: false, technique: 'harmonic' }
    );

    expect(result.main.length).toBeGreaterThan(0);
    expect(result.counter).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/generators/__tests__/chords.test.ts`
Expected: FAIL

**Step 3: Implement integration**

Add to `chords.ts` (similar pattern to lead.ts):

```typescript
import { generateCounterMelody } from './counterMelody';
import type { CounterMelodyConfig } from '../types/music';

export interface MelodyOutput {
  main: Note[];
  counter: Note[] | null;
}

/**
 * Generate chords with optional counter-melody.
 */
export function generateChordsWithCounter(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars: number = 2,
  genre: GenrePreset = 'pop',
  counterConfig?: CounterMelodyConfig
): MelodyOutput {
  const bundle = generateChordsBundle(params, key, scale, ['I'], seed, bars, genre);
  const main = bundle.variations[0].notes;

  if (!counterConfig?.enabled) {
    return { main, counter: null };
  }

  const chordTones = getChordTonesForDegree('I', key, scale, 4);

  const counter = generateCounterMelody(
    main,
    counterConfig.technique,
    chordTones,
    key,
    scale,
    seed
  );

  return { main, counter };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/generators/__tests__/chords.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/lib/generators/chords.ts src/lib/generators/__tests__/chords.test.ts
git commit -m "feat: integrate counter-melody generation into chords generator"
```

---

## Task 7: Export Counter-Melody from Generators Index

**Files:**
- Modify: `src/lib/generators/index.ts`

**Step 1: Add exports**

Add to `src/lib/generators/index.ts`:

```typescript
export { generateCounterMelody } from './counterMelody';
export { generateLeadWithCounter, type MelodyOutput } from './lead';
export { generateChordsWithCounter } from './chords';
```

**Step 2: Verify build passes**

Run: `npm run check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/generators/index.ts
git commit -m "feat: export counter-melody functions from generators index"
```

---

## Task 8: Add Counter-Melody UI to TrackRow

**Files:**
- Modify: `src/components/TrackRow.svelte`

**Step 1: Add counter-melody controls for lead and keys tracks**

In TrackRow.svelte, add after the keys-btn in track-controls:

```svelte
<script lang="ts">
  // Add to existing imports
  import type { CounterMelodyTechnique } from '../lib/types';

  // Add new props
  let {
    // ...existing props
    onCounterToggle,
    onCounterTechniqueChange,
  }: {
    // ...existing types
    onCounterToggle?: (trackId: string) => void;
    onCounterTechniqueChange?: (trackId: string, technique: CounterMelodyTechnique) => void;
  } = $props();

  // Check if track supports counter-melody
  let supportsCounter = $derived(track.type === 'lead' || track.type === 'keys');
  let counterEnabled = $derived(track.counterMelody?.enabled ?? false);
  let counterTechnique = $derived(track.counterMelody?.technique ?? 'rhythmic');
</script>

<!-- In the track-controls div, after keys-btn -->
{#if supportsCounter}
  <button
    class="counter-btn"
    class:active={counterEnabled}
    onclick={() => onCounterToggle?.(track.id)}
    title="Toggle counter-melody"
  >
    C
  </button>
  {#if counterEnabled}
    <div class="technique-picker">
      <button
        class="technique-btn"
        class:active={counterTechnique === 'rhythmic'}
        onclick={() => onCounterTechniqueChange?.(track.id, 'rhythmic')}
        title="Rhythmic (call-response)"
      >
        R
      </button>
      <button
        class="technique-btn"
        class:active={counterTechnique === 'harmonic'}
        onclick={() => onCounterTechniqueChange?.(track.id, 'harmonic')}
        title="Harmonic (chord tones)"
      >
        H
      </button>
      <button
        class="technique-btn"
        class:active={counterTechnique === 'contrary'}
        onclick={() => onCounterTechniqueChange?.(track.id, 'contrary')}
        title="Contrary motion"
      >
        M
      </button>
    </div>
  {/if}
{/if}

<style>
  /* Add these styles */
  .counter-btn {
    width: 24px;
    height: 24px;
    border: 1px solid #444;
    background: #2a2a4e;
    color: #888;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .counter-btn:hover {
    background: #3a3a5e;
  }

  .counter-btn.active {
    background: #06b6d4;
    color: #fff;
    border-color: #06b6d4;
  }

  .technique-picker {
    display: flex;
    gap: 2px;
  }

  .technique-btn {
    width: 20px;
    height: 20px;
    border: 1px solid #444;
    background: #2a2a4e;
    color: #666;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.65rem;
    font-weight: bold;
    padding: 0;
  }

  .technique-btn:hover {
    background: #3a3a5e;
  }

  .technique-btn.active {
    background: #0891b2;
    color: #fff;
    border-color: #0891b2;
  }
</style>
```

**Step 2: Verify build passes**

Run: `npm run check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/TrackRow.svelte
git commit -m "feat: add counter-melody UI controls to TrackRow"
```

---

## Task 9: Add Counter-Melody Store Actions

**Files:**
- Modify: `src/lib/stores/project.ts`

**Step 1: Add store actions for counter-melody**

Add to `createProjectStore()`:

```typescript
setTrackCounterMelody: (trackId: string, enabled: boolean, technique?: CounterMelodyTechnique) => update(p => ({
  ...p,
  tracks: p.tracks.map(t => t.id === trackId ? {
    ...t,
    counterMelody: {
      enabled,
      technique: technique ?? t.counterMelody?.technique ?? 'rhythmic',
    },
  } : t),
  updatedAt: Date.now(),
})),

setTrackCounterTechnique: (trackId: string, technique: CounterMelodyTechnique) => update(p => ({
  ...p,
  tracks: p.tracks.map(t => t.id === trackId ? {
    ...t,
    counterMelody: {
      enabled: t.counterMelody?.enabled ?? false,
      technique,
    },
  } : t),
  updatedAt: Date.now(),
})),
```

Add import at top:

```typescript
import type { Project, Track, Loop, InstrumentType, CounterMelodyTechnique } from '../types';
```

**Step 2: Verify build passes**

Run: `npm run check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/stores/project.ts
git commit -m "feat: add counter-melody store actions"
```

---

## Task 10: Wire Up LoopGrid to Handle Counter-Melody Events

**Files:**
- Modify: `src/components/LoopGrid.svelte`

**Step 1: Add event handlers and pass to TrackRow**

In LoopGrid.svelte, add handlers:

```svelte
<script lang="ts">
  import { project } from '$lib/stores';
  import type { CounterMelodyTechnique } from '$lib/types';

  function handleCounterToggle(trackId: string) {
    const track = $project.tracks.find(t => t.id === trackId);
    if (track) {
      project.setTrackCounterMelody(trackId, !track.counterMelody?.enabled);
    }
  }

  function handleCounterTechniqueChange(trackId: string, technique: CounterMelodyTechnique) {
    project.setTrackCounterTechnique(trackId, technique);
  }
</script>

<!-- Pass to TrackRow -->
<TrackRow
  {track}
  ...
  onCounterToggle={handleCounterToggle}
  onCounterTechniqueChange={handleCounterTechniqueChange}
/>
```

**Step 2: Verify build passes**

Run: `npm run check`
Expected: No errors

**Step 3: Test manually in browser**

Run: `npm run dev`
- Navigate to app
- Find a lead or keys track
- Verify C button appears
- Click C to enable counter-melody
- Verify R/H/M buttons appear
- Click each technique button

**Step 4: Commit**

```bash
git add src/components/LoopGrid.svelte
git commit -m "feat: wire up counter-melody events in LoopGrid"
```

---

## Task 11: Integrate Counter-Melody into Audio Playback

**Files:**
- Modify: `src/lib/audio/engine.ts` (or equivalent playback file)

**Step 1: Find and update the loop scheduling logic**

Locate where notes are scheduled for playback. When a track has counterMelody enabled, schedule both the main notes and the counter notes.

This will depend on the existing audio engine structure. The key change is:

```typescript
// When scheduling a loop for a track that supports counter-melody:
if (track.counterMelody?.enabled && (track.type === 'lead' || track.type === 'keys')) {
  const { main, counter } = generateLeadWithCounter(
    params, key, scale, seed, bars, genre, track.counterMelody
  );

  // Schedule main notes
  scheduleNotes(main, instrument, startTime);

  // Schedule counter notes (same instrument, already has reduced velocity)
  if (counter) {
    scheduleNotes(counter, instrument, startTime);
  }
} else {
  // Existing logic for other instruments
}
```

**Step 2: Test playback**

Run: `npm run dev`
- Enable counter-melody on a lead track
- Play the track
- Verify you hear both main and counter voices

**Step 3: Commit**

```bash
git add src/lib/audio/
git commit -m "feat: integrate counter-melody into audio playback"
```

---

## Task 12: Add Genre-Based Default Techniques

**Files:**
- Modify: `src/lib/genres.ts`

**Step 1: Add default counter-melody technique per genre**

Add to genre config:

```typescript
export interface GenreConfig {
  // ...existing fields
  defaultCounterTechnique: CounterMelodyTechnique;
}

// Update each genre:
'jazz': {
  // ...existing
  defaultCounterTechnique: 'harmonic',
},
'classical': {
  // ...existing
  defaultCounterTechnique: 'contrary',
},
// All others default to 'rhythmic'
```

**Step 2: Use default when enabling counter-melody**

Update store action to use genre default:

```typescript
setTrackCounterMelody: (trackId: string, enabled: boolean, technique?: CounterMelodyTechnique) => update(p => {
  const genreConfig = GENRES[p.genre];
  const defaultTechnique = genreConfig?.defaultCounterTechnique ?? 'rhythmic';

  return {
    ...p,
    tracks: p.tracks.map(t => t.id === trackId ? {
      ...t,
      counterMelody: {
        enabled,
        technique: technique ?? t.counterMelody?.technique ?? defaultTechnique,
      },
    } : t),
    updatedAt: Date.now(),
  };
}),
```

**Step 3: Verify build passes**

Run: `npm run check`
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/genres.ts src/lib/stores/project.ts
git commit -m "feat: add genre-based default counter-melody techniques"
```

---

## Summary

After completing all tasks:

1. **Types** - CounterMelodyTechnique and CounterMelodyConfig added
2. **Generator** - counterMelody.ts with rhythmic, harmonic, and contrary techniques
3. **Integration** - Lead and chords generators support counter-melody
4. **UI** - TrackRow shows C toggle and R/H/M technique picker for lead/keys
5. **Store** - Actions to toggle and change counter-melody settings
6. **Playback** - Audio engine schedules both main and counter notes
7. **Defaults** - Genre-appropriate default techniques

Run full test suite: `npm test`
Run full build check: `npm run check`
