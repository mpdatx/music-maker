import { writable, derived } from 'svelte/store';
import type { LoopState, TransportState, PlayMode, PadConfig, InstrumentType } from '../types';

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

// Play mode store
export const playMode = writable<PlayMode>('loop');

// Pad configuration store
function createPadConfigStore() {
  const { subscribe, set, update } = writable<PadConfig>({
    instrument: 'keys',
    rows: 4,
    cols: 7, // Will be overridden by scale length
    baseOctave: 2,
  });

  return {
    subscribe,
    setInstrument: (instrument: Exclude<InstrumentType, 'drums' | 'percussion'>) =>
      update(c => ({ ...c, instrument })),
    setBaseOctave: (baseOctave: number) =>
      update(c => ({ ...c, baseOctave })),
    reset: () => set({ instrument: 'keys', rows: 8, cols: 8, baseOctave: 3 }),
  };
}

export const padConfig = createPadConfigStore();

// Global staff view toggle
export const globalStaffView = writable(false);
