# Music Maker PWA Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web-based PWA music maker with a loop grid interface, algorithmic loop generation, and effects mixer.

**Architecture:** Svelte components for UI, Tone.js for audio engine, Svelte stores for state management, IndexedDB for persistence. Loop grid is the main view, with modal editor and slide-out mixer.

**Tech Stack:** Svelte, Vite, Tone.js, TypeScript, idb (IndexedDB wrapper), Workbox (PWA)

---

## Phase 1: Project Setup & Foundation

### Task 1.1: Initialize Vite + Svelte Project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.ts`
- Create: `src/App.svelte`
- Create: `index.html`

**Step 1: Create Svelte project with Vite**

```bash
cd /Users/mpd/claude/music-maker/.worktrees/initial-build
npm create vite@latest . -- --template svelte-ts
```

Select: Svelte, TypeScript

**Step 2: Install dependencies**

```bash
npm install
```

**Step 3: Verify project runs**

```bash
npm run dev
```

Expected: Dev server starts, shows Vite + Svelte welcome page

**Step 4: Commit**

```bash
git add -A
git commit -m "Initialize Vite + Svelte project"
```

---

### Task 1.2: Install Core Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Tone.js**

```bash
npm install tone
```

**Step 2: Install idb for IndexedDB**

```bash
npm install idb
```

**Step 3: Verify packages installed**

```bash
npm list tone idb
```

Expected: Shows tone and idb versions

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add tone.js and idb dependencies"
```

---

### Task 1.3: Set Up Project Structure

**Files:**
- Create: `src/lib/audio/` directory
- Create: `src/lib/stores/` directory
- Create: `src/lib/types/` directory
- Create: `src/lib/generators/` directory
- Create: `src/lib/storage/` directory
- Create: `src/components/` directory

**Step 1: Create directory structure**

```bash
mkdir -p src/lib/audio src/lib/stores src/lib/types src/lib/generators src/lib/storage src/components
```

**Step 2: Create placeholder files**

Create `src/lib/types/index.ts`:
```typescript
// Type definitions for Music Maker
export {};
```

Create `src/lib/audio/index.ts`:
```typescript
// Audio engine exports
export {};
```

Create `src/lib/stores/index.ts`:
```typescript
// Svelte store exports
export {};
```

**Step 3: Commit**

```bash
git add src/lib src/components
git commit -m "Set up project directory structure"
```

---

### Task 1.4: Define Core Types

**Files:**
- Create: `src/lib/types/music.ts`

**Step 1: Create type definitions**

Create `src/lib/types/music.ts`:
```typescript
export type InstrumentType = 'drums' | 'percussion' | 'bass' | 'keys' | 'lead' | 'pad';

export type ScaleType = 'major' | 'minor' | 'dorian' | 'mixolydian' | 'pentatonic';

export interface Note {
  pitch: string;      // e.g., "C4" or "kick"
  time: string;       // Tone.js time format "0:0:0"
  duration: string;   // e.g., "8n", "4n"
  velocity: number;   // 0-1
}

export interface GenerationParams {
  density: number;      // 0-1, sparse to busy
  complexity: number;   // 0-1, simple to syncopated
  swing: number;        // 0-1, straight to swung
  style: 'straight' | 'swung' | 'syncopated' | 'offbeat';
}

export interface Loop {
  id: string;
  type: InstrumentType;
  bars: number;
  seed: number;
  generationParams: GenerationParams;
  notes: Note[];
}

export interface EffectConfig {
  type: 'reverb' | 'delay' | 'filter' | 'distortion' | 'compression' | 'eq' | 'chorus' | 'phaser';
  params: Record<string, number>;
  bypassed: boolean;
}

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
}

export interface Project {
  id: string;
  name: string;
  bpm: number;
  key: string;
  scale: ScaleType;
  tracks: Track[];
  loops: Record<string, Loop>;
  createdAt: number;
  updatedAt: number;
}

export type LoopState = 'inactive' | 'active' | 'queued' | 'stopping';

export interface CellState {
  loopId: string | null;
  state: LoopState;
}

export type GenrePreset = 'lofi-hiphop' | 'edm-house' | 'rock' | 'ambient' | 'funk' | 'pop';
```

**Step 2: Export from index**

Update `src/lib/types/index.ts`:
```typescript
export * from './music';
```

**Step 3: Commit**

```bash
git add src/lib/types
git commit -m "Define core TypeScript types"
```

---

## Phase 2: Audio Engine Foundation

### Task 2.1: Create Audio Context Manager

**Files:**
- Create: `src/lib/audio/context.ts`

**Step 1: Create audio context wrapper**

Create `src/lib/audio/context.ts`:
```typescript
import * as Tone from 'tone';

let initialized = false;

export async function initAudio(): Promise<void> {
  if (initialized) return;

  await Tone.start();
  initialized = true;
  console.log('Audio context started');
}

export function isAudioReady(): boolean {
  return initialized;
}

export function getTransport() {
  return Tone.getTransport();
}

export function setBpm(bpm: number): void {
  Tone.getTransport().bpm.value = bpm;
}

export function getBpm(): number {
  return Tone.getTransport().bpm.value;
}
```

**Step 2: Commit**

```bash
git add src/lib/audio/context.ts
git commit -m "Add audio context manager"
```

---

### Task 2.2: Create Drum Synth Definitions

**Files:**
- Create: `src/lib/audio/instruments/drums.ts`

**Step 1: Create drum synth factory**

Create directory and file:
```bash
mkdir -p src/lib/audio/instruments
```

Create `src/lib/audio/instruments/drums.ts`:
```typescript
import * as Tone from 'tone';

export interface DrumKit {
  kick: Tone.MembraneSynth;
  snare: Tone.NoiseSynth;
  hihat: Tone.MetalSynth;
  openhat: Tone.MetalSynth;
  tom: Tone.MembraneSynth;
  clap: Tone.NoiseSynth;
}

export function createDrumKit(): DrumKit {
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.01,
      release: 0.4,
    },
  });

  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.1,
    },
  });

  const hihat = new Tone.MetalSynth({
    frequency: 400,
    envelope: {
      attack: 0.001,
      decay: 0.05,
      release: 0.01,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  });

  const openhat = new Tone.MetalSynth({
    frequency: 400,
    envelope: {
      attack: 0.001,
      decay: 0.3,
      release: 0.1,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  });

  const tom = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0.01,
      release: 0.3,
    },
  });

  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
    },
  });

  return { kick, snare, hihat, openhat, tom, clap };
}

export function connectDrumKit(kit: DrumKit, destination: Tone.InputNode): void {
  Object.values(kit).forEach(synth => synth.connect(destination));
}

export function disposeDrumKit(kit: DrumKit): void {
  Object.values(kit).forEach(synth => synth.dispose());
}
```

**Step 2: Commit**

```bash
git add src/lib/audio/instruments
git commit -m "Add drum synth definitions"
```

---

### Task 2.3: Create Melodic Synth Definitions

**Files:**
- Create: `src/lib/audio/instruments/melodic.ts`

**Step 1: Create melodic synth factory**

Create `src/lib/audio/instruments/melodic.ts`:
```typescript
import * as Tone from 'tone';
import type { InstrumentType } from '../../types';

export type MelodicSynth = Tone.PolySynth | Tone.MonoSynth;

interface SynthPreset {
  name: string;
  create: () => MelodicSynth;
}

const bassPresets: SynthPreset[] = [
  {
    name: 'sub',
    create: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.2 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.2, baseFrequency: 200, octaves: 2 },
    }),
  },
  {
    name: 'acid',
    create: () => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.1 },
      filterEnvelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.2, baseFrequency: 150, octaves: 4 },
    }),
  },
];

const keysPresets: SynthPreset[] = [
  {
    name: 'piano',
    create: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 0.5 },
    }),
  },
  {
    name: 'epiano',
    create: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 10,
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.2, release: 0.5 },
    }),
  },
];

const leadPresets: SynthPreset[] = [
  {
    name: 'saw',
    create: () => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 },
    }),
  },
  {
    name: 'square',
    create: () => new Tone.MonoSynth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.2 },
    }),
  },
];

const padPresets: SynthPreset[] = [
  {
    name: 'warm',
    create: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1 },
    }),
  },
  {
    name: 'airy',
    create: () => new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 2,
      envelope: { attack: 0.8, decay: 0.3, sustain: 0.7, release: 1.5 },
    }),
  },
];

const presetsByType: Record<string, SynthPreset[]> = {
  bass: bassPresets,
  keys: keysPresets,
  lead: leadPresets,
  pad: padPresets,
};

export function createMelodicSynth(type: InstrumentType, presetIndex = 0): MelodicSynth {
  const presets = presetsByType[type];
  if (!presets) {
    throw new Error(`No presets for instrument type: ${type}`);
  }
  const preset = presets[presetIndex % presets.length];
  return preset.create();
}

export function getPresetNames(type: InstrumentType): string[] {
  const presets = presetsByType[type];
  return presets ? presets.map(p => p.name) : [];
}
```

**Step 2: Commit**

```bash
git add src/lib/audio/instruments/melodic.ts
git commit -m "Add melodic synth definitions"
```

---

### Task 2.4: Create Instrument Manager

**Files:**
- Create: `src/lib/audio/instrumentManager.ts`

**Step 1: Create instrument manager**

Create `src/lib/audio/instrumentManager.ts`:
```typescript
import * as Tone from 'tone';
import type { InstrumentType } from '../types';
import { createDrumKit, connectDrumKit, disposeDrumKit, type DrumKit } from './instruments/drums';
import { createMelodicSynth, type MelodicSynth } from './instruments/melodic';

interface TrackInstrument {
  type: InstrumentType;
  synth: DrumKit | MelodicSynth;
  channel: Tone.Channel;
}

class InstrumentManager {
  private instruments: Map<string, TrackInstrument> = new Map();
  private master: Tone.Channel;
  private limiter: Tone.Limiter;

  constructor() {
    this.limiter = new Tone.Limiter(-1).toDestination();
    this.master = new Tone.Channel().connect(this.limiter);
  }

  createTrackInstrument(trackId: string, type: InstrumentType): TrackInstrument {
    // Dispose existing if any
    this.disposeTrackInstrument(trackId);

    const channel = new Tone.Channel().connect(this.master);

    let synth: DrumKit | MelodicSynth;
    if (type === 'drums' || type === 'percussion') {
      synth = createDrumKit();
      connectDrumKit(synth as DrumKit, channel);
    } else {
      synth = createMelodicSynth(type);
      (synth as MelodicSynth).connect(channel);
    }

    const instrument: TrackInstrument = { type, synth, channel };
    this.instruments.set(trackId, instrument);
    return instrument;
  }

  getTrackInstrument(trackId: string): TrackInstrument | undefined {
    return this.instruments.get(trackId);
  }

  setTrackVolume(trackId: string, volume: number): void {
    const instrument = this.instruments.get(trackId);
    if (instrument) {
      instrument.channel.volume.value = Tone.gainToDb(volume);
    }
  }

  setTrackPan(trackId: string, pan: number): void {
    const instrument = this.instruments.get(trackId);
    if (instrument) {
      instrument.channel.pan.value = pan;
    }
  }

  setTrackMute(trackId: string, muted: boolean): void {
    const instrument = this.instruments.get(trackId);
    if (instrument) {
      instrument.channel.mute = muted;
    }
  }

  setMasterVolume(volume: number): void {
    this.master.volume.value = Tone.gainToDb(volume);
  }

  disposeTrackInstrument(trackId: string): void {
    const instrument = this.instruments.get(trackId);
    if (instrument) {
      if (instrument.type === 'drums' || instrument.type === 'percussion') {
        disposeDrumKit(instrument.synth as DrumKit);
      } else {
        (instrument.synth as MelodicSynth).dispose();
      }
      instrument.channel.dispose();
      this.instruments.delete(trackId);
    }
  }

  disposeAll(): void {
    for (const trackId of this.instruments.keys()) {
      this.disposeTrackInstrument(trackId);
    }
    this.master.dispose();
    this.limiter.dispose();
  }
}

export const instrumentManager = new InstrumentManager();
```

**Step 2: Export from audio index**

Update `src/lib/audio/index.ts`:
```typescript
export * from './context';
export * from './instrumentManager';
export * from './instruments/drums';
export * from './instruments/melodic';
```

**Step 3: Commit**

```bash
git add src/lib/audio
git commit -m "Add instrument manager"
```

---

## Phase 3: Loop Playback Engine

### Task 3.1: Create Loop Scheduler

**Files:**
- Create: `src/lib/audio/loopScheduler.ts`

**Step 1: Create loop scheduler**

Create `src/lib/audio/loopScheduler.ts`:
```typescript
import * as Tone from 'tone';
import type { Loop, Note, InstrumentType } from '../types';
import { instrumentManager } from './instrumentManager';
import type { DrumKit } from './instruments/drums';
import type { MelodicSynth } from './instruments/melodic';

interface ScheduledLoop {
  trackId: string;
  loop: Loop;
  part: Tone.Part;
}

class LoopScheduler {
  private scheduledLoops: Map<string, ScheduledLoop> = new Map();
  private loopLength: Tone.Unit.Time = '2m'; // 2 bars default

  private getLoopKey(trackId: string): string {
    return trackId;
  }

  scheduleLoop(trackId: string, loop: Loop): void {
    // Stop any existing loop on this track
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
          drum.triggerAttackRelease('C1', event.duration, time, event.velocity);
        } else {
          drum.triggerAttackRelease(event.duration, time, event.velocity);
        }
      }
    } else {
      const synth = instrument.synth as MelodicSynth;
      synth.triggerAttackRelease(event.pitch, event.duration, time, event.velocity);
    }
  }

  stopLoop(trackId: string): void {
    const key = this.getLoopKey(trackId);
    const scheduled = this.scheduledLoops.get(key);
    if (scheduled) {
      scheduled.part.stop();
      scheduled.part.dispose();
      this.scheduledLoops.delete(key);
    }
  }

  stopLoopAtEnd(trackId: string): void {
    const key = this.getLoopKey(trackId);
    const scheduled = this.scheduledLoops.get(key);
    if (scheduled) {
      // Calculate next loop boundary
      const transport = Tone.getTransport();
      const bars = scheduled.loop.bars;
      const currentPosition = transport.position as string;
      // Stop at next loop boundary (Tone.js handles this)
      scheduled.part.stop(`+${bars}m`);
      // Schedule cleanup
      transport.scheduleOnce(() => {
        scheduled.part.dispose();
        this.scheduledLoops.delete(key);
      }, `+${bars}m`);
    }
  }

  queueLoop(trackId: string, loop: Loop): void {
    const key = this.getLoopKey(trackId);
    const existing = this.scheduledLoops.get(key);

    if (existing) {
      // Schedule new loop to start when current ends
      const bars = existing.loop.bars;
      const transport = Tone.getTransport();
      transport.scheduleOnce(() => {
        this.scheduleLoop(trackId, loop);
      }, `+${bars}m`);
    } else {
      // No current loop, schedule to start at next bar
      const transport = Tone.getTransport();
      transport.scheduleOnce(() => {
        this.scheduleLoop(trackId, loop);
      }, '@1m');
    }
  }

  isPlaying(trackId: string): boolean {
    return this.scheduledLoops.has(this.getLoopKey(trackId));
  }

  stopAll(): void {
    for (const [key, scheduled] of this.scheduledLoops) {
      scheduled.part.stop();
      scheduled.part.dispose();
    }
    this.scheduledLoops.clear();
  }
}

export const loopScheduler = new LoopScheduler();
```

**Step 2: Add to exports**

Update `src/lib/audio/index.ts`:
```typescript
export * from './context';
export * from './instrumentManager';
export * from './loopScheduler';
export * from './instruments/drums';
export * from './instruments/melodic';
```

**Step 3: Commit**

```bash
git add src/lib/audio
git commit -m "Add loop scheduler"
```

---

### Task 3.2: Create Transport Controller

**Files:**
- Create: `src/lib/audio/transport.ts`

**Step 1: Create transport controller**

Create `src/lib/audio/transport.ts`:
```typescript
import * as Tone from 'tone';
import { loopScheduler } from './loopScheduler';

export type TransportState = 'stopped' | 'started' | 'paused';

class TransportController {
  start(): void {
    Tone.getTransport().start();
  }

  stop(): void {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    loopScheduler.stopAll();
  }

  pause(): void {
    Tone.getTransport().pause();
  }

  toggle(): void {
    const transport = Tone.getTransport();
    if (transport.state === 'started') {
      this.pause();
    } else {
      this.start();
    }
  }

  getState(): TransportState {
    return Tone.getTransport().state as TransportState;
  }

  setBpm(bpm: number): void {
    Tone.getTransport().bpm.value = bpm;
  }

  getBpm(): number {
    return Tone.getTransport().bpm.value;
  }

  getPosition(): string {
    return Tone.getTransport().position as string;
  }

  getProgress(): number {
    return Tone.getTransport().progress;
  }

  setSwing(amount: number): void {
    Tone.getTransport().swing = amount;
  }
}

export const transport = new TransportController();
```

**Step 2: Add to exports**

Update `src/lib/audio/index.ts`:
```typescript
export * from './context';
export * from './instrumentManager';
export * from './loopScheduler';
export * from './transport';
export * from './instruments/drums';
export * from './instruments/melodic';
```

**Step 3: Commit**

```bash
git add src/lib/audio
git commit -m "Add transport controller"
```

---

## Phase 4: State Management

### Task 4.1: Create Project Store

**Files:**
- Create: `src/lib/stores/project.ts`

**Step 1: Create project store**

Create `src/lib/stores/project.ts`:
```typescript
import { writable, derived, get } from 'svelte/store';
import type { Project, Track, Loop, InstrumentType, GenrePreset } from '../types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function createDefaultTrack(type: InstrumentType, name: string, colCount: number): Track {
  return {
    id: generateId(),
    type,
    name,
    volume: 0.8,
    pan: 0,
    muted: false,
    solo: false,
    effects: [],
    cells: Array.from({ length: colCount }, (_, i) => ({ col: i, loopId: null })),
  };
}

function createDefaultProject(): Project {
  const colCount = 4;
  return {
    id: generateId(),
    name: 'New Project',
    bpm: 120,
    key: 'C',
    scale: 'major',
    tracks: [
      createDefaultTrack('drums', 'Drums', colCount),
      createDefaultTrack('percussion', 'Percussion', colCount),
      createDefaultTrack('bass', 'Bass', colCount),
      createDefaultTrack('keys', 'Keys', colCount),
      createDefaultTrack('lead', 'Lead', colCount),
      createDefaultTrack('pad', 'Pad', colCount),
    ],
    loops: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createProjectStore() {
  const { subscribe, set, update } = writable<Project>(createDefaultProject());

  return {
    subscribe,

    reset: () => set(createDefaultProject()),

    load: (project: Project) => set(project),

    setName: (name: string) => update(p => ({ ...p, name, updatedAt: Date.now() })),

    setBpm: (bpm: number) => update(p => ({ ...p, bpm, updatedAt: Date.now() })),

    setKey: (key: string) => update(p => ({ ...p, key, updatedAt: Date.now() })),

    setScale: (scale: Project['scale']) => update(p => ({ ...p, scale, updatedAt: Date.now() })),

    setTrackVolume: (trackId: string, volume: number) => update(p => ({
      ...p,
      tracks: p.tracks.map(t => t.id === trackId ? { ...t, volume } : t),
      updatedAt: Date.now(),
    })),

    setTrackMute: (trackId: string, muted: boolean) => update(p => ({
      ...p,
      tracks: p.tracks.map(t => t.id === trackId ? { ...t, muted } : t),
      updatedAt: Date.now(),
    })),

    setTrackSolo: (trackId: string, solo: boolean) => update(p => ({
      ...p,
      tracks: p.tracks.map(t => t.id === trackId ? { ...t, solo } : t),
      updatedAt: Date.now(),
    })),

    setCellLoop: (trackId: string, col: number, loopId: string | null) => update(p => ({
      ...p,
      tracks: p.tracks.map(t => t.id === trackId ? {
        ...t,
        cells: t.cells.map(c => c.col === col ? { ...c, loopId } : c),
      } : t),
      updatedAt: Date.now(),
    })),

    addLoop: (loop: Loop) => update(p => ({
      ...p,
      loops: { ...p.loops, [loop.id]: loop },
      updatedAt: Date.now(),
    })),

    updateLoop: (loopId: string, updates: Partial<Loop>) => update(p => ({
      ...p,
      loops: { ...p.loops, [loopId]: { ...p.loops[loopId], ...updates } },
      updatedAt: Date.now(),
    })),

    removeLoop: (loopId: string) => update(p => {
      const { [loopId]: removed, ...rest } = p.loops;
      return { ...p, loops: rest, updatedAt: Date.now() };
    }),

    addColumn: () => update(p => ({
      ...p,
      tracks: p.tracks.map(t => ({
        ...t,
        cells: [...t.cells, { col: t.cells.length, loopId: null }],
      })),
      updatedAt: Date.now(),
    })),

    getSnapshot: () => get({ subscribe }),
  };
}

export const project = createProjectStore();

// Derived stores for convenience
export const tracks = derived(project, $p => $p.tracks);
export const loops = derived(project, $p => $p.loops);
export const bpm = derived(project, $p => $p.bpm);
export const musicalKey = derived(project, $p => $p.key);
export const scale = derived(project, $p => $p.scale);
```

**Step 2: Commit**

```bash
git add src/lib/stores/project.ts
git commit -m "Add project store"
```

---

### Task 4.2: Create Playback State Store

**Files:**
- Create: `src/lib/stores/playback.ts`

**Step 1: Create playback store**

Create `src/lib/stores/playback.ts`:
```typescript
import { writable, derived } from 'svelte/store';
import type { LoopState, TransportState } from '../types';

interface CellPlaybackState {
  trackId: string;
  col: number;
  state: LoopState;
  queuedLoopId?: string;
}

interface PlaybackState {
  transportState: TransportState;
  cells: Map<string, CellPlaybackState>;
  currentBeat: number;
  currentBar: number;
}

function getCellKey(trackId: string, col: number): string {
  return `${trackId}:${col}`;
}

function createPlaybackStore() {
  const { subscribe, set, update } = writable<PlaybackState>({
    transportState: 'stopped',
    cells: new Map(),
    currentBeat: 0,
    currentBar: 0,
  });

  return {
    subscribe,

    setTransportState: (state: TransportState) => update(s => ({
      ...s,
      transportState: state,
    })),

    setCellState: (trackId: string, col: number, state: LoopState, queuedLoopId?: string) => update(s => {
      const key = getCellKey(trackId, col);
      const newCells = new Map(s.cells);
      if (state === 'inactive') {
        newCells.delete(key);
      } else {
        newCells.set(key, { trackId, col, state, queuedLoopId });
      }
      return { ...s, cells: newCells };
    }),

    getCellState: (trackId: string, col: number) => {
      let state: CellPlaybackState | undefined;
      subscribe(s => {
        state = s.cells.get(getCellKey(trackId, col));
      })();
      return state;
    },

    clearTrackCells: (trackId: string) => update(s => {
      const newCells = new Map(s.cells);
      for (const key of newCells.keys()) {
        if (key.startsWith(`${trackId}:`)) {
          newCells.delete(key);
        }
      }
      return { ...s, cells: newCells };
    }),

    setPosition: (bar: number, beat: number) => update(s => ({
      ...s,
      currentBar: bar,
      currentBeat: beat,
    })),

    reset: () => set({
      transportState: 'stopped',
      cells: new Map(),
      currentBeat: 0,
      currentBar: 0,
    }),
  };
}

export const playback = createPlaybackStore();

export const transportState = derived(playback, $p => $p.transportState);
export const isPlaying = derived(playback, $p => $p.transportState === 'started');
```

**Step 2: Add to store exports**

Update `src/lib/stores/index.ts`:
```typescript
export * from './project';
export * from './playback';
```

**Step 3: Commit**

```bash
git add src/lib/stores
git commit -m "Add playback state store"
```

---

## Phase 5: Loop Generation

### Task 5.1: Create Music Theory Utilities

**Files:**
- Create: `src/lib/generators/theory.ts`

**Step 1: Create music theory helpers**

Create `src/lib/generators/theory.ts`:
```typescript
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic: [0, 2, 4, 7, 9],
};

export function getScaleNotes(root: string, scale: string, octave: number): string[] {
  const rootIndex = NOTES.indexOf(root);
  if (rootIndex === -1) return [];

  const intervals = SCALES[scale] || SCALES.major;
  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    const noteOctave = octave + Math.floor((rootIndex + interval) / 12);
    return `${NOTES[noteIndex]}${noteOctave}`;
  });
}

export function getNoteInScale(root: string, scale: string, degree: number, octave: number): string {
  const notes = getScaleNotes(root, scale, octave);
  const adjustedDegree = ((degree % notes.length) + notes.length) % notes.length;
  const octaveOffset = Math.floor(degree / notes.length);
  const note = notes[adjustedDegree];
  // Adjust octave if degree went up/down
  const baseNote = note.slice(0, -1);
  const baseOctave = parseInt(note.slice(-1));
  return `${baseNote}${baseOctave + octaveOffset}`;
}

export function getChordNotes(root: string, scale: string, degree: number, octave: number): string[] {
  // Triad: root, third, fifth
  return [
    getNoteInScale(root, scale, degree, octave),
    getNoteInScale(root, scale, degree + 2, octave),
    getNoteInScale(root, scale, degree + 4, octave),
  ];
}

// Seeded random number generator for reproducible patterns
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/generators/theory.ts
git commit -m "Add music theory utilities"
```

---

### Task 5.2: Create Drum Pattern Generator

**Files:**
- Create: `src/lib/generators/drums.ts`

**Step 1: Create drum generator**

Create `src/lib/generators/drums.ts`:
```typescript
import type { Note, GenerationParams } from '../types';
import { SeededRandom } from './theory';

interface DrumPattern {
  kick: number[];
  snare: number[];
  hihat: number[];
  openhat: number[];
}

const BASIC_PATTERNS: DrumPattern[] = [
  // Basic rock beat
  { kick: [0, 8], snare: [4, 12], hihat: [0, 2, 4, 6, 8, 10, 12, 14], openhat: [] },
  // Four on the floor
  { kick: [0, 4, 8, 12], snare: [4, 12], hihat: [2, 6, 10, 14], openhat: [0, 8] },
  // Hip-hop
  { kick: [0, 6, 10], snare: [4, 12], hihat: [0, 2, 4, 6, 8, 10, 12, 14], openhat: [] },
  // Breakbeat
  { kick: [0, 10], snare: [4, 14], hihat: [0, 2, 4, 6, 8, 10, 12, 14], openhat: [] },
];

export function generateDrumPattern(params: GenerationParams, seed: number, bars = 2): Note[] {
  const rng = new SeededRandom(seed);
  const stepsPerBar = 16;
  const totalSteps = stepsPerBar * bars;
  const notes: Note[] = [];

  // Pick base pattern
  const pattern = rng.pick(BASIC_PATTERNS);

  for (let bar = 0; bar < bars; bar++) {
    // Kick
    for (const step of pattern.kick) {
      const time = `${bar}:0:${step * 0.25}`;
      notes.push({ pitch: 'kick', time, duration: '8n', velocity: 0.9 });
    }

    // Snare
    for (const step of pattern.snare) {
      const time = `${bar}:0:${step * 0.25}`;
      notes.push({ pitch: 'snare', time, duration: '8n', velocity: 0.85 });
    }

    // Hi-hats
    for (let step = 0; step < stepsPerBar; step++) {
      const baseHit = pattern.hihat.includes(step);
      const openHit = pattern.openhat.includes(step);

      // Add extra hits based on density
      const shouldHit = baseHit || rng.chance(params.density * 0.3);

      if (shouldHit) {
        const time = `${bar}:0:${step * 0.25}`;
        const isOpen = openHit || (rng.chance(0.1) && params.complexity > 0.5);
        notes.push({
          pitch: isOpen ? 'openhat' : 'hihat',
          time,
          duration: '16n',
          velocity: 0.6 + rng.next() * 0.2,
        });
      }
    }

    // Ghost notes based on complexity
    if (params.complexity > 0.4) {
      const ghostCount = Math.floor(params.complexity * 4);
      for (let i = 0; i < ghostCount; i++) {
        const step = rng.nextInt(0, stepsPerBar - 1);
        const time = `${bar}:0:${step * 0.25}`;
        notes.push({
          pitch: rng.pick(['snare', 'tom']),
          time,
          duration: '32n',
          velocity: 0.3 + rng.next() * 0.2,
        });
      }
    }
  }

  return notes;
}
```

**Step 2: Commit**

```bash
git add src/lib/generators/drums.ts
git commit -m "Add drum pattern generator"
```

---

### Task 5.3: Create Bass Line Generator

**Files:**
- Create: `src/lib/generators/bass.ts`

**Step 1: Create bass generator**

Create `src/lib/generators/bass.ts`:
```typescript
import type { Note, GenerationParams } from '../types';
import { SeededRandom, getNoteInScale } from './theory';

const BASS_PATTERNS = [
  // Steady root
  [0, 4, 8, 12],
  // Syncopated
  [0, 3, 6, 10, 14],
  // Octave jump
  [0, 0, 8, 8],
  // Funk
  [0, 3, 4, 7, 10, 12],
];

export function generateBassLine(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const rng = new SeededRandom(seed);
  const stepsPerBar = 16;
  const notes: Note[] = [];
  const octave = 2;

  // Pick base pattern
  const pattern = rng.pick(BASS_PATTERNS);

  for (let bar = 0; bar < bars; bar++) {
    // Simple chord progression: I - IV - V - I or similar
    const chordDegrees = [0, 3, 4, 0];
    const barDegree = chordDegrees[bar % 4];

    for (const step of pattern) {
      const time = `${bar}:0:${step * 0.25}`;

      // Root note most of the time
      let degree = barDegree;

      // Add variation based on complexity
      if (params.complexity > 0.3 && rng.chance(params.complexity * 0.4)) {
        // Sometimes play fifth or octave
        degree += rng.pick([0, 4, 7]);
      }

      const pitch = getNoteInScale(key, scale, degree, octave);

      // Vary duration based on density
      const durations = ['4n', '8n', '8n.'];
      const duration = params.density > 0.6 ? rng.pick(durations) : '4n';

      notes.push({
        pitch,
        time,
        duration,
        velocity: 0.8 + rng.next() * 0.15,
      });
    }

    // Fill notes based on density
    if (params.density > 0.5) {
      const fillCount = Math.floor(params.density * 3);
      for (let i = 0; i < fillCount; i++) {
        const step = rng.nextInt(0, stepsPerBar - 1);
        if (!pattern.includes(step)) {
          const time = `${bar}:0:${step * 0.25}`;
          const degree = barDegree + rng.pick([0, 2, 4]);
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
```

**Step 2: Commit**

```bash
git add src/lib/generators/bass.ts
git commit -m "Add bass line generator"
```

---

### Task 5.4: Create Chord Generator

**Files:**
- Create: `src/lib/generators/chords.ts`

**Step 1: Create chord generator**

Create `src/lib/generators/chords.ts`:
```typescript
import type { Note, GenerationParams } from '../types';
import { SeededRandom, getChordNotes, getNoteInScale } from './theory';

const CHORD_RHYTHMS = [
  // Sustained
  [{ step: 0, duration: '1m' }],
  // Half notes
  [{ step: 0, duration: '2n' }, { step: 8, duration: '2n' }],
  // Stabs
  [{ step: 0, duration: '8n' }, { step: 4, duration: '8n' }, { step: 8, duration: '8n' }, { step: 12, duration: '8n' }],
  // Syncopated
  [{ step: 0, duration: '4n' }, { step: 6, duration: '4n' }, { step: 10, duration: '4n' }],
];

const PROGRESSIONS = [
  [0, 3, 4, 4],   // I - IV - V - V
  [0, 5, 3, 4],   // I - vi - IV - V
  [0, 0, 3, 4],   // I - I - IV - V
  [0, 3, 0, 4],   // I - IV - I - V
];

export function generateChords(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const rng = new SeededRandom(seed);
  const notes: Note[] = [];
  const octave = 4;

  // Pick rhythm pattern based on density
  const rhythmIndex = Math.min(
    Math.floor(params.density * CHORD_RHYTHMS.length),
    CHORD_RHYTHMS.length - 1
  );
  const rhythm = CHORD_RHYTHMS[rhythmIndex];

  // Pick chord progression
  const progression = rng.pick(PROGRESSIONS);

  for (let bar = 0; bar < bars; bar++) {
    const degree = progression[bar % progression.length];
    const chordNotes = getChordNotes(key, scale, degree, octave);

    for (const { step, duration } of rhythm) {
      const time = `${bar}:0:${step * 0.25}`;

      // Add all chord notes
      for (const pitch of chordNotes) {
        notes.push({
          pitch,
          time,
          duration,
          velocity: 0.6 + rng.next() * 0.2,
        });
      }

      // Add 7th for complexity
      if (params.complexity > 0.6 && rng.chance(0.5)) {
        const seventh = getNoteInScale(key, scale, degree + 6, octave);
        notes.push({
          pitch: seventh,
          time,
          duration,
          velocity: 0.5,
        });
      }
    }
  }

  return notes;
}
```

**Step 2: Commit**

```bash
git add src/lib/generators/chords.ts
git commit -m "Add chord generator"
```

---

### Task 5.5: Create Lead Melody Generator

**Files:**
- Create: `src/lib/generators/lead.ts`

**Step 1: Create lead generator**

Create `src/lib/generators/lead.ts`:
```typescript
import type { Note, GenerationParams } from '../types';
import { SeededRandom, getNoteInScale } from './theory';

type Contour = 'ascending' | 'descending' | 'arch' | 'flat';

export function generateLead(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const rng = new SeededRandom(seed);
  const stepsPerBar = 16;
  const notes: Note[] = [];
  const octave = 5;

  // Pick contour
  const contours: Contour[] = ['ascending', 'descending', 'arch', 'flat'];
  const contour = rng.pick(contours);

  // Determine note density based on params
  const notesPerBar = Math.floor(2 + params.density * 6);

  for (let bar = 0; bar < bars; bar++) {
    let currentDegree = rng.nextInt(0, 4);
    const barNotes: { step: number; degree: number }[] = [];

    // Generate note positions
    for (let i = 0; i < notesPerBar; i++) {
      const step = Math.floor((i / notesPerBar) * stepsPerBar);

      // Apply contour
      let degreeOffset = 0;
      const progress = i / notesPerBar;

      switch (contour) {
        case 'ascending':
          degreeOffset = Math.floor(progress * 4);
          break;
        case 'descending':
          degreeOffset = Math.floor((1 - progress) * 4);
          break;
        case 'arch':
          degreeOffset = Math.floor(Math.sin(progress * Math.PI) * 4);
          break;
        case 'flat':
          degreeOffset = 0;
          break;
      }

      // Add some randomness based on complexity
      if (params.complexity > 0.3) {
        degreeOffset += rng.nextInt(-2, 2);
      }

      barNotes.push({ step, degree: currentDegree + degreeOffset });
    }

    // Create notes
    for (let i = 0; i < barNotes.length; i++) {
      const { step, degree } = barNotes[i];
      const nextStep = barNotes[i + 1]?.step ?? stepsPerBar;

      const time = `${bar}:0:${step * 0.25}`;
      const pitch = getNoteInScale(key, scale, degree, octave);

      // Calculate duration
      const gapSteps = nextStep - step;
      let duration = '8n';
      if (gapSteps >= 8) duration = '4n';
      if (gapSteps >= 4 && gapSteps < 8) duration = '8n';
      if (gapSteps < 4) duration = '16n';

      notes.push({
        pitch,
        time,
        duration,
        velocity: 0.7 + rng.next() * 0.2,
      });
    }
  }

  return notes;
}
```

**Step 2: Commit**

```bash
git add src/lib/generators/lead.ts
git commit -m "Add lead melody generator"
```

---

### Task 5.6: Create Pad Generator

**Files:**
- Create: `src/lib/generators/pad.ts`

**Step 1: Create pad generator**

Create `src/lib/generators/pad.ts`:
```typescript
import type { Note, GenerationParams } from '../types';
import { SeededRandom, getChordNotes } from './theory';

export function generatePad(
  params: GenerationParams,
  key: string,
  scale: string,
  seed: number,
  bars = 2
): Note[] {
  const rng = new SeededRandom(seed);
  const notes: Note[] = [];
  const octave = 4;

  // Pads are typically sustained chords
  // Change chord every bar or every 2 bars
  const changeEvery = params.complexity > 0.5 ? 1 : 2;

  const progression = [0, 3, 4, 0];

  for (let bar = 0; bar < bars; bar += changeEvery) {
    const degree = progression[(bar / changeEvery) % progression.length];
    const chordNotes = getChordNotes(key, scale, degree, octave);

    const time = `${bar}:0:0`;
    const duration = changeEvery === 1 ? '1m' : '2m';

    // Add chord notes with slight timing offset for richness
    for (let i = 0; i < chordNotes.length; i++) {
      const offset = params.complexity > 0.3 ? i * 0.01 : 0;
      notes.push({
        pitch: chordNotes[i],
        time: bar === 0 && i === 0 ? time : `${bar}:0:${offset}`,
        duration,
        velocity: 0.4 + rng.next() * 0.1,
      });
    }

    // Add higher octave for airiness based on density
    if (params.density > 0.6) {
      const highNote = chordNotes[0].replace(/\d/, (d) => String(parseInt(d) + 1));
      notes.push({
        pitch: highNote,
        time,
        duration,
        velocity: 0.3,
      });
    }
  }

  return notes;
}
```

**Step 2: Commit**

```bash
git add src/lib/generators/pad.ts
git commit -m "Add pad generator"
```

---

### Task 5.7: Create Main Generator with Genre Presets

**Files:**
- Create: `src/lib/generators/index.ts`

**Step 1: Create main generator module**

Create `src/lib/generators/index.ts`:
```typescript
import type { Loop, InstrumentType, GenerationParams, GenrePreset } from '../types';
import { generateDrumPattern } from './drums';
import { generateBassLine } from './bass';
import { generateChords } from './chords';
import { generateLead } from './lead';
import { generatePad } from './pad';

export { SeededRandom } from './theory';

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

export function generateLoop(
  type: InstrumentType,
  params: GenerationParams,
  key: string,
  scale: string,
  seed?: number,
  bars = 2
): Loop {
  const actualSeed = seed ?? Math.floor(Math.random() * 1000000);

  let notes;
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
  const types: InstrumentType[] = ['drums', 'percussion', 'bass', 'keys', 'lead', 'pad'];

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

**Step 2: Commit**

```bash
git add src/lib/generators
git commit -m "Add main generator with genre presets"
```

---

## Phase 6: UI Components

### Task 6.1: Create Base App Layout

**Files:**
- Modify: `src/App.svelte`
- Create: `src/components/Header.svelte`

**Step 1: Create Header component**

Create `src/components/Header.svelte`:
```svelte
<script lang="ts">
  import { project, bpm, musicalKey, scale } from '../lib/stores';
  import { transport } from '../lib/audio';
  import type { GenrePreset, ScaleType } from '../lib/types';
  import { GENRE_PRESETS, getGenreBpm } from '../lib/generators';

  const genres: GenrePreset[] = ['lofi-hiphop', 'edm-house', 'rock', 'ambient', 'funk', 'pop'];
  const scales: ScaleType[] = ['major', 'minor', 'dorian', 'mixolydian', 'pentatonic'];
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  let selectedGenre: GenrePreset = 'lofi-hiphop';

  function handleGenreChange() {
    const newBpm = getGenreBpm(selectedGenre);
    project.setBpm(newBpm);
    transport.setBpm(newBpm);
  }

  function handleBpmChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    project.setBpm(value);
    transport.setBpm(value);
  }
</script>

<header>
  <div class="left">
    <h1>Music Maker</h1>
  </div>

  <div class="center">
    <label>
      Genre:
      <select bind:value={selectedGenre} on:change={handleGenreChange}>
        {#each genres as genre}
          <option value={genre}>{GENRE_PRESETS[genre].name}</option>
        {/each}
      </select>
    </label>

    <label>
      Key:
      <select value={$musicalKey} on:change={(e) => project.setKey(e.currentTarget.value)}>
        {#each keys as key}
          <option value={key}>{key}</option>
        {/each}
      </select>
    </label>

    <label>
      Scale:
      <select value={$scale} on:change={(e) => project.setScale(e.currentTarget.value as ScaleType)}>
        {#each scales as s}
          <option value={s}>{s}</option>
        {/each}
      </select>
    </label>

    <label>
      BPM:
      <input
        type="range"
        min="60"
        max="180"
        value={$bpm}
        on:input={handleBpmChange}
      />
      <span>{$bpm}</span>
    </label>
  </div>

  <div class="right">
    <button on:click={() => {}}>Settings</button>
  </div>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: #1a1a2e;
    border-bottom: 1px solid #333;
  }

  h1 {
    font-size: 1.25rem;
    margin: 0;
    color: #fff;
  }

  .center {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ccc;
    font-size: 0.875rem;
  }

  select, input[type="range"] {
    background: #2a2a4e;
    border: 1px solid #444;
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  button {
    background: #3a3a5e;
    border: 1px solid #555;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #4a4a6e;
  }

  .left, .right {
    flex: 1;
  }

  .right {
    text-align: right;
  }
</style>
```

**Step 2: Update App.svelte**

Replace contents of `src/App.svelte`:
```svelte
<script lang="ts">
  import Header from './components/Header.svelte';
</script>

<main>
  <Header />
  <div class="content">
    <!-- Grid will go here -->
    <p style="color: #ccc; text-align: center; padding: 2rem;">Loop Grid Coming Soon</p>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f0f1a;
    color: #fff;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .content {
    flex: 1;
    padding: 1rem;
  }
</style>
```

**Step 3: Verify it runs**

```bash
npm run dev
```

Expected: Shows header with controls and placeholder content

**Step 4: Commit**

```bash
git add src/App.svelte src/components/Header.svelte
git commit -m "Add base app layout with header"
```

---

### Task 6.2: Create Grid Cell Component

**Files:**
- Create: `src/components/GridCell.svelte`

**Step 1: Create GridCell component**

Create `src/components/GridCell.svelte`:
```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { LoopState } from '../lib/types';

  export let hasLoop: boolean = false;
  export let state: LoopState = 'inactive';
  export let instrumentColor: string = '#3a3a5e';

  const dispatch = createEventDispatcher<{
    tap: void;
    doubletap: void;
    contextmenu: void;
  }>();

  let lastTap = 0;
  const DOUBLE_TAP_DELAY = 300;

  function handleClick() {
    const now = Date.now();
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      dispatch('doubletap');
      lastTap = 0;
    } else {
      lastTap = now;
      setTimeout(() => {
        if (lastTap !== 0 && Date.now() - lastTap >= DOUBLE_TAP_DELAY) {
          dispatch('tap');
          lastTap = 0;
        }
      }, DOUBLE_TAP_DELAY);
    }
  }

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    dispatch('contextmenu');
  }
</script>

<button
  class="cell"
  class:has-loop={hasLoop}
  class:active={state === 'active'}
  class:queued={state === 'queued'}
  class:stopping={state === 'stopping'}
  style="--instrument-color: {instrumentColor}"
  on:click={handleClick}
  on:contextmenu={handleContextMenu}
>
  {#if hasLoop}
    <span class="indicator"></span>
  {/if}
</button>

<style>
  .cell {
    width: 100%;
    aspect-ratio: 1;
    background: var(--instrument-color);
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cell:hover {
    filter: brightness(1.2);
  }

  .cell.has-loop {
    border-color: rgba(255, 255, 255, 0.3);
  }

  .cell.active {
    border-color: #4ade80;
    box-shadow: 0 0 12px rgba(74, 222, 128, 0.4);
    animation: pulse 0.5s ease-in-out infinite;
  }

  .cell.queued {
    border-color: #fbbf24;
    animation: blink 0.5s ease-in-out infinite;
  }

  .cell.stopping {
    border-color: #f87171;
    opacity: 0.7;
  }

  .indicator {
    width: 12px;
    height: 12px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
  }

  .active .indicator {
    background: #4ade80;
  }

  .queued .indicator {
    background: #fbbf24;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
</style>
```

**Step 2: Commit**

```bash
git add src/components/GridCell.svelte
git commit -m "Add grid cell component"
```

---

### Task 6.3: Create Track Row Component

**Files:**
- Create: `src/components/TrackRow.svelte`

**Step 1: Create TrackRow component**

Create `src/components/TrackRow.svelte`:
```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Track, LoopState } from '../lib/types';
  import GridCell from './GridCell.svelte';

  export let track: Track;
  export let cellStates: Map<number, LoopState>;
  export let loops: Record<string, any>;

  const dispatch = createEventDispatcher<{
    cellTap: { trackId: string; col: number };
    cellDoubleTap: { trackId: string; col: number };
    cellContextMenu: { trackId: string; col: number };
    mute: { trackId: string };
    solo: { trackId: string };
  }>();

  const INSTRUMENT_COLORS: Record<string, string> = {
    drums: '#e11d48',
    percussion: '#db2777',
    bass: '#7c3aed',
    keys: '#2563eb',
    lead: '#0891b2',
    pad: '#059669',
  };

  function getCellState(col: number): LoopState {
    return cellStates.get(col) ?? 'inactive';
  }

  function hasLoop(col: number): boolean {
    const loopId = track.cells.find(c => c.col === col)?.loopId;
    return loopId != null && loops[loopId] != null;
  }
</script>

<div class="track-row">
  <div class="track-header">
    <span class="track-name">{track.name}</span>
    <div class="track-controls">
      <button
        class="mute-btn"
        class:active={track.muted}
        on:click={() => dispatch('mute', { trackId: track.id })}
      >
        M
      </button>
      <button
        class="solo-btn"
        class:active={track.solo}
        on:click={() => dispatch('solo', { trackId: track.id })}
      >
        S
      </button>
    </div>
  </div>

  <div class="cells">
    {#each track.cells as cell (cell.col)}
      <GridCell
        hasLoop={hasLoop(cell.col)}
        state={getCellState(cell.col)}
        instrumentColor={INSTRUMENT_COLORS[track.type] ?? '#3a3a5e'}
        on:tap={() => dispatch('cellTap', { trackId: track.id, col: cell.col })}
        on:doubletap={() => dispatch('cellDoubleTap', { trackId: track.id, col: cell.col })}
        on:contextmenu={() => dispatch('cellContextMenu', { trackId: track.id, col: cell.col })}
      />
    {/each}
  </div>
</div>

<style>
  .track-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .track-header {
    width: 120px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .track-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #ccc;
  }

  .track-controls {
    display: flex;
    gap: 0.25rem;
  }

  .mute-btn, .solo-btn {
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

  .mute-btn:hover, .solo-btn:hover {
    background: #3a3a5e;
  }

  .mute-btn.active {
    background: #dc2626;
    color: #fff;
    border-color: #dc2626;
  }

  .solo-btn.active {
    background: #eab308;
    color: #000;
    border-color: #eab308;
  }

  .cells {
    display: flex;
    gap: 0.5rem;
    flex: 1;
  }

  .cells :global(.cell) {
    flex: 1;
    max-width: 80px;
  }
</style>
```

**Step 2: Commit**

```bash
git add src/components/TrackRow.svelte
git commit -m "Add track row component"
```

---

### Task 6.4: Create Loop Grid Component

**Files:**
- Create: `src/components/LoopGrid.svelte`

**Step 1: Create LoopGrid component**

Create `src/components/LoopGrid.svelte`:
```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { project, tracks, loops, playback, isPlaying } from '../lib/stores';
  import { initAudio, transport, instrumentManager, loopScheduler } from '../lib/audio';
  import { generateLoop, GENRE_PRESETS } from '../lib/generators';
  import type { Track, LoopState, GenrePreset } from '../lib/types';
  import TrackRow from './TrackRow.svelte';

  let audioInitialized = false;
  let cellStates: Map<string, Map<number, LoopState>> = new Map();

  // Initialize cell states for each track
  $: {
    for (const track of $tracks) {
      if (!cellStates.has(track.id)) {
        cellStates.set(track.id, new Map());
      }
    }
  }

  function getCellStatesForTrack(trackId: string): Map<number, LoopState> {
    return cellStates.get(trackId) ?? new Map();
  }

  async function ensureAudio() {
    if (!audioInitialized) {
      await initAudio();
      audioInitialized = true;

      // Initialize instruments for all tracks
      for (const track of $tracks) {
        instrumentManager.createTrackInstrument(track.id, track.type);
        instrumentManager.setTrackVolume(track.id, track.volume);
        instrumentManager.setTrackMute(track.id, track.muted);
      }
    }
  }

  async function handleCellTap(e: CustomEvent<{ trackId: string; col: number }>) {
    await ensureAudio();

    const { trackId, col } = e.detail;
    const track = $tracks.find(t => t.id === trackId);
    if (!track) return;

    const cell = track.cells.find(c => c.col === col);
    const loopId = cell?.loopId;
    const loop = loopId ? $loops[loopId] : null;

    const trackCellStates = cellStates.get(trackId) ?? new Map();
    const currentState = trackCellStates.get(col) ?? 'inactive';

    if (currentState === 'active') {
      // Stop immediately
      loopScheduler.stopLoop(trackId);
      trackCellStates.set(col, 'inactive');
    } else {
      // Generate loop if needed
      let actualLoop = loop;
      if (!actualLoop) {
        const projectData = project.getSnapshot();
        actualLoop = generateLoop(
          track.type,
          GENRE_PRESETS['lofi-hiphop'].defaultParams,
          projectData.key,
          projectData.scale
        );
        project.addLoop(actualLoop);
        project.setCellLoop(trackId, col, actualLoop.id);
      }

      // Clear other cells in this track
      for (const [c, state] of trackCellStates) {
        if (c !== col && state === 'active') {
          trackCellStates.set(c, 'inactive');
        }
      }

      // Start playing
      loopScheduler.scheduleLoop(trackId, actualLoop);
      trackCellStates.set(col, 'active');

      if (!$isPlaying) {
        transport.start();
        playback.setTransportState('started');
      }
    }

    cellStates.set(trackId, trackCellStates);
    cellStates = cellStates; // trigger reactivity
  }

  async function handleCellDoubleTap(e: CustomEvent<{ trackId: string; col: number }>) {
    await ensureAudio();

    const { trackId, col } = e.detail;
    const track = $tracks.find(t => t.id === trackId);
    if (!track) return;

    const trackCellStates = cellStates.get(trackId) ?? new Map();
    const currentState = trackCellStates.get(col) ?? 'inactive';

    if (currentState === 'active') {
      // Stop at end of loop
      loopScheduler.stopLoopAtEnd(trackId);
      trackCellStates.set(col, 'stopping');
      // Will be set to inactive when loop actually stops
    } else {
      // Queue to play
      const cell = track.cells.find(c => c.col === col);
      let loopId = cell?.loopId;
      let loop = loopId ? $loops[loopId] : null;

      if (!loop) {
        const projectData = project.getSnapshot();
        loop = generateLoop(
          track.type,
          GENRE_PRESETS['lofi-hiphop'].defaultParams,
          projectData.key,
          projectData.scale
        );
        project.addLoop(loop);
        project.setCellLoop(trackId, col, loop.id);
      }

      loopScheduler.queueLoop(trackId, loop);
      trackCellStates.set(col, 'queued');
    }

    cellStates.set(trackId, trackCellStates);
    cellStates = cellStates;
  }

  function handleCellContextMenu(e: CustomEvent<{ trackId: string; col: number }>) {
    // TODO: Show context menu for edit/regenerate/clear
    console.log('Context menu:', e.detail);
  }

  function handleMute(e: CustomEvent<{ trackId: string }>) {
    const track = $tracks.find(t => t.id === e.detail.trackId);
    if (track) {
      const newMuted = !track.muted;
      project.setTrackMute(e.detail.trackId, newMuted);
      instrumentManager.setTrackMute(e.detail.trackId, newMuted);
    }
  }

  function handleSolo(e: CustomEvent<{ trackId: string }>) {
    const track = $tracks.find(t => t.id === e.detail.trackId);
    if (track) {
      project.setTrackSolo(e.detail.trackId, !track.solo);
      // TODO: Implement solo logic (mute others)
    }
  }

  onDestroy(() => {
    loopScheduler.stopAll();
    transport.stop();
  });
</script>

<div class="loop-grid">
  {#each $tracks as track (track.id)}
    <TrackRow
      {track}
      cellStates={getCellStatesForTrack(track.id)}
      loops={$loops}
      on:cellTap={handleCellTap}
      on:cellDoubleTap={handleCellDoubleTap}
      on:cellContextMenu={handleCellContextMenu}
      on:mute={handleMute}
      on:solo={handleSolo}
    />
  {/each}
</div>

<style>
  .loop-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }
</style>
```

**Step 2: Update App.svelte to include grid**

Replace `src/App.svelte` content:
```svelte
<script lang="ts">
  import Header from './components/Header.svelte';
  import LoopGrid from './components/LoopGrid.svelte';
</script>

<main>
  <Header />
  <div class="content">
    <LoopGrid />
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f0f1a;
    color: #fff;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .content {
    flex: 1;
    padding: 1rem;
  }
</style>
```

**Step 3: Verify it runs**

```bash
npm run dev
```

Expected: Shows grid with 6 rows × 4 columns, cells are clickable

**Step 4: Commit**

```bash
git add src/components/LoopGrid.svelte src/App.svelte
git commit -m "Add loop grid component with cell interactions"
```

---

### Task 6.5: Create Transport Controls Component

**Files:**
- Create: `src/components/Transport.svelte`

**Step 1: Create Transport component**

Create `src/components/Transport.svelte`:
```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { playback, isPlaying } from '../lib/stores';
  import { transport, initAudio } from '../lib/audio';

  let position = '0:0:0';
  let animationFrame: number;

  function updatePosition() {
    position = transport.getPosition();
    animationFrame = requestAnimationFrame(updatePosition);
  }

  async function handlePlayPause() {
    await initAudio();
    transport.toggle();
    playback.setTransportState(transport.getState());
  }

  function handleStop() {
    transport.stop();
    playback.reset();
  }

  onMount(() => {
    animationFrame = requestAnimationFrame(updatePosition);
  });

  onDestroy(() => {
    cancelAnimationFrame(animationFrame);
  });
</script>

<div class="transport">
  <button class="transport-btn" on:click={handlePlayPause}>
    {#if $isPlaying}
      <span class="icon">⏸</span>
    {:else}
      <span class="icon">▶</span>
    {/if}
  </button>

  <button class="transport-btn" on:click={handleStop}>
    <span class="icon">⏹</span>
  </button>

  <div class="position">
    {position}
  </div>
</div>

<style>
  .transport {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    background: #1a1a2e;
    border-top: 1px solid #333;
  }

  .transport-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid #555;
    background: #2a2a4e;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .transport-btn:hover {
    background: #3a3a5e;
    border-color: #666;
  }

  .icon {
    font-size: 1.25rem;
  }

  .position {
    font-family: monospace;
    font-size: 1rem;
    color: #888;
    min-width: 100px;
    text-align: center;
  }
</style>
```

**Step 2: Add Transport to App**

Update `src/App.svelte`:
```svelte
<script lang="ts">
  import Header from './components/Header.svelte';
  import LoopGrid from './components/LoopGrid.svelte';
  import Transport from './components/Transport.svelte';
</script>

<main>
  <Header />
  <div class="content">
    <LoopGrid />
  </div>
  <Transport />
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f0f1a;
    color: #fff;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
  }
</style>
```

**Step 3: Commit**

```bash
git add src/components/Transport.svelte src/App.svelte
git commit -m "Add transport controls"
```

---

## Phase 7: Storage & PWA (Summary)

### Task 7.1: IndexedDB Storage

- Create `src/lib/storage/db.ts` with idb wrapper
- Implement project save/load
- Implement loop library storage
- Add auto-save on project changes

### Task 7.2: JSON Export/Import

- Add export button to settings
- Create download JSON functionality
- Add import file picker
- Validate and load imported projects

### Task 7.3: Service Worker Setup

- Install Workbox: `npm install -D vite-plugin-pwa`
- Configure PWA in `vite.config.ts`
- Create manifest.json
- Add offline indicator

---

## Phase 8: Loop Editor (Summary)

### Task 8.1: Step Sequencer

- Create `src/components/StepSequencer.svelte`
- Grid for drum hits (rows: sounds, cols: steps)
- Velocity control per step
- Playhead animation

### Task 8.2: Piano Roll

- Create `src/components/PianoRoll.svelte`
- Vertical keyboard display
- Drag to create/resize notes
- Note velocity editing

### Task 8.3: Generation Controls

- Create `src/components/GenerationPanel.svelte`
- Density/complexity sliders
- Style selectors
- Generate button with preview

### Task 8.4: Editor Modal

- Create `src/components/LoopEditor.svelte`
- Modal overlay
- Switch between step/piano views
- Save to cell / Save to library

---

## Phase 9: Mixer & Effects (Summary)

### Task 9.1: Channel Strip

- Create `src/components/ChannelStrip.svelte`
- Volume fader with meter
- Pan knob
- Effect chain slots

### Task 9.2: Effect Components

- Create effect wrapper component
- Implement each effect (reverb, delay, filter, etc.)
- Bypass toggle
- Preset system

### Task 9.3: Mixer Panel

- Create `src/components/MixerPanel.svelte`
- Slide-out from right
- All channel strips
- Master channel

---

## Execution Notes

This plan covers the core MVP. Phases 7-9 are summarized since the detailed steps follow the same patterns established in Phases 1-6.

**Priority order for MVP:**
1. Phases 1-6 (fully detailed above) - Working loop grid with generation
2. Phase 7.3 - PWA/offline (critical for use case)
3. Phase 8 - Loop editor (enables customization)
4. Phase 9 - Mixer (polish)
5. Phase 7.1-7.2 - Storage (save/load)

**Test the MVP after Phase 6:**
- Can tap cells to generate and play loops
- Loops stay in sync
- Single/double tap behavior works
- Mute/solo functional
- Transport controls work

---

## Files Created Summary

```
src/
├── lib/
│   ├── audio/
│   │   ├── context.ts
│   │   ├── instrumentManager.ts
│   │   ├── loopScheduler.ts
│   │   ├── transport.ts
│   │   ├── instruments/
│   │   │   ├── drums.ts
│   │   │   └── melodic.ts
│   │   └── index.ts
│   ├── generators/
│   │   ├── theory.ts
│   │   ├── drums.ts
│   │   ├── bass.ts
│   │   ├── chords.ts
│   │   ├── lead.ts
│   │   ├── pad.ts
│   │   └── index.ts
│   ├── stores/
│   │   ├── project.ts
│   │   ├── playback.ts
│   │   └── index.ts
│   └── types/
│       ├── music.ts
│       └── index.ts
├── components/
│   ├── Header.svelte
│   ├── GridCell.svelte
│   ├── TrackRow.svelte
│   ├── LoopGrid.svelte
│   └── Transport.svelte
├── App.svelte
└── main.ts
```
