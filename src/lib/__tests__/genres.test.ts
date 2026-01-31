import { describe, it, expect } from 'vitest';
import { GENRES, getAllGenres, getGenreConfig, getGenreBpm, getGenreTracks } from '../genres';
import type { GenrePreset } from '../genres';
import { generateLoop, generateLoopBundle, SAMPLED_INSTRUMENT_RANGES } from '../generators';
import { SPARSE_INSTRUMENT_SAMPLES, noteToMidi } from '../generators/theory';
import type { InstrumentType } from '../types';

// Get all genre keys for iteration
const ALL_GENRES = getAllGenres();

describe('Genre Configuration', () => {
  describe('GENRES object', () => {
    it('contains all expected genres', () => {
      const expectedGenres = [
        'lofi-hiphop', 'edm-house', 'rock', 'ambient', 'funk', 'pop',
        'jazz', 'classical', 'bossa-nova', 'blues', 'reggae', 'cinematic'
      ];
      for (const genre of expectedGenres) {
        expect(GENRES).toHaveProperty(genre);
      }
    });

    it('each genre has required fields', () => {
      for (const genre of ALL_GENRES) {
        const config = GENRES[genre];
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('bpmRange');
        expect(config).toHaveProperty('key');
        expect(config).toHaveProperty('scale');
        expect(config).toHaveProperty('swing');
        expect(config).toHaveProperty('defaultParams');
        expect(config).toHaveProperty('tracks');
      }
    });

    it('each genre has valid BPM range', () => {
      for (const genre of ALL_GENRES) {
        const config = GENRES[genre];
        expect(config.bpmRange[0]).toBeGreaterThan(0);
        expect(config.bpmRange[1]).toBeGreaterThanOrEqual(config.bpmRange[0]);
        expect(config.bpmRange[1]).toBeLessThan(300); // Sanity check
      }
    });

    it('each genre has valid defaultParams', () => {
      for (const genre of ALL_GENRES) {
        const config = GENRES[genre];
        expect(config.defaultParams.density).toBeGreaterThanOrEqual(0);
        expect(config.defaultParams.density).toBeLessThanOrEqual(1);
        expect(config.defaultParams.complexity).toBeGreaterThanOrEqual(0);
        expect(config.defaultParams.complexity).toBeLessThanOrEqual(1);
        expect(config.defaultParams.swing).toBeGreaterThanOrEqual(0);
        expect(config.defaultParams.swing).toBeLessThanOrEqual(1);
        expect(['straight', 'swung', 'syncopated', 'offbeat']).toContain(config.defaultParams.style);
      }
    });

    it('each genre has at least one track', () => {
      for (const genre of ALL_GENRES) {
        expect(GENRES[genre].tracks.length).toBeGreaterThan(0);
      }
    });
  });

  describe('helper functions', () => {
    it('getAllGenres returns all genres', () => {
      expect(ALL_GENRES.length).toBeGreaterThanOrEqual(12);
    });

    it('getGenreConfig returns valid config', () => {
      for (const genre of ALL_GENRES) {
        const config = getGenreConfig(genre);
        expect(config.name).toBeTruthy();
      }
    });

    it('getGenreBpm returns mid-range BPM', () => {
      for (const genre of ALL_GENRES) {
        const bpm = getGenreBpm(genre);
        const config = GENRES[genre];
        expect(bpm).toBeGreaterThanOrEqual(config.bpmRange[0]);
        expect(bpm).toBeLessThanOrEqual(config.bpmRange[1]);
      }
    });

    it('getGenreTracks returns tracks for each genre', () => {
      for (const genre of ALL_GENRES) {
        const tracks = getGenreTracks(genre);
        expect(tracks.length).toBeGreaterThan(0);
        expect(tracks).toEqual(GENRES[genre].tracks);
      }
    });
  });
});

describe('Loop Generation for All Genres', () => {
  const testParams = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const testSeed = 12345;
  const testBars = 2;

  describe('generateLoop produces notes for each genre', () => {
    for (const genre of ALL_GENRES) {
      describe(`${genre}`, () => {
        const config = GENRES[genre];
        const key = config.key;
        const scale = config.scale;

        for (const track of config.tracks) {
          const instrumentType = track.type as InstrumentType;

          it(`generates notes for ${track.name} (${instrumentType})`, () => {
            const loop = generateLoop(instrumentType, testParams, key, scale, testSeed, testBars);

            // Every instrument should produce at least some notes
            expect(loop.notes.length).toBeGreaterThan(0);
            expect(loop.type).toBe(instrumentType);
            expect(loop.bars).toBe(testBars);
          });
        }
      });
    }
  });

  describe('generateLoopBundle produces variations for each genre', () => {
    for (const genre of ALL_GENRES) {
      describe(`${genre}`, () => {
        const config = GENRES[genre];
        const key = config.key;
        const scale = config.scale;

        for (const track of config.tracks) {
          const instrumentType = track.type as InstrumentType;

          it(`generates bundle with variations for ${track.name} (${instrumentType})`, () => {
            const bundle = generateLoopBundle(instrumentType, testParams, key, scale, genre, testSeed, undefined, testBars);

            expect(bundle.variations.length).toBeGreaterThan(0);
            expect(bundle.instrument).toBe(instrumentType);
            expect(bundle.progressionId).toBeTruthy();

            // Each variation should have notes (except drums might have variations with fewer notes)
            for (const variation of bundle.variations) {
              expect(variation.chordIndex).toBeDefined();
              // Most variations should have notes
              if (instrumentType !== 'drums' && instrumentType !== 'percussion') {
                expect(variation.notes.length).toBeGreaterThan(0);
              }
            }
          });
        }
      });
    }
  });
});

describe('Sampled Instrument Ranges', () => {
  const sampledInstruments: InstrumentType[] = [
    'piano', 'guitar-acoustic', 'guitar-electric', 'bass-electric',
    'violin', 'cello', 'contrabass', 'harp', 'trumpet', 'trombone',
    'french-horn', 'tuba', 'saxophone', 'flute', 'clarinet', 'bassoon',
    'organ-sampled', 'harmonium', 'xylophone'
  ];

  it('all sampled instruments have defined ranges', () => {
    for (const instrument of sampledInstruments) {
      expect(SAMPLED_INSTRUMENT_RANGES).toHaveProperty(instrument);
      const [min, max] = SAMPLED_INSTRUMENT_RANGES[instrument];
      expect(min).toBeLessThan(max);
      expect(min).toBeGreaterThan(0); // MIDI notes are positive
      expect(max).toBeLessThanOrEqual(127); // MIDI max
    }
  });

  it('all genres use instruments with valid ranges', () => {
    for (const genre of ALL_GENRES) {
      const config = GENRES[genre];
      for (const track of config.tracks) {
        const instrumentType = track.type as InstrumentType;
        // If it's a sampled instrument, it should have a range defined
        if (sampledInstruments.includes(instrumentType)) {
          expect(SAMPLED_INSTRUMENT_RANGES).toHaveProperty(instrumentType);
        }
      }
    }
  });
});

describe('Ambient Genre Specific Tests', () => {
  const ambientConfig = GENRES['ambient'];
  const testParams = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const testSeed = 12345;

  it('ambient has correct tracks configured', () => {
    const trackTypes = ambientConfig.tracks.map(t => t.type);
    expect(trackTypes).toContain('drums');
    expect(trackTypes).toContain('piano');
    expect(trackTypes).toContain('pad');
    expect(trackTypes).toContain('violin');
    expect(trackTypes).toContain('cello');
    expect(trackTypes).toContain('harp');
    expect(trackTypes).toContain('flute');
  });

  it('generates notes for all ambient instruments', () => {
    const key = ambientConfig.key; // C
    const scale = ambientConfig.scale; // major

    for (const track of ambientConfig.tracks) {
      const instrumentType = track.type as InstrumentType;
      const loop = generateLoop(instrumentType, testParams, key, scale, testSeed, 2);

      expect(loop.notes.length).toBeGreaterThan(0);
    }
  });

  it('ambient instrument notes are within valid MIDI range', () => {
    const key = ambientConfig.key;
    const scale = ambientConfig.scale;

    for (const track of ambientConfig.tracks) {
      const instrumentType = track.type as InstrumentType;
      const loop = generateLoop(instrumentType, testParams, key, scale, testSeed, 2);

      const range = SAMPLED_INSTRUMENT_RANGES[instrumentType];
      if (range) {
        const [minMidi, maxMidi] = range;
        for (const note of loop.notes) {
          // Extract MIDI from pitch (e.g., "C4" -> 60)
          const match = note.pitch.match(/^([A-G]#?)(\d+)$/);
          if (match) {
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const [, noteName, octaveStr] = match;
            const noteIndex = noteNames.indexOf(noteName);
            const octave = parseInt(octaveStr, 10);
            const midi = (octave + 1) * 12 + noteIndex;

            expect(midi).toBeGreaterThanOrEqual(minMidi);
            expect(midi).toBeLessThanOrEqual(maxMidi);
          }
        }
      }
    }
  });

  it('bundle generation works for ambient', () => {
    const key = ambientConfig.key;
    const scale = ambientConfig.scale;

    for (const track of ambientConfig.tracks) {
      const instrumentType = track.type as InstrumentType;
      const bundle = generateLoopBundle(
        instrumentType,
        testParams,
        key,
        scale,
        'ambient',
        testSeed
      );

      expect(bundle.variations.length).toBeGreaterThan(0);
      expect(bundle.progressionId).toBeTruthy();
    }
  });
});

describe('Genre Uses Valid Scales', () => {
  const validScales = ['major', 'minor', 'dorian', 'mixolydian', 'pentatonic', 'chromatic'];

  it('all genres use valid scales', () => {
    for (const genre of ALL_GENRES) {
      expect(validScales).toContain(GENRES[genre].scale);
    }
  });
});

describe('Sparse Instrument Sample Validation', () => {
  const testParams = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const sparseInstruments = Object.keys(SPARSE_INSTRUMENT_SAMPLES) as InstrumentType[];

  it('sparse instruments have sample definitions', () => {
    // These instruments should have sparse sample definitions
    const expectedSparse = ['xylophone', 'flute', 'clarinet', 'violin', 'trumpet', 'french-horn', 'tuba', 'harp', 'contrabass'];
    for (const instrument of expectedSparse) {
      expect(SPARSE_INSTRUMENT_SAMPLES).toHaveProperty(instrument);
      expect(SPARSE_INSTRUMENT_SAMPLES[instrument].length).toBeGreaterThan(0);
    }
  });

  it('sparse sample arrays are sorted ascending', () => {
    for (const [instrument, samples] of Object.entries(SPARSE_INSTRUMENT_SAMPLES)) {
      for (let i = 1; i < samples.length; i++) {
        expect(samples[i]).toBeGreaterThan(samples[i - 1]);
      }
    }
  });

  describe('generated notes for sparse instruments are quantized to actual samples', () => {
    for (const genre of ALL_GENRES) {
      const config = GENRES[genre];
      const sparseTracksInGenre = config.tracks.filter(t =>
        sparseInstruments.includes(t.type as InstrumentType)
      );

      if (sparseTracksInGenre.length === 0) continue;

      describe(`${genre}`, () => {
        for (const track of sparseTracksInGenre) {
          const instrumentType = track.type as InstrumentType;
          const validSamples = new Set(SPARSE_INSTRUMENT_SAMPLES[instrumentType]);

          it(`${track.name} (${instrumentType}) notes match available samples`, () => {
            const loop = generateLoop(
              instrumentType,
              testParams,
              config.key,
              config.scale,
              12345,
              2
            );

            // Every note should be a valid sample for this instrument
            for (const note of loop.notes) {
              const midi = noteToMidi(note.pitch);
              expect(validSamples.has(midi)).toBe(true);
            }
          });
        }
      });
    }
  });

  describe('generated bundle notes for sparse instruments are quantized to actual samples', () => {
    for (const genre of ALL_GENRES) {
      const config = GENRES[genre];
      const sparseTracksInGenre = config.tracks.filter(t =>
        sparseInstruments.includes(t.type as InstrumentType)
      );

      if (sparseTracksInGenre.length === 0) continue;

      describe(`${genre}`, () => {
        for (const track of sparseTracksInGenre) {
          const instrumentType = track.type as InstrumentType;
          const validSamples = new Set(SPARSE_INSTRUMENT_SAMPLES[instrumentType]);

          it(`${track.name} (${instrumentType}) bundle notes match available samples`, () => {
            const bundle = generateLoopBundle(
              instrumentType,
              testParams,
              config.key,
              config.scale,
              genre,
              12345
            );

            // Every note in every variation should be a valid sample
            for (const variation of bundle.variations) {
              for (const note of variation.notes) {
                const midi = noteToMidi(note.pitch);
                expect(validSamples.has(midi)).toBe(true);
              }
            }
          });
        }
      });
    }
  });
});
