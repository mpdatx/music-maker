import * as Tone from 'tone';

// Sample URLs - uses Vite's base URL for proper path in production
const SAMPLE_BASE_URL = `${import.meta.env.BASE_URL}samples/`;

// Internal types matching the sample library folder names
type SampleLibraryInstrument =
  | 'piano'
  | 'guitar-acoustic'
  | 'guitar-electric'
  | 'bass-electric'
  | 'violin'
  | 'cello'
  | 'contrabass'
  | 'harp'
  | 'trumpet'
  | 'trombone'
  | 'french-horn'
  | 'tuba'
  | 'saxophone'
  | 'flute'
  | 'clarinet'
  | 'bassoon'
  | 'organ'
  | 'harmonium'
  | 'xylophone';

// Exported type includes 'organ-sampled' to avoid conflict with synth 'organ'
export type SampledInstrumentType =
  | 'piano'
  | 'guitar-acoustic'
  | 'guitar-electric'
  | 'bass-electric'
  | 'violin'
  | 'cello'
  | 'contrabass'
  | 'harp'
  | 'trumpet'
  | 'trombone'
  | 'french-horn'
  | 'tuba'
  | 'saxophone'
  | 'flute'
  | 'clarinet'
  | 'bassoon'
  | 'organ-sampled'
  | 'harmonium'
  | 'xylophone';

// Map from exported type to library folder name
function toLibraryName(type: SampledInstrumentType): SampleLibraryInstrument {
  if (type === 'organ-sampled') return 'organ';
  return type as SampleLibraryInstrument;
}

// Note mappings for each instrument (based on actual files in public/samples/)
const INSTRUMENT_SAMPLES: Record<SampleLibraryInstrument, Record<string, string>> = {
  'piano': {
    'C1': 'C1.mp3', 'C#1': 'Cs1.mp3', 'D1': 'D1.mp3', 'D#1': 'Ds1.mp3', 'E1': 'E1.mp3', 'F1': 'F1.mp3', 'F#1': 'Fs1.mp3', 'G1': 'G1.mp3', 'G#1': 'Gs1.mp3', 'A1': 'A1.mp3', 'A#1': 'As1.mp3', 'B1': 'B1.mp3',
    'C2': 'C2.mp3', 'C#2': 'Cs2.mp3', 'D2': 'D2.mp3', 'D#2': 'Ds2.mp3', 'E2': 'E2.mp3', 'F2': 'F2.mp3', 'F#2': 'Fs2.mp3', 'G2': 'G2.mp3', 'G#2': 'Gs2.mp3', 'A2': 'A2.mp3', 'A#2': 'As2.mp3', 'B2': 'B2.mp3',
    'C3': 'C3.mp3', 'C#3': 'Cs3.mp3', 'D3': 'D3.mp3', 'D#3': 'Ds3.mp3', 'E3': 'E3.mp3', 'F3': 'F3.mp3', 'F#3': 'Fs3.mp3', 'G3': 'G3.mp3', 'G#3': 'Gs3.mp3', 'A3': 'A3.mp3', 'A#3': 'As3.mp3', 'B3': 'B3.mp3',
    'C4': 'C4.mp3', 'C#4': 'Cs4.mp3', 'D4': 'D4.mp3', 'D#4': 'Ds4.mp3', 'E4': 'E4.mp3', 'F4': 'F4.mp3', 'F#4': 'Fs4.mp3', 'G4': 'G4.mp3', 'G#4': 'Gs4.mp3', 'A4': 'A4.mp3', 'A#4': 'As4.mp3', 'B4': 'B4.mp3',
    'C5': 'C5.mp3', 'C#5': 'Cs5.mp3', 'D5': 'D5.mp3', 'D#5': 'Ds5.mp3', 'E5': 'E5.mp3', 'F5': 'F5.mp3', 'F#5': 'Fs5.mp3', 'G5': 'G5.mp3', 'G#5': 'Gs5.mp3', 'A5': 'A5.mp3', 'A#5': 'As5.mp3', 'B5': 'B5.mp3',
    'C6': 'C6.mp3', 'C#6': 'Cs6.mp3', 'D6': 'D6.mp3', 'D#6': 'Ds6.mp3', 'E6': 'E6.mp3', 'F6': 'F6.mp3', 'F#6': 'Fs6.mp3', 'G6': 'G6.mp3', 'G#6': 'Gs6.mp3', 'A6': 'A6.mp3', 'A#6': 'As6.mp3', 'B6': 'B6.mp3',
    'C7': 'C7.mp3', 'C#7': 'Cs7.mp3', 'D7': 'D7.mp3', 'D#7': 'Ds7.mp3', 'E7': 'E7.mp3', 'F7': 'F7.mp3', 'F#7': 'Fs7.mp3', 'G7': 'G7.mp3', 'G#7': 'Gs7.mp3', 'A7': 'A7.mp3', 'A#7': 'As7.mp3', 'B7': 'B7.mp3',
    'C8': 'C8.mp3',
  },
  'guitar-acoustic': {
    'D2': 'D2.mp3', 'D#2': 'Ds2.mp3', 'E2': 'E2.mp3', 'F2': 'F2.mp3', 'F#2': 'Fs2.mp3', 'G2': 'G2.mp3', 'G#2': 'Gs2.mp3', 'A2': 'A2.mp3', 'A#2': 'As2.mp3', 'B2': 'B2.mp3',
    'C3': 'C3.mp3', 'C#3': 'Cs3.mp3', 'D3': 'D3.mp3', 'D#3': 'Ds3.mp3', 'E3': 'E3.mp3', 'F3': 'F3.mp3', 'F#3': 'Fs3.mp3', 'G3': 'G3.mp3', 'G#3': 'Gs3.mp3', 'A3': 'A3.mp3', 'A#3': 'As3.mp3', 'B3': 'B3.mp3',
    'C4': 'C4.mp3', 'C#4': 'Cs4.mp3', 'D4': 'D4.mp3', 'D#4': 'Ds4.mp3', 'E4': 'E4.mp3', 'F4': 'F4.mp3', 'F#4': 'Fs4.mp3', 'G4': 'G4.mp3', 'G#4': 'Gs4.mp3', 'A4': 'A4.mp3', 'A#4': 'As4.mp3', 'B4': 'B4.mp3',
    'C5': 'C5.mp3', 'C#5': 'Cs5.mp3', 'D5': 'D5.mp3',
  },
  'guitar-electric': {
    'C#2': 'Cs2.mp3', 'E2': 'E2.mp3', 'F#2': 'Fs2.mp3', 'A2': 'A2.mp3',
    'C3': 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', 'A3': 'A3.mp3',
    'C4': 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', 'A4': 'A4.mp3',
    'C5': 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', 'A5': 'A5.mp3',
    'C6': 'C6.mp3',
  },
  'bass-electric': {
    'C#1': 'Cs1.mp3', 'E1': 'E1.mp3', 'G1': 'G1.mp3', 'A#1': 'As1.mp3',
    'C#2': 'Cs2.mp3', 'E2': 'E2.mp3', 'G2': 'G2.mp3', 'A#2': 'As2.mp3',
    'C#3': 'Cs3.mp3', 'E3': 'E3.mp3', 'G3': 'G3.mp3', 'A#3': 'As3.mp3',
    'C#4': 'Cs4.mp3', 'E4': 'E4.mp3', 'G4': 'G4.mp3', 'A#4': 'As4.mp3',
    'C#5': 'Cs5.mp3',
  },
  'violin': {
    'G3': 'G3.mp3', 'A3': 'A3.mp3',
    'C4': 'C4.mp3', 'E4': 'E4.mp3', 'G4': 'G4.mp3', 'A4': 'A4.mp3',
    'C5': 'C5.mp3', 'E5': 'E5.mp3', 'G5': 'G5.mp3', 'A5': 'A5.mp3',
    'C6': 'C6.mp3', 'E6': 'E6.mp3', 'G6': 'G6.mp3', 'A6': 'A6.mp3',
    'C7': 'C7.mp3',
  },
  'cello': {
    'C2': 'C2.mp3', 'D2': 'D2.mp3', 'D#2': 'Ds2.mp3', 'E2': 'E2.mp3', 'F2': 'F2.mp3', 'G2': 'G2.mp3', 'G#2': 'Gs2.mp3', 'A2': 'A2.mp3', 'A#2': 'As2.mp3', 'B2': 'B2.mp3',
    'C3': 'C3.mp3', 'C#3': 'Cs3.mp3', 'D3': 'D3.mp3', 'D#3': 'Ds3.mp3', 'E3': 'E3.mp3', 'F3': 'F3.mp3', 'F#3': 'Fs3.mp3', 'G3': 'G3.mp3', 'G#3': 'Gs3.mp3', 'A3': 'A3.mp3', 'A#3': 'As3.mp3', 'B3': 'B3.mp3',
    'C4': 'C4.mp3', 'C#4': 'Cs4.mp3', 'D4': 'D4.mp3', 'D#4': 'Ds4.mp3', 'E4': 'E4.mp3', 'F4': 'F4.mp3', 'F#4': 'Fs4.mp3', 'G4': 'G4.mp3', 'G#4': 'Gs4.mp3', 'A4': 'A4.mp3', 'B4': 'B4.mp3',
    'C5': 'C5.mp3',
  },
  'contrabass': {
    'F#1': 'Fs1.mp3', 'G1': 'G1.mp3', 'A#1': 'As1.mp3',
    'C2': 'C2.mp3', 'D2': 'D2.mp3', 'E2': 'E2.mp3', 'F#2': 'Fs2.mp3', 'G#2': 'Gs2.mp3', 'A2': 'A2.mp3',
    'C#3': 'Cs3.mp3', 'E3': 'E3.mp3', 'G#3': 'Gs3.mp3', 'B3': 'B3.mp3',
  },
  'harp': {
    'E1': 'E1.mp3', 'G1': 'G1.mp3', 'B1': 'B1.mp3',
    'D2': 'D2.mp3', 'F2': 'F2.mp3', 'A2': 'A2.mp3',
    'C3': 'C3.mp3', 'E3': 'E3.mp3', 'G3': 'G3.mp3', 'B3': 'B3.mp3',
    'D4': 'D4.mp3', 'F4': 'F4.mp3', 'A4': 'A4.mp3',
    'C5': 'C5.mp3', 'E5': 'E5.mp3', 'G5': 'G5.mp3', 'B5': 'B5.mp3',
    'D6': 'D6.mp3', 'F6': 'F6.mp3', 'A6': 'A6.mp3', 'B6': 'B6.mp3',
    'D7': 'D7.mp3', 'F7': 'F7.mp3',
  },
  'trumpet': {
    'F3': 'F3.mp3', 'A3': 'A3.mp3',
    'C4': 'C4.mp3', 'D#4': 'Ds4.mp3', 'F4': 'F4.mp3', 'G4': 'G4.mp3', 'A#4': 'As4.mp3',
    'D5': 'D5.mp3', 'F5': 'F5.mp3', 'A5': 'A5.mp3',
    'C6': 'C6.mp3',
  },
  'trombone': {
    'A#1': 'As1.mp3',
    'C#2': 'Cs2.mp3', 'D#2': 'Ds2.mp3', 'F2': 'F2.mp3', 'G#2': 'Gs2.mp3', 'A#2': 'As2.mp3',
    'C3': 'C3.mp3', 'D3': 'D3.mp3', 'D#3': 'Ds3.mp3', 'F3': 'F3.mp3', 'G#3': 'Gs3.mp3', 'A#3': 'As3.mp3',
    'C4': 'C4.mp3', 'C#4': 'Cs4.mp3', 'D4': 'D4.mp3', 'D#4': 'Ds4.mp3', 'F4': 'F4.mp3',
  },
  'french-horn': {
    'A1': 'A1.mp3',
    'C2': 'C2.mp3', 'D#2': 'Ds2.mp3', 'G2': 'G2.mp3',
    'D3': 'D3.mp3', 'F3': 'F3.mp3', 'A3': 'A3.mp3',
    'C4': 'C4.mp3',
    'D5': 'D5.mp3', 'F5': 'F5.mp3',
  },
  'tuba': {
    'F1': 'F1.mp3', 'A#1': 'As1.mp3',
    'D#2': 'Ds2.mp3', 'F2': 'F2.mp3', 'A#2': 'As2.mp3',
    'D3': 'D3.mp3', 'F3': 'F3.mp3', 'A#3': 'As3.mp3',
    'D4': 'D4.mp3',
  },
  'saxophone': {
    'C#3': 'Cs3.mp3', 'D3': 'D3.mp3', 'D#3': 'Ds3.mp3', 'E3': 'E3.mp3', 'F3': 'F3.mp3', 'F#3': 'Fs3.mp3', 'G3': 'G3.mp3', 'G#3': 'Gs3.mp3', 'A#3': 'As3.mp3', 'B3': 'B3.mp3',
    'C4': 'C4.mp3', 'C#4': 'Cs4.mp3', 'D4': 'D4.mp3', 'D#4': 'Ds4.mp3', 'E4': 'E4.mp3', 'F4': 'F4.mp3', 'F#4': 'Fs4.mp3', 'G4': 'G4.mp3', 'G#4': 'Gs4.mp3', 'A4': 'A4.mp3', 'A#4': 'As4.mp3', 'B4': 'B4.mp3',
    'C5': 'C5.mp3', 'C#5': 'Cs5.mp3', 'D5': 'D5.mp3', 'D#5': 'Ds5.mp3', 'E5': 'E5.mp3', 'F5': 'F5.mp3', 'F#5': 'Fs5.mp3', 'G5': 'G5.mp3', 'G#5': 'Gs5.mp3',
  },
  'flute': {
    'C4': 'C4.mp3', 'E4': 'E4.mp3', 'A4': 'A4.mp3',
    'C5': 'C5.mp3', 'E5': 'E5.mp3', 'A5': 'A5.mp3',
    'C6': 'C6.mp3', 'E6': 'E6.mp3', 'A6': 'A6.mp3',
    'C7': 'C7.mp3',
  },
  'clarinet': {
    'D3': 'D3.mp3', 'F3': 'F3.mp3', 'A#3': 'As3.mp3',
    'D4': 'D4.mp3', 'F4': 'F4.mp3', 'A#4': 'As4.mp3',
    'D5': 'D5.mp3', 'F5': 'F5.mp3', 'A#5': 'As5.mp3',
    'D6': 'D6.mp3', 'F#6': 'Fs6.mp3',
  },
  'bassoon': {
    'G2': 'G2.mp3', 'A2': 'A2.mp3',
    'C3': 'C3.mp3', 'G3': 'G3.mp3', 'A3': 'A3.mp3',
    'C4': 'C4.mp3', 'E4': 'E4.mp3', 'G4': 'G4.mp3', 'A4': 'A4.mp3',
    'C5': 'C5.mp3',
  },
  'organ': {
    'C1': 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3', 'A1': 'A1.mp3',
    'C2': 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', 'A2': 'A2.mp3',
    'C3': 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', 'A3': 'A3.mp3',
    'C4': 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', 'A4': 'A4.mp3',
    'C5': 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', 'A5': 'A5.mp3',
    'C6': 'C6.mp3',
  },
  'harmonium': {
    'C2': 'C2.mp3', 'C#2': 'Cs2.mp3', 'D2': 'D2.mp3', 'D#2': 'Ds2.mp3', 'E2': 'E2.mp3', 'F2': 'F2.mp3', 'F#2': 'Fs2.mp3', 'G2': 'G2.mp3', 'G#2': 'Gs2.mp3', 'A2': 'A2.mp3', 'A#2': 'As2.mp3', 'B2': 'B2.mp3',
    'C3': 'C3.mp3', 'C#3': 'Cs3.mp3', 'D3': 'D3.mp3', 'D#3': 'Ds3.mp3', 'E3': 'E3.mp3', 'F3': 'F3.mp3', 'F#3': 'Fs3.mp3', 'G3': 'G3.mp3', 'G#3': 'Gs3.mp3', 'A3': 'A3.mp3', 'A#3': 'As3.mp3', 'B3': 'B3.mp3',
    'C4': 'C4.mp3', 'C#4': 'Cs4.mp3', 'D4': 'D4.mp3', 'D#4': 'Ds4.mp3', 'E4': 'E4.mp3', 'F4': 'F4.mp3', 'G4': 'G4.mp3', 'G#4': 'Gs4.mp3', 'A4': 'A4.mp3', 'A#4': 'As4.mp3', 'B4': 'B4.mp3',
    'C5': 'C5.mp3', 'C#5': 'Cs5.mp3', 'D5': 'D5.mp3',
  },
  'xylophone': {
    'G4': 'G4.mp3',
    'C5': 'C5.mp3', 'G5': 'G5.mp3',
    'C6': 'C6.mp3', 'G6': 'G6.mp3',
    'C7': 'C7.mp3', 'G7': 'G7.mp3',
    'C8': 'C8.mp3',
  },
};

// All sampled instrument types (including organ-sampled alias)
const SAMPLED_INSTRUMENT_TYPES: SampledInstrumentType[] = [
  'piano',
  'guitar-acoustic',
  'guitar-electric',
  'bass-electric',
  'violin',
  'cello',
  'contrabass',
  'harp',
  'trumpet',
  'trombone',
  'french-horn',
  'tuba',
  'saxophone',
  'flute',
  'clarinet',
  'bassoon',
  'organ-sampled',
  'harmonium',
  'xylophone',
];

// Cache for loaded samplers
const samplerCache: Map<SampledInstrumentType, Tone.Sampler> = new Map();
const loadingPromises: Map<SampledInstrumentType, Promise<Tone.Sampler>> = new Map();

export function isSampledInstrument(type: string): type is SampledInstrumentType {
  return SAMPLED_INSTRUMENT_TYPES.includes(type as SampledInstrumentType);
}

export function getSampledInstrumentTypes(): SampledInstrumentType[] {
  return SAMPLED_INSTRUMENT_TYPES;
}

export async function createSampledInstrument(type: SampledInstrumentType): Promise<Tone.Sampler> {
  // Return cached sampler if available
  const cached = samplerCache.get(type);
  if (cached) {
    return cached;
  }

  // Return existing loading promise if in progress
  const existingPromise = loadingPromises.get(type);
  if (existingPromise) {
    return existingPromise;
  }

  // Map to library folder name
  const libraryName = toLibraryName(type);

  // Create new loading promise
  const loadPromise = new Promise<Tone.Sampler>((resolve, reject) => {
    const samples = INSTRUMENT_SAMPLES[libraryName];
    const baseUrl = `${SAMPLE_BASE_URL}${libraryName}/`;

    const sampler = new Tone.Sampler({
      urls: samples,
      baseUrl,
      onload: () => {
        samplerCache.set(type, sampler);
        loadingPromises.delete(type);
        resolve(sampler);
      },
      onerror: (err) => {
        loadingPromises.delete(type);
        reject(err);
      },
    });
  });

  loadingPromises.set(type, loadPromise);
  return loadPromise;
}

export function disposeSampledInstrument(type: SampledInstrumentType): void {
  const sampler = samplerCache.get(type);
  if (sampler) {
    sampler.dispose();
    samplerCache.delete(type);
  }
}

export function disposeAllSamplers(): void {
  for (const [type] of samplerCache) {
    disposeSampledInstrument(type);
  }
}

export function isSamplerLoaded(type: SampledInstrumentType): boolean {
  return samplerCache.has(type);
}

export function isSamplerLoading(type: SampledInstrumentType): boolean {
  return loadingPromises.has(type);
}

// Preload multiple instruments in parallel
export async function preloadInstruments(types: SampledInstrumentType[]): Promise<void> {
  const promises = types.map(type => {
    if (samplerCache.has(type) || loadingPromises.has(type)) {
      // Already loaded or loading
      return loadingPromises.get(type) ?? Promise.resolve(samplerCache.get(type)!);
    }
    return createSampledInstrument(type).catch(err => {
      console.warn(`Failed to preload ${type}:`, err);
      return null;
    });
  });

  await Promise.all(promises);
}

// Get instruments used by a genre (for preloading)
export function getGenreInstruments(genre: string): SampledInstrumentType[] {
  const genreInstruments: Record<string, SampledInstrumentType[]> = {
    'lofi-hiphop': ['piano', 'bass-electric', 'guitar-acoustic'],
    'edm-house': ['piano'],
    'rock': ['guitar-electric', 'guitar-acoustic', 'bass-electric'],
    'ambient': ['piano', 'violin', 'cello', 'harp'],
    'funk': ['bass-electric', 'trumpet', 'saxophone'],
    'pop': ['piano', 'guitar-acoustic'],
  };
  return genreInstruments[genre] ?? [];
}
