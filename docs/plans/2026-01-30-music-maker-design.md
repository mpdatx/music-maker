# Music Maker PWA - Design Document

## Overview

A web-based PWA music maker for casual fun and educational exploration. Users jam with a grid of loops—tap cells to toggle loops on/off, all synchronized. Target audience spans kids to adults new to music, with a layered UI (simple surface, depth available).

## Core Concept

**Two modes:**
1. **Play Mode** - Loop grid for quick jamming. Pick a genre preset, loops auto-generate, start tapping.
2. **Edit Mode** - Create/customize loops. Parameter controls for generation, then note-level editing.

**High-level architecture:**
```
┌─────────────────────────────────────────────┐
│                 Svelte UI                   │
├─────────────┬─────────────┬─────────────────┤
│  Loop Grid  │  Loop Editor │  Mixer/Effects │
├─────────────┴─────────────┴─────────────────┤
│              Audio Engine (Tone.js)         │
├─────────────────────────────────────────────┤
│   Loop Generator  │  Sample Library (cached)│
└─────────────────────────────────────────────┘
```

**Data flow:** User actions → Svelte stores → Tone.js scheduling → Audio output

## Loop Grid Interface

**Layout:**
- **Rows (6):** Drums, Percussion, Bass, Keys, Lead, Pad
- **Columns (4-8):** Timeline positions, expandable
- **Each cell:** Instrument + variation indicator, visual feedback when playing/queued

**Interaction:**

| State | Single Tap | Double Tap |
|-------|------------|------------|
| Loop inactive, row silent | Start immediately | Queue to start after current row loop ends |
| Loop inactive, row playing another | Start immediately (cuts off current) | Queue as next (smooth transition) |
| Loop active | Stop immediately | Stop when loop finishes |

- **Long-press/right-click** - Context menu (edit, regenerate, clear)
- **Row header** - Mute/solo, open track effects
- **Column header** - Launch entire column (scene)

**Visual states:**
- Inactive, Active (pulsing), Queued (different highlight)
- Playhead shows current beat position
- Color coding by instrument type

**Transport controls:**
- Play/Pause, Stop, BPM slider
- Global key selector
- Genre preset dropdown

## Loop Editor

**Entry points:**
- Long-press/right-click cell → "Edit"
- Dedicated "Create Loop" button
- From dev tooling (same interface)

**Two editor views:**
- **Step sequencer** - For drums/percussion. 16/32 step grid, rows are individual hits (kick, snare, hat, etc.)
- **Piano roll** - For melodic instruments. Vertical keyboard, horizontal timeline, drag to place/resize notes

**Generation controls (left panel):**
- **Tempo** - Synced to global BPM
- **Key/Scale** - Dropdown (C Major, A Minor, D Dorian, etc.)
- **Density** - Slider (sparse to busy)
- **Complexity** - Slider (simple patterns to syncopated/varied)
- **Style hints** - Checkboxes (straight, swung, syncopated, off-beat)
- **"Generate" button** - Creates pattern based on parameters

**Post-generation editing:**
- Click/drag to add, remove, move notes
- Velocity adjustment per note
- Loop length selector (1, 2, 4 bars)

**Actions:**
- Preview (plays loop in isolation)
- Save to cell
- Save to library (reusable across projects)

## Mixer & Effects

**Mixer view (slide-out panel from right):**
- **Per-track channel strip** for each of the 6 rows:
  - Volume fader
  - Pan knob
  - Mute/Solo buttons
  - Effects chain button (opens effect slots)

**Per-track effects chain:**
- 3-4 effect slots per track
- Drag effects from palette into slots
- Each effect has minimal controls (2-4 knobs)
- Bypass toggle per effect

**Available effects:**

| Effect | Controls |
|--------|----------|
| Reverb | size, mix |
| Delay | time, feedback, mix |
| Filter | cutoff, resonance, type (LP/HP/BP) |
| Distortion | drive, tone |
| Compression | threshold, ratio |
| EQ | low, mid, high |
| Chorus | rate, depth, mix |
| Phaser | rate, depth, mix |

**Master channel:**
- Master volume
- Master effects chain (same slots system)
- Simple limiter (always on, prevents clipping)

**Visual feedback:**
- Level meters per track and master
- Effect activity indicators

## Loop Generation Algorithms

**Genre presets (starting set):**
- Lo-fi Hip-hop
- EDM/House
- Rock
- Ambient/Chill
- Funk
- Pop

Each preset defines default parameters for all instrument types (tempo range, typical patterns, swing amount, etc.)

**Algorithm approach per instrument type:**

**Drums/Percussion:**
- Pattern templates (basic beat, four-on-floor, breakbeat, etc.)
- Randomized ghost notes/fills based on density setting
- Swing/humanization applied

**Bass:**
- Root note emphasis on downbeats
- Pattern follows chord progression hints
- Octave jumps based on complexity

**Keys/Pads:**
- Chord voicings from selected scale
- Rhythm patterns (sustained, stabs, arpeggiated)
- Voice leading between chords

**Lead:**
- Melodic contour selection (ascending, descending, arch, flat)
- Note selection from scale with passing tones
- Rhythm syncs or contrasts with drums

**Technical implementation:**
- Markov chains for pattern variation
- Weighted randomness based on musical rules
- All generation deterministic with seed (reproducible results)

## Data Model & Storage

**Project structure:**
```json
{
  "name": "My Project",
  "bpm": 120,
  "key": "C",
  "scale": "major",
  "tracks": [
    {
      "id": "drums",
      "type": "drums",
      "volume": 0.8,
      "pan": 0,
      "muted": false,
      "effects": [],
      "cells": [
        { "col": 0, "loopId": "loop_abc123" },
        { "col": 1, "loopId": "loop_def456" }
      ]
    }
  ]
}
```

**Loop structure:**
```json
{
  "id": "loop_abc123",
  "type": "drums",
  "bars": 2,
  "seed": 12345,
  "generationParams": {},
  "notes": [
    { "pitch": "kick", "time": "0:0:0", "duration": "8n", "velocity": 0.9 }
  ]
}
```

**Storage:**
- **IndexedDB** for projects and custom loops
- **Service Worker** caches app shell and sample library for offline use
- **Export:** Download project as `.json` file
- **Import:** Load `.json` file to restore project

## Sample Library & Sounds

**Sound sources (hybrid approach):**

**Drums/Percussion:**
- Tone.js drum synthesis for electronic sounds (MembraneSynth, MetalSynth, NoiseSynth)
- CC0 samples for acoustic kits (added later as enhancement)

**Melodic instruments:**
- Tone.js synthesizers for most (smaller footprint, infinitely tunable)
- Sampler-based for realistic sounds where synthesis falls short (future)

**Synth presets per instrument type:**
- **Bass:** Sub bass, acid, pluck, wobble
- **Keys:** Piano, electric piano, organ, bright synth
- **Lead:** Square, saw, FM, vocal-ish
- **Pad:** Warm, airy, dark, shimmer

**Sample management:**
- Total footprint: ~10-20MB for core sounds
- Lazy loading by genre (only cache what's used)
- Service worker pre-caches current genre on project load

## PWA & Offline

**Service Worker strategy:**
- **Precache on install:** App shell (HTML, CSS, JS), Tone.js, all synth definitions
- **Lazy cache:** Genre-specific sample packs cached on first use
- **Cache-first:** All assets served from cache, network as fallback

**Install experience:**
- No install prompts or nudges
- Browser's native install option available (address bar icon)
- Works identically installed or in browser

**Offline behavior:**
- Full functionality offline (play, edit, save)
- Visual indicator when offline (subtle, non-intrusive)
- Projects auto-save to IndexedDB

**Storage management:**
- Estimated usage shown in settings
- Option to clear cached genre packs
- Core app (~2-3MB) + samples (~10-20MB when all cached)

**Updates:**
- Service worker checks for updates on load
- "New version available" toast with refresh option
- No forced interruption

## UI Layout & Navigation

**Main screens:**

1. **Home/Grid View** (default)
   - Loop grid takes center stage
   - Transport controls at bottom
   - Genre/key/BPM controls in top bar
   - Mixer toggle button (slide-out panel)

2. **Loop Editor** (modal/overlay)
   - Opens over grid, doesn't lose context
   - Step sequencer or piano roll based on instrument
   - Generation controls in sidebar
   - Close returns to grid

3. **Mixer** (slide-out panel)
   - Slides in from right
   - Channel strips visible alongside grid
   - Can stay open while playing

4. **Settings** (modal)
   - Storage management
   - About/credits
   - Export/import project
   - Clear all data

**Navigation:**
- Tab bar or icon buttons (Grid, Mixer, Settings)
- No deep navigation—everything 1-2 taps away
- Keyboard shortcuts for power users (spacebar = play/pause, etc.)

**Responsive layout:**
- **Mobile:** Stacked layout, full-screen editor, bottom sheet mixer
- **Tablet:** Side-by-side grid + mixer possible
- **Desktop:** All panels visible, more columns in grid

## Educational Features

**Passive learning (built into the experience):**
- Labels use real music terms (BPM, scale, bars, velocity)
- Tooltips explain terms on hover/long-press
- Visual connection between notes and sounds (piano roll keys light up on playback)

**Active hints (optional, toggleable):**
- "Tips" panel suggests why certain loops work together
- Genre presets include brief description ("Lo-fi hip-hop: slower BPM, jazzy chords, dusty drums")
- Generation params show musical reasoning ("Density: more notes per bar")

**Discovery encouragement:**
- "Randomize" button for instant exploration
- "Surprise me" genre option
- Subtle suggestions ("Try muting the drums to hear the melody")

**Not included:**
- No tutorials or onboarding flows
- No lessons or structured curriculum
- No gamification or achievements

Learning happens through play, not instruction.

## Tech Stack

- **UI Framework:** Svelte
- **Audio Engine:** Tone.js (Web Audio API wrapper)
- **Storage:** IndexedDB (via idb or similar)
- **PWA:** Service Worker with Workbox
- **Build:** Vite

## Out of Scope

- Audio export (WAV/MP3)
- Backend/cloud sync
- User accounts
- Sharing links
- Structured lessons/tutorials
- Mobile app (native)

## Summary Table

| Aspect | Decision |
|--------|----------|
| Primary use | Casual fun + educational |
| Audience | All ages (layered UI) |
| Interface | Loop grid (6 rows × 4-8 cols) |
| Instruments | Drums, Percussion, Bass, Keys, Lead, Pad |
| Loop control | Single tap (immediate), double tap (queued) |
| Loop editor | Step sequencer (drums) + piano roll (melodic) |
| Generation | Genre presets + parameter tweaks + note editing |
| Effects | Per-track chains + master (8 effect types) |
| Sounds | Tone.js synths, CC0 samples later |
| Storage | IndexedDB + JSON export |
| PWA | Full offline, no install prompts |
| Tech stack | Svelte + Tone.js |
