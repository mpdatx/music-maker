# Counter-Melody Implementation Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add optional counter-melody generation to lead and keys instruments with three selectable techniques.

**Architecture:** Counter-melody generator receives main melody notes as input, produces complementary notes based on technique. This pattern enables future cross-instrument awareness.

**Tech Stack:** Svelte 5, TypeScript, Tone.js (existing)

---

## Overview

When enabled, a track generates two voices - a main melody (existing behavior) and a counter-melody that complements it. The counter-melody uses the same instrument but is mixed quieter (-6dB) so it supports rather than competes.

**Three Techniques:**
- **Rhythmic** - Fills gaps when main melody rests, creates call-and-response
- **Harmonic** - Plays simultaneously on different chord tones, thickens harmony
- **Contrary** - Moves in opposite direction to main melody, classic counterpoint

**Supported Instruments:** Lead and keys only.

---

## Data Structures

### New Types (src/lib/types/music.ts)

```typescript
type CounterMelodyTechnique = 'rhythmic' | 'harmonic' | 'contrary';

interface CounterMelodyConfig {
  enabled: boolean;
  technique: CounterMelodyTechnique;
}
```

### Track Extension

```typescript
interface Track {
  // ...existing fields
  counterMelody?: CounterMelodyConfig;
}
```

### Velocity Reduction

Counter-melody notes get velocity multiplied by 0.5 (approximately -6dB). Applied at generation time.

### Octave Defaults by Technique

| Technique | Main Octave | Counter Octave | Reasoning |
|-----------|-------------|----------------|-----------|
| Rhythmic | 5 | 5 | Same register for clear call-response |
| Harmonic | 5 | 4 | Below for richer voicing |
| Contrary | 5 | 5 | Same register so motion is audible |

---

## Generation Algorithms

### Rhythmic Complement

1. Analyze main melody to find gaps (rests or long sustains)
2. Place counter-melody notes in those gaps
3. Use chord tones, prefer notes the main melody recently played (echo effect)
4. Duration fills the gap but doesn't overlap main melody's next note

```
Main:    [C---]      [E-] [G---]
Counter:       [E][G]         [C-]
```

### Harmonic Complement

1. For each main melody note, find a complementary chord tone
2. Prefer thirds (if main plays root, counter plays 3rd) or fifths
3. Avoid unisons and octaves (those just double, not complement)
4. Match rhythm exactly - counter plays when main plays

```
Main:    [C---] [E-] [G---]
Counter: [E---] [G-] [C---]  (thirds above/below)
```

### Contrary Motion

1. Track the melodic direction of the main voice
2. When main ascends, counter descends (and vice versa)
3. Use scale tones that move by similar interval in opposite direction
4. Can play simultaneously or slightly offset for clarity

```
Main:    [C] [D] [E] [F]  (ascending)
Counter: [G] [F] [E] [D]  (descending)
```

---

## File Changes

### New File

- `src/lib/generators/counterMelody.ts` - Core counter-melody generation logic

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/types/music.ts` | Add `CounterMelodyTechnique`, `CounterMelodyConfig` types |
| `src/lib/generators/lead.ts` | Import counter-melody generator, call when enabled, combine voices |
| `src/lib/generators/chords.ts` | Same pattern for keys instrument |
| `src/lib/stores.ts` | Add counter-melody config to track state |
| `src/components/TrackRow.svelte` | Add UI toggle and technique picker |

### Generator Interface

```typescript
// counterMelody.ts
export function generateCounterMelody(
  mainNotes: Note[],
  technique: CounterMelodyTechnique,
  chordTones: string[],
  key: string,
  scale: string,
  seed: number
): Note[];
```

---

## UI Controls

### Location

Below existing M/S/K buttons in TrackRow, only visible for lead and keys tracks.

### Layout

```
[Icon] Lead
       [M] [S] [K]
       [C] [R|H|M]   <- new row: toggle + technique
```

### Controls

- **C button** - Toggle counter-melody on/off (cyan when active, matches K button style)
- **Technique selector** - Three small buttons (only shown when C enabled):
  - **R** = Rhythmic (default)
  - **H** = Harmonic
  - **M** = Motion (contrary)

### Interaction

- Tapping C enables counter-melody with default technique (Rhythmic)
- Tapping a technique button switches to that technique
- Disabling C hides the technique selector

---

## Edge Cases & Defaults

### Genre Influence on Default Technique

| Genre | Default Technique | Notes |
|-------|-------------------|-------|
| Jazz | Harmonic | Rich chord voicings |
| Classical | Contrary | Traditional counterpoint |
| Pop/EDM | Rhythmic | Catchy call-response |
| Others | Rhythmic | Safe default |

User can override; regenerating loops uses genre-appropriate defaults.

### Sparse Main Melodies

If main melody has very few notes (low density), rhythmic complement limits counter to ~50% of gaps to avoid being busier than the main voice.

### Chord Changes

Counter-melody regenerates per chord variation using same LoopBundle pattern as main melody.

### Velocity Floor

- Counter velocity = main velocity × 0.5
- Minimum velocity of 0.2 to ensure audibility

### Seed Consistency

Counter-melody uses `seed + 500` offset from main melody for reproducible but distinct results.

---

## Future Extensions

The architecture supports future enhancements:

1. **Cross-instrument awareness** - Pass notes from other tracks to generate counter-melodies that complement the full arrangement
2. **Chord anticipation/delay** - Counter-melody resolves to next chord early or holds previous chord
3. **More instruments** - Extend to strings, organ, etc.
4. **Velocity/intensity control** - User slider for counter-melody prominence
