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
