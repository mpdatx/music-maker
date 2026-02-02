import { writable, derived, get } from 'svelte/store';
import type { Project, Track, Loop, InstrumentType, CounterMelodyTechnique } from '../types';
import { generateLoop, GENRE_PRESETS, getGenreTracks } from '../generators';
import type { GenrePreset } from '../genres';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Re-export for backwards compatibility - tracks are now in src/lib/genres.ts
import { GENRES, getGenreConfig } from '../genres';
export const GENRE_TRACKS = Object.fromEntries(
  Object.entries(GENRES).map(([key, val]) => [key, val.tracks])
) as Record<GenrePreset, Array<{ type: InstrumentType; name: string }>>;

function createDefaultProject(): Project {
  const colCount = 8;
  const genre: GenrePreset = 'lofi-hiphop';
  const genreConfig = GENRE_PRESETS[genre];
  const key = genreConfig.key;
  const scale = genreConfig.scale;
  const loops: Record<string, Loop> = {};
  const params = genreConfig.defaultParams;

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

    // Rebuild tracks for a new genre with appropriate instruments, key, and scale
    rebuildTracksForGenre: (genre: GenrePreset) => update(p => {
      const genreConfig = GENRE_PRESETS[genre];
      const { key, scale, defaultParams: params } = genreConfig;
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

      return { ...p, genre, key, scale, tracks, loops, updatedAt: Date.now() };
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

    setTrackCounterMelody: (trackId: string, enabled: boolean, technique?: CounterMelodyTechnique) => update(p => {
      const genreConfig = getGenreConfig(p.genre);
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
