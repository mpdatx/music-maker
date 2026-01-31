import type { Loop, InstrumentType, GenerationParams, GenrePreset, Note } from '../types';
import { generateDrumPattern } from './drums';
import { generateBassLine } from './bass';
import { generateChords } from './chords';
import { generateLead } from './lead';
import { generatePad } from './pad';
import { generatePluck } from './pluck';
import { generateStrings } from './strings';
import { generateOrgan } from './organ';

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

  let notes: Note[];
  switch (type) {
    // Drum instruments
    case 'drums':
    case 'percussion':
      notes = generateDrumPattern(params, actualSeed, bars);
      break;

    // Bass instruments (synth and sampled)
    case 'bass':
    case 'bass-electric':
    case 'contrabass':
    case 'tuba':
      notes = generateBassLine(params, key, scale, actualSeed, bars);
      break;

    // Chord/keys instruments
    case 'keys':
    case 'piano':
    case 'organ-sampled':
    case 'harmonium':
    case 'epiano':
      notes = generateChords(params, key, scale, actualSeed, bars);
      break;

    // Lead/melody instruments
    case 'lead':
    case 'trumpet':
    case 'saxophone':
    case 'flute':
    case 'clarinet':
    case 'violin':
      notes = generateLead(params, key, scale, actualSeed, bars);
      break;

    // Pad/sustain instruments
    case 'pad':
    case 'choir':
    case 'cello':
    case 'french-horn':
    case 'trombone':
      notes = generatePad(params, key, scale, actualSeed, bars);
      break;

    // Pluck/arp instruments
    case 'pluck':
    case 'kalimba':
    case 'xylophone':
    case 'harp':
    case 'guitar-acoustic':
    case 'guitar-electric':
    case 'bassoon':
      notes = generatePluck(params, key, scale, actualSeed, bars);
      break;

    // Strings (legato style)
    case 'strings':
      notes = generateStrings(params, key, scale, actualSeed, bars);
      break;

    // Organ (sustained chords)
    case 'organ':
      notes = generateOrgan(params, key, scale, actualSeed, bars);
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
  const types: InstrumentType[] = ['drums', 'percussion', 'bass', 'keys', 'lead', 'pad', 'pluck', 'strings', 'organ', 'choir', 'epiano', 'kalimba'];

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
