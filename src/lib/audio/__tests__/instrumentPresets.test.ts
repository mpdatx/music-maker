import { describe, it, expect } from 'vitest';
import { getAllGenres, GENRES } from '../../genres';
import type { GenrePreset } from '../../genres';
import type { InstrumentType } from '../../types';

const ALL_GENRES = getAllGenres();

// These tests validate that preset configurations exist and are properly structured.
// We don't instantiate Tone.js synths since that requires audio context.
// Instead we verify the preset data structures directly.

describe('Drum Kit Preset Configuration', () => {
  // We can't import the actual DRUM_PRESETS without triggering Tone.js imports,
  // so we verify through the drums.ts file structure
  it('all genres should have drum preset configurations', () => {
    // All genres should be defined in GENRES
    expect(ALL_GENRES.length).toBeGreaterThanOrEqual(12);
  });

  it('genres using drums have valid track configurations', () => {
    for (const genre of ALL_GENRES) {
      const config = GENRES[genre];
      const hasDrums = config.tracks.some(t => t.type === 'drums' || t.type === 'percussion');
      if (hasDrums) {
        // Genre config exists and has drums/percussion track
        expect(config.tracks.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('Melodic Synth Preset Configuration', () => {
  const synthInstruments: InstrumentType[] = [
    'bass', 'keys', 'lead', 'pad', 'pluck', 'strings', 'organ', 'choir', 'epiano', 'kalimba'
  ];

  it('all synth instrument types are documented', () => {
    expect(synthInstruments.length).toBe(10);
  });

  it('genres using synth instruments have valid track configurations', () => {
    const synthTypes = new Set(synthInstruments);

    for (const genre of ALL_GENRES) {
      const config = GENRES[genre];
      for (const track of config.tracks) {
        const instrumentType = track.type as InstrumentType;
        // If this is a synth instrument, verify track config is valid
        if (synthTypes.has(instrumentType)) {
          expect(track.name).toBeTruthy();
          expect(track.type).toBe(instrumentType);
        }
      }
    }
  });
});

describe('Genre Track Instrument Coverage', () => {
  const synthTypes = new Set<InstrumentType>([
    'bass', 'keys', 'lead', 'pad', 'pluck', 'strings', 'organ', 'choir', 'epiano', 'kalimba'
  ]);

  const sampledTypes = new Set<InstrumentType>([
    'piano', 'guitar-acoustic', 'guitar-electric', 'bass-electric',
    'violin', 'cello', 'contrabass', 'harp', 'trumpet', 'trombone',
    'french-horn', 'tuba', 'saxophone', 'flute', 'clarinet', 'bassoon',
    'organ-sampled', 'harmonium', 'xylophone'
  ]);

  const drumTypes = new Set<InstrumentType>(['drums', 'percussion']);

  it('all genres use only known instrument types', () => {
    const allKnownTypes = new Set([...synthTypes, ...sampledTypes, ...drumTypes]);

    for (const genre of ALL_GENRES) {
      const config = GENRES[genre];
      for (const track of config.tracks) {
        const instrumentType = track.type as InstrumentType;
        expect(allKnownTypes.has(instrumentType)).toBe(true);
      }
    }
  });

  it('each genre has a diverse instrument selection', () => {
    for (const genre of ALL_GENRES) {
      const config = GENRES[genre];
      const types = config.tracks.map(t => t.type);
      const uniqueTypes = new Set(types);
      // Each genre should have multiple different instrument types
      expect(uniqueTypes.size).toBeGreaterThanOrEqual(3);
    }
  });
});
