import { writable, derived, get } from 'svelte/store';
import type { Project, Track, Loop, InstrumentType, GenrePreset } from '../types';
import { generateLoop, GENRE_PRESETS } from '../generators';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Genre-specific track configurations with sampled instruments where appropriate
export const GENRE_TRACKS: Record<GenrePreset, Array<{ type: InstrumentType; name: string }>> = {
  'lofi-hiphop': [
    { type: 'drums', name: 'Drums' },
    { type: 'piano', name: 'Piano' },
    { type: 'bass-electric', name: 'Bass' },
    { type: 'guitar-acoustic', name: 'Guitar' },
    { type: 'pad', name: 'Pad' },
    { type: 'pluck', name: 'Pluck' },
    { type: 'violin', name: 'Violin' },
  ],
  'edm-house': [
    { type: 'drums', name: 'Drums' },
    { type: 'percussion', name: 'Percussion' },
    { type: 'bass', name: 'Bass' },
    { type: 'keys', name: 'Keys' },
    { type: 'lead', name: 'Lead' },
    { type: 'pad', name: 'Pad' },
    { type: 'pluck', name: 'Pluck' },
  ],
  'rock': [
    { type: 'drums', name: 'Drums' },
    { type: 'bass-electric', name: 'Bass' },
    { type: 'guitar-electric', name: 'Lead Guitar' },
    { type: 'guitar-acoustic', name: 'Rhythm Guitar' },
    { type: 'piano', name: 'Piano' },
    { type: 'organ-sampled', name: 'Organ' },
  ],
  'ambient': [
    { type: 'drums', name: 'Drums' },
    { type: 'piano', name: 'Piano' },
    { type: 'pad', name: 'Pad' },
    { type: 'violin', name: 'Violin' },
    { type: 'cello', name: 'Cello' },
    { type: 'harp', name: 'Harp' },
    { type: 'flute', name: 'Flute' },
  ],
  'funk': [
    { type: 'drums', name: 'Drums' },
    { type: 'percussion', name: 'Percussion' },
    { type: 'bass-electric', name: 'Bass' },
    { type: 'guitar-electric', name: 'Guitar' },
    { type: 'organ-sampled', name: 'Organ' },
    { type: 'trumpet', name: 'Trumpet' },
    { type: 'saxophone', name: 'Sax' },
  ],
  'pop': [
    { type: 'drums', name: 'Drums' },
    { type: 'bass-electric', name: 'Bass' },
    { type: 'piano', name: 'Piano' },
    { type: 'guitar-acoustic', name: 'Guitar' },
    { type: 'strings', name: 'Strings' },
    { type: 'pad', name: 'Pad' },
  ],
};

function createDefaultProject(): Project {
  const colCount = 8;
  const key = 'C';
  const scale: Project['scale'] = 'minor';
  const genre: GenrePreset = 'lofi-hiphop';
  const loops: Record<string, Loop> = {};
  const params = GENRE_PRESETS[genre].defaultParams;

  const trackDefs = GENRE_TRACKS[genre];

  const tracks: Track[] = trackDefs.map(({ type, name }) => {
    const trackId = generateId();
    const cells = Array.from({ length: colCount }, (_, col) => {
      // Generate a unique loop for each cell
      const loop = generateLoop(type, params, key, scale);
      loops[loop.id] = loop;
      return { col, loopId: loop.id };
    });

    return {
      id: trackId,
      type,
      name,
      volume: 0.8,
      pan: 0,
      muted: false,
      solo: false,
      effects: [],
      cells,
    };
  });

  return {
    id: generateId(),
    name: 'New Project',
    bpm: 120,
    key,
    scale,
    genre,
    tracks,
    loops,
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

    setGenre: (genre: GenrePreset) => update(p => ({ ...p, genre, updatedAt: Date.now() })),

    // Rebuild tracks for a new genre with appropriate instruments
    rebuildTracksForGenre: (genre: GenrePreset, key: string, scale: Project['scale']) => update(p => {
      const params = GENRE_PRESETS[genre].defaultParams;
      const trackDefs = GENRE_TRACKS[genre];
      const colCount = p.tracks[0]?.cells.length ?? 8;
      const loops: Record<string, Loop> = {};

      const tracks: Track[] = trackDefs.map(({ type, name }) => {
        const trackId = generateId();
        const cells = Array.from({ length: colCount }, (_, col) => {
          const loop = generateLoop(type, params, key, scale);
          loops[loop.id] = loop;
          return { col, loopId: loop.id };
        });

        return {
          id: trackId,
          type,
          name,
          volume: 0.8,
          pan: 0,
          muted: false,
          solo: false,
          effects: [],
          cells,
        };
      });

      return { ...p, genre, tracks, loops, updatedAt: Date.now() };
    }),

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
export const genre = derived(project, $p => $p.genre);
