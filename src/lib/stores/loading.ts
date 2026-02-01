import { writable, derived, get } from 'svelte/store';
import type { SampledInstrumentType } from '../audio/instruments/samplers';

interface LoadingState {
  isLoading: boolean;
  message: string;
  progress: number; // 0-100
  loadingInstruments: Set<SampledInstrumentType>;
  totalToLoad: number;
  loaded: number;
}

function createLoadingStore() {
  const { subscribe, set, update } = writable<LoadingState>({
    isLoading: false,
    message: '',
    progress: 0,
    loadingInstruments: new Set(),
    totalToLoad: 0,
    loaded: 0,
  });

  return {
    subscribe,

    startLoading(message: string, instruments: SampledInstrumentType[]) {
      update(state => ({
        ...state,
        isLoading: true,
        message,
        progress: 0,
        loadingInstruments: new Set(instruments),
        totalToLoad: instruments.length,
        loaded: 0,
      }));
    },

    instrumentLoaded(instrument: SampledInstrumentType) {
      update(state => {
        const newLoading = new Set(state.loadingInstruments);
        newLoading.delete(instrument);
        const loaded = state.loaded + 1;
        const progress = state.totalToLoad > 0
          ? Math.round((loaded / state.totalToLoad) * 100)
          : 100;

        return {
          ...state,
          loadingInstruments: newLoading,
          loaded,
          progress,
          isLoading: newLoading.size > 0,
        };
      });
    },

    finishLoading() {
      update(state => ({
        ...state,
        isLoading: false,
        message: '',
        progress: 100,
        loadingInstruments: new Set(),
      }));
    },

    setMessage(message: string) {
      update(state => ({ ...state, message }));
    },

    getState(): LoadingState {
      return get({ subscribe });
    },

    reset() {
      set({
        isLoading: false,
        message: '',
        progress: 0,
        loadingInstruments: new Set(),
        totalToLoad: 0,
        loaded: 0,
      });
    },
  };
}

export const loadingStore = createLoadingStore();

// Derived store for simple isLoading check
export const isLoading = derived(loadingStore, $state => $state.isLoading);
export const loadingProgress = derived(loadingStore, $state => $state.progress);
export const loadingMessage = derived(loadingStore, $state => $state.message);
