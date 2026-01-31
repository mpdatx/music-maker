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
  };
}

export const progressionStore = createProgressionStore();

// Derived stores for convenience
export const currentProgression = derived(progressionStore, $s => $s.currentProgression);
export const currentChordIndex = derived(progressionStore, $s => $s.currentChordIndex);
export const progressionsForCurrentGenre = derived(
  progressionStore,
  $s => getProgressionsForGenre($s.currentProgression.genre)
);
