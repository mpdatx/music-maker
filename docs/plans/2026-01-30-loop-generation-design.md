# Advanced Loop Generation - Design Document

## Overview

This document describes three interconnected systems to make loop generation more interesting and musically coherent:

1. **Cross-Instrument Harmonic Awareness** - Shared chord progressions that all instruments follow
2. **Richer Musical Variation** - Hybrid rhythm templates with algorithmic transformations and layered dynamics
3. **Structural Intelligence** - Song sections, energy levels, and transitions

These systems build on each other: harmonic awareness provides the chord backbone, richer variation makes each loop more interesting, and structural intelligence organizes it all into songs.

## 1. Cross-Instrument Harmonic Awareness

### Core Concept

A shared chord progression governs all melodic instruments during playback. When a user generates loops, the system creates **chord-specific variations** for each loop—one variation per chord in the progression. During playback, all active loops stay synchronized to the current chord position.

### Progression Structure

Each genre defines:
- **Progression length**: 4 chords (EDM, Rock, Pop) or 8 chords (Lo-fi, Ambient, Funk)
- **Progression library**: 3-5 characteristic progressions per genre
- **Default progression**: One marked as default, others available for user selection

Example progressions:
- **Lo-fi (8 chords)**: ii7 - V7 - Imaj7 - vi7 - ii7 - V7 - iii7 - vi7
- **EDM (4 chords)**: i - VI - III - VII
- **Pop (4 chords)**: I - V - vi - IV

### Backward Compatibility

A "Free" single-chord progression (`[I]` or `[i]`) emulates current behavior:
- Only one variation generated
- No chord cycling during playback
- Drums get no fill points

**Progression-aware is the default** for richer first experience. Users can switch to "Free" for static loops.

### Data Model

```typescript
interface ChordProgression {
  id: string;
  name: string;                    // "Classic Pop", "Neo-Soul"
  genre: Genre;
  chords: ChordDegree[];           // [I, V, vi, IV] or [ii7, V7, Imaj7, ...]
  isDefault: boolean;
}

type ChordDegree =
  | 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii°'
  | 'Imaj7' | 'ii7' | 'iii7' | 'IVmaj7' | 'V7' | 'vi7' | 'vii7b5';
```

### Loop Bundle Structure

Loops store variations per chord:

```typescript
interface LoopBundle {
  id: string;
  instrument: Instrument;
  seed: number;
  progressionId: string;
  variations: LoopVariation[];
  drumFills?: DrumFillPoints;
}

interface LoopVariation {
  chordIndex: number;
  notes: NoteEvent[];
}

interface DrumFillPoints {
  basePattern: NoteEvent[];
  fillPositions: number[];
  fillPatterns: NoteEvent[][];
}
```

### Drum Handling

Drums don't follow chords melodically but gain **fill awareness**:
- Generate base 1-bar or 2-bar pattern as before
- Mark fill insertion points based on progression length
- Generate 2-3 fill options (half-bar to 1-bar fills)
- Playback inserts appropriate fill at chord boundaries

### Generator Changes

Generators receive the full progression and produce all variations at once:

```typescript
interface GeneratorParams {
  seed: number;
  density: number;
  complexity: number;
  style: Style;
  rootKey: Note;
  scale: ScaleType;
  progression: ChordDegree[];
  grooveProfile: GrooveProfile;
  articulationProfile: ArticulationProfile;
}

interface GeneratorOutput {
  variations: NoteEvent[][];
  metadata: {
    templateUsed: string;
    transformationsApplied: string[];
  };
}
```

Generation strategy per chord:
1. **Resolve chord tones** - Convert degree to actual pitches given root key and scale
2. **Generate rhythm** - Use existing rhythm logic (density, complexity, style)
3. **Select pitches** - Prioritize chord tones on strong beats, allow passing tones on weak beats
4. **Apply voice leading** - Prefer smooth motion between ending and starting notes of adjacent variations

### Playback & Scheduling

```typescript
interface ProgressionClock {
  progressionId: string;
  barsPerChord: number;        // typically 1 or 2 bars per chord
  currentChordIndex: number;
  totalBars: number;
}
```

Scheduler modifications:
- **Progression-aware scheduling** - Cycle through variations instead of repeating one pattern
- **Chord boundary events** - Emit events when chord changes (for UI, drum fills)
- **Seamless transitions** - Schedule next variation's notes before current ends (Tone.js lookahead)

### UI/UX

**Progression display** (above loop grid, near transport):
- Resting state shows progression name (e.g., "Classic Pop: I - V - vi - IV")
- During playback, highlights current chord with subtle pulse on changes

**Progression selection**:
- Tap progression display to open selector
- Dropdown/modal showing 3-5 progressions for current genre
- Preview plays short piano preview of chords
- Selecting new progression offers to regenerate existing loops

**Loop regeneration prompt** when progression changes:
- "Regenerate loops for new progression?" (Yes / Keep existing)
- If yes: regenerate all active loops with same seeds but new progression

### Migration

Existing loops without `progressionId`:
- Auto-upgrade: Treat existing pattern as "variation 0", regenerate remaining variations using stored seed
- Fallback: If regeneration fails, loop plays single pattern for all chords

---

## 2. Richer Musical Variation

### Overview

Replace fixed-template approach with a hybrid system: **templates as seeds** transformed by **algorithmic variation rules**. Each generation produces a unique rhythm while staying musically grounded.

### Rhythm Generation Pipeline

```
Template Selection → Transformation → Groove Application → Dynamics → Output
```

### Expanded Template Library

```typescript
interface RhythmTemplateLibrary {
  [genre: Genre]: {
    [instrument: Instrument]: {
      core: RhythmTemplate[];      // 3-5 essential patterns
      variations: RhythmTemplate[]; // 5-10 extended patterns
      fills: RhythmTemplate[];      // 3-5 fill patterns
    }
  }
}
```

Target: ~15-20 templates per instrument per genre, categorized by energy level (low/mid/high) and feel (straight/swung/syncopated).

```typescript
interface RhythmTemplate {
  id: string;
  name: string;                    // "Lazy Boom-Bap", "Four-on-Floor Drive"
  energyLevel: 'low' | 'mid' | 'high';
  feel: 'straight' | 'swung' | 'syncopated';
  steps: TemplateStep[];
  variationPoints: number[];       // steps where transformation encouraged
}
```

### Algorithmic Transformations

Templates modified by a chain of transformations based on `density` and `complexity`:

```typescript
type Transformation =
  | 'shift'        // Move hits earlier/later by subdivision
  | 'subdivide'    // Split hit into faster notes
  | 'consolidate'  // Merge adjacent hits
  | 'ghost'        // Add quiet ghost notes
  | 'accent'       // Add/move accents
  | 'omit'         // Remove hits (for sparser variations)
  | 'fill'         // Insert fill at phrase boundaries
  | 'euclidean';   // Redistribute using Euclidean algorithm
```

Transformation rules with constraints:

```typescript
interface TransformationRule {
  type: Transformation;
  probability: number;
  targets: ('downbeat' | 'upbeat' | 'offbeat' | 'any')[];
  preserveDownbeats: boolean;
  maxApplications: number;
  densityRange: [number, number];
  complexityRange: [number, number];
}
```

Example rules:
- `ghost`: Only at complexity > 0.4, targets offbeats, max 4 per bar
- `omit`: Only at density < 0.4, never removes downbeats
- `subdivide`: Only at density > 0.6, targets upbeats

### Genre Groove Profiles

```typescript
interface GrooveProfile {
  genre: Genre;
  swingAmount: number;             // 0 = straight, 1 = full triplet swing
  swingTarget: 'eighths' | 'sixteenths';
  pushPull: PushPullMap;           // per-beat timing offsets
  pocket: 'ahead' | 'center' | 'behind';
  tightness: number;               // 0 = loose/human, 1 = quantized
}
```

**Genre-specific grooves:**

| Genre | Swing | Pocket | Tightness | Character |
|-------|-------|--------|-----------|-----------|
| Lo-fi | 0.3-0.5 | behind | 0.3 | Lazy, loose |
| EDM | 0 | center | 0.9 | Precise, driving |
| Funk | 0.15 | ahead | 0.6 | Pushes forward, "on the one" |
| Rock | 0.1 | center | 0.7 | Slightly rushed snare |
| Ambient | 0.1 | behind | 0.4 | Floating, relaxed |
| Pop | 0.15 | center | 0.8 | Clean, polished |

### Three-Layer Dynamics System

**Layer 1: Genre Articulation Profiles**

```typescript
interface ArticulationProfile {
  genre: Genre;
  velocityRange: [number, number];
  velocityCurve: 'flat' | 'dynamic' | 'compressed';
  accentStrength: number;
  ghostStrength: number;
  defaultNoteLengthRatio: number;  // 0.5 = staccato, 1.0 = legato
  attackSharpness: 'soft' | 'medium' | 'sharp';
}
```

| Genre | Velocity | Curve | Accents | Ghosts | Length |
|-------|----------|-------|---------|--------|--------|
| Lo-fi | 50-90 | compressed | subtle | prominent | 0.7 |
| EDM | 80-127 | flat | strong | rare | 0.5 |
| Funk | 60-120 | dynamic | sharp | many | 0.4 |
| Ambient | 40-80 | dynamic | subtle | none | 1.0 |
| Rock | 70-127 | dynamic | strong | some | 0.6 |
| Pop | 60-110 | dynamic | medium | some | 0.6 |

**Layer 2: Pattern-Aware Shaping**

```typescript
interface DynamicRules {
  downbeatBoost: number;
  backbeatBoost: number;
  phraseContour: 'flat' | 'swell' | 'decay' | 'arc';
  accentPositions: number[];
  ghostPositions: number[];
}
```

Contour shapes over 1-2 bars:
- `flat`: Consistent velocity
- `swell`: Crescendo toward end
- `decay`: Starts strong, fades
- `arc`: Builds to middle, resolves

**Layer 3: Humanization**

```typescript
function humanize(note: NoteEvent, profile: ArticulationProfile, rng: SeededRandom): NoteEvent {
  const velocityJitter = rng.range(-8, 8);
  const timingJitter = rng.range(-10, 10) * (1 - profile.tightness);

  return {
    ...note,
    velocity: clamp(note.velocity + velocityJitter, profile.velocityRange),
    time: note.time + timingJitter,
  };
}
```

### Per-Instrument Application

| Instrument | Rhythm System | Groove | Dynamics |
|------------|---------------|--------|----------|
| Drums | Full (per-voice templates) | Full | Full |
| Bass | Full | Full | Note length varies |
| Keys | Chord rhythm patterns | Full | Chord velocity |
| Lead | Melodic rhythm | Full | Most expressive |
| Pad | Minimal (sustained) | Attack timing only | Swell/fade |

---

## 3. Structural Intelligence

### Overview

Songs are composed of **sections** arranged on a timeline. Each section type defines how loops behave. Loops generate **section variants** alongside chord variants, creating a 2D matrix of variations.

### Genre Section Palettes

```typescript
interface GenreSectionPalette {
  genre: Genre;
  sections: SectionType[];
  defaultStructure: SectionType[];
}

type SectionType =
  // Universal
  | 'intro' | 'outro'
  // Pop/Rock/Funk
  | 'verse' | 'pre-chorus' | 'chorus' | 'bridge'
  // Electronic
  | 'build' | 'drop' | 'breakdown'
  // Ambient/Lo-fi
  | 'ambient' | 'groove' | 'sparse';
```

**Per-genre defaults:**

| Genre | Sections | Default Structure |
|-------|----------|-------------------|
| Lo-fi | intro, sparse, groove, ambient, outro | intro → groove → sparse → groove → outro |
| EDM | intro, build, drop, breakdown, outro | intro → build → drop → breakdown → build → drop → outro |
| Rock | intro, verse, pre-chorus, chorus, bridge, outro | intro → verse → chorus → verse → chorus → bridge → chorus → outro |
| Pop | intro, verse, pre-chorus, chorus, bridge, outro | intro → verse → pre-chorus → chorus → verse → chorus → outro |
| Funk | intro, verse, chorus, bridge, breakdown, outro | intro → verse → chorus → verse → breakdown → chorus → outro |
| Ambient | intro, ambient, sparse, outro | intro → ambient → sparse → ambient → outro |

### Section Behavior Definitions

```typescript
interface SectionDefinition {
  type: SectionType;
  energyLevel: number;
  densityMultiplier: number;
  complexityMultiplier: number;
  dynamicsRange: [number, number];
  instrumentHints: InstrumentHint[];
  transitionIn?: TransitionType;
  transitionOut?: TransitionType;
}

interface InstrumentHint {
  instrument: Instrument;
  presence: 'prominent' | 'normal' | 'subdued' | 'silent';
}
```

**Section definitions:**

| Section | Energy | Density | Complexity | Character |
|---------|--------|---------|------------|-----------|
| Intro | 0.3 | 0.5× | 0.5× | Drums subdued, pads prominent |
| Verse | 0.5 | 0.7× | 0.8× | Room for vocals, lead subdued |
| Pre-Chorus | 0.7 | 0.8× | 0.9× | Building anticipation |
| Chorus | 0.9 | 1.0× | 1.0× | Full energy, all prominent |
| Bridge | 0.6 | 0.7× | 0.8× | Contrast, different feel |
| Build | 0.4→0.9 | increases | 0.7× | Snare rolls, risers |
| Drop | 1.0 | 1.0× | 0.8× | Maximum impact, simpler patterns |
| Breakdown | 0.3 | 0.4× | 0.6× | Drums minimal, pads prominent |
| Sparse | 0.3 | 0.5× | 0.4× | Stripped back |
| Groove | 0.6 | 0.8× | 0.7× | Steady pocket |
| Ambient | 0.2 | 0.3× | 0.3× | Atmospheric |
| Outro | 0.4 | 0.6× | 0.5× | Winding down |

### Loop Variant Matrix

Loops have a 2D variant matrix: **chords × sections**.

```typescript
interface LoopBundle {
  id: string;
  instrument: Instrument;
  seed: number;
  progressionId: string;
  sectionPalette: SectionType[];

  // 2D matrix: [sectionIndex][chordIndex]
  variants: SectionVariants[];

  drumFills?: DrumFillPoints;
}

interface SectionVariants {
  sectionType: SectionType;
  chordVariations: NoteEvent[][];
}
```

**Variant counts:**
- Pop (4 chords × 6 sections) = 24 variations per loop
- Lo-fi (8 chords × 4 sections) = 32 variations per loop

**Generation strategy:** All variants share a **base pattern** (core musical idea), then apply section and chord modifications. Loops stay recognizable across sections while adapting to context.

### Timeline & Arrangement

```typescript
interface SongStructure {
  id: string;
  genre: Genre;
  bpm: number;
  sections: SectionInstance[];
  totalBars: number;
}

interface SectionInstance {
  id: string;
  type: SectionType;
  startBar: number;
  lengthBars: number;
  energyOverride?: number;
  transitionBars?: number;
}
```

**Default section lengths:**

| Section | Default | Range |
|---------|---------|-------|
| Intro | 4 bars | 2-8 |
| Verse | 8 bars | 4-16 |
| Pre-Chorus | 4 bars | 2-8 |
| Chorus | 8 bars | 4-16 |
| Bridge | 8 bars | 4-8 |
| Build | 8 bars | 4-16 |
| Drop | 8 bars | 4-16 |
| Breakdown | 8 bars | 4-16 |
| Outro | 4 bars | 2-8 |

### Structure Templates

```typescript
interface StructureTemplate {
  id: string;
  name: string;
  genre: Genre;
  sections: { type: SectionType; lengthBars: number }[];
}
```

Example templates:
- **"EDM Banger"**: intro(4) → build(8) → drop(16) → breakdown(8) → build(8) → drop(16) → outro(4)
- **"Classic Pop"**: intro(4) → verse(8) → pre-chorus(4) → chorus(8) → verse(8) → chorus(8) → bridge(8) → chorus(8) → outro(4)
- **"Chill Loop"**: intro(4) → groove(16) → sparse(8) → groove(16) → outro(4)

### Transitions

```typescript
type TransitionType =
  | 'cut'           // instant switch
  | 'fill'          // drum fill leads in
  | 'build'         // energy ramps up
  | 'breakdown'     // elements drop out
  | 'swell'         // volume/filter sweep
  | 'impact';       // hit + silence (for drops)

interface TransitionDefinition {
  type: TransitionType;
  lengthBars: 0.5 | 1 | 2 | 4;
  elements: TransitionElement[];
}

interface TransitionElement {
  type: 'drumFill' | 'snareRoll' | 'riser' | 'sweep' | 'impact' | 'silence';
  startOffset: number;
  intensity: number;
}
```

**Default transitions:**

| From → To | Transition |
|-----------|------------|
| Intro → Verse | fill (1 bar) |
| Verse → Pre-Chorus | fill (1 bar) |
| Pre-Chorus → Chorus | build (2 bars) |
| Chorus → Verse | cut or fill |
| Chorus → Bridge | breakdown (2 bars) |
| Bridge → Chorus | build (2 bars) |
| Build → Drop | impact (0.5 bars) |
| Drop → Breakdown | cut |
| Breakdown → Build | swell (2 bars) |
| Any → Outro | breakdown (2 bars) |

### UI/UX

**Structure view** (below/alongside loop grid, toggleable):
- Horizontal timeline with colored section blocks
- Tap to select, drag edges to resize, drag to reorder
- Current position indicator during playback

```
[Intro|4] [Verse|8] [Chorus|8] [Verse|8] [Chorus|8] [Outro|4]
   ↑ current position
```

**Template selection:**
- Modal showing 3-5 structure templates per genre
- Visual preview of template
- Apply sets up sections, offers to regenerate loops

**Section editing:**
- Add: Tap "+" between sections, pick type
- Remove: Swipe or long-press to delete
- Resize: Drag edges (snaps to 2/4/8/16 bars)
- Change type: Tap section, pick from dropdown
- Energy override: Optional slider when selected

**Minimal mode:**
- "Free Play" template: single endless section (current behavior)
- Structure panel hidden by default
- Loop grid remains primary interface

---

## Implementation Considerations

### Storage Impact

Loop bundles grow significantly:
- Old: 1 pattern per loop
- New: (chords × sections) patterns per loop (e.g., 24-32)

Mitigations:
- Note events are small (pitch, time, duration, velocity)
- IndexedDB handles this well
- JSON export grows but remains reasonable

### Performance

- Generate variants lazily on first play, or eagerly on loop creation
- Cache generated variants in memory during session
- Consider Web Workers for generation to avoid UI blocking

### Implementation Phases

**Phase 1: Harmonic Awareness**
- Chord progression data model and genre presets
- Loop bundle structure with chord variations
- Generator updates to produce per-chord variations
- Scheduler updates for progression cycling
- Drum fill system at chord boundaries
- UI for progression display and selection
- "Free" single-chord progression for backward compatibility

**Phase 2: Richer Musical Variation**
- Expanded rhythm template library (~15-20 per instrument per genre)
- Transformation system (shift, subdivide, ghost, accent, omit, fill, euclidean)
- Genre groove profiles (swing, push/pull, pocket, tightness)
- Three-layer dynamics (genre profile → pattern-aware → humanization)
- Integration with existing generators

**Phase 3: Structural Intelligence**
- Section type definitions and genre palettes
- Section behavior parameters (energy, density, complexity multipliers)
- 2D variant matrix (chords × sections)
- Timeline/arrangement data model
- Structure templates per genre
- Transition system (fills, builds, drops, impacts)
- UI for structure view and editing

Each phase delivers value independently. Phase 1 creates infrastructure that Phases 2 and 3 build upon.

### Testing

- Verify all instrument generators produce musically sensible variations
- Test progression cycling at various BPMs
- Confirm drum fills land correctly at boundaries
- Validate voice leading sounds smooth
- Test section transitions for seamless audio
- Performance test with maximum variant counts

---

## Summary

| System | Key Concept | User Benefit |
|--------|-------------|--------------|
| Harmonic Awareness | Shared progressions, chord variants | Loops sound like they belong together |
| Richer Variation | Templates + algorithms + dynamics | Each loop feels alive and genre-authentic |
| Structural Intelligence | Sections, energy, transitions | Loops tell a story, build and release |

Together, these systems transform loop generation from "random patterns that play together" to "a coherent musical experience that evolves over time."
