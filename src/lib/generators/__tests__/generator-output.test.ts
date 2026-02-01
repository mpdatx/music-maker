// Tests to verify generator output fits within expected parameters
import { describe, it, expect } from 'vitest';
import { generateLoopBundle } from '../index';
import { positionToTime } from '../theory';
import type { Note, GenerationParams, ChordDegree } from '../../types/music';
import { GENRES } from '../../genres';

// Parse Tone.js time format "bar:beat:sixteenth" to total sixteenths
function parseTimeToSixteenths(time: string): number {
  const parts = time.split(':').map(Number);
  const bar = parts[0] || 0;
  const beat = parts[1] || 0;
  const sixteenth = parts[2] || 0;
  return bar * 16 + beat * 4 + sixteenth;
}

// Parse time to get bar number
function parseTimeToBar(time: string): number {
  const parts = time.split(':').map(Number);
  return parts[0] || 0;
}

// Parse time to get beat within bar (0-3)
function parseTimeToBeat(time: string): number {
  const parts = time.split(':').map(Number);
  return parts[1] || 0;
}

// Check if notes cover multiple beats (not all crammed in beat 0)
function notesSpanMultipleBeats(notes: Note[]): boolean {
  const beats = new Set(notes.map(n => parseTimeToBeat(n.time)));
  return beats.size > 1;
}

// Check if notes cover all specified bars
function notesCoverAllBars(notes: Note[], bars: number): boolean {
  const barsWithNotes = new Set(notes.map(n => parseTimeToBar(n.time)));
  for (let bar = 0; bar < bars; bar++) {
    if (!barsWithNotes.has(bar)) return false;
  }
  return true;
}

// Get the range of bars covered by notes
function getNoteBarRange(notes: Note[]): [number, number] {
  const bars = notes.map(n => parseTimeToBar(n.time));
  return [Math.min(...bars), Math.max(...bars)];
}

// Check if all notes are within the specified bar range
function notesWithinBarRange(notes: Note[], maxBar: number): boolean {
  return notes.every(n => {
    const bar = parseTimeToBar(n.time);
    return bar >= 0 && bar < maxBar;
  });
}

// Valid durations in Tone.js
const VALID_DURATIONS = ['32n', '16n', '8n', '4n', '2n', '1n', '1m', '2m'];

// Check if duration is valid
function isValidDuration(duration: string): boolean {
  return VALID_DURATIONS.includes(duration);
}

// Check velocity is in valid range
// Note: Some generators use 0-1 range, others use MIDI 0-127
// This test accepts both ranges for now
function isValidVelocity(velocity: number): boolean {
  return velocity >= 0 && velocity <= 127;
}

// Strict velocity check for 0-1 range
function isNormalizedVelocity(velocity: number): boolean {
  return velocity >= 0 && velocity <= 1;
}

const defaultParams: GenerationParams = {
  density: 0.5,
  complexity: 0.5,
  swing: 0,
  style: 'straight',
};

const testProgressions: ChordDegree[][] = [
  ['I', 'IV', 'V', 'I'],  // 4 chords
  ['I', 'V', 'vi', 'IV', 'I', 'V', 'vi', 'IV'],  // 8 chords
];

describe('Generator Output Validation', () => {
  describe('positionToTime helper', () => {
    it('should correctly convert positions to time format', () => {
      expect(positionToTime(0, 0)).toBe('0:0:0');
      expect(positionToTime(0, 1)).toBe('0:0:1');
      expect(positionToTime(0, 4)).toBe('0:1:0');
      expect(positionToTime(0, 8)).toBe('0:2:0');
      expect(positionToTime(0, 12)).toBe('0:3:0');
      expect(positionToTime(0, 15)).toBe('0:3:3');
      expect(positionToTime(1, 0)).toBe('1:0:0');
      expect(positionToTime(1, 8)).toBe('1:2:0');
    });
  });

  describe('Note timing distribution', () => {
    const genres = Object.keys(GENRES) as Array<keyof typeof GENRES>;
    // Pads are sustained chords that intentionally start at beat 0
    // Keys may also have sparse voicings on downbeats only
    const rhythmicInstruments = ['bass', 'lead'] as const;

    for (const genre of genres) {
      for (const instrument of rhythmicInstruments) {
        it(`${genre}/${instrument}: notes should span multiple beats (not all in beat 0)`, () => {
          const bundle = generateLoopBundle(
            instrument,
            defaultParams,
            'C',
            'major',
            genre,
            12345,
            undefined,
            2
          );

          // Check each variation
          for (const variation of bundle.variations) {
            if (variation.notes.length > 1) {
              expect(notesSpanMultipleBeats(variation.notes)).toBe(true);
            }
          }
        });
      }
    }
  });

  describe('Note bar coverage', () => {
    const genres = Object.keys(GENRES) as Array<keyof typeof GENRES>;
    const bars = 2;

    for (const genre of genres) {
      it(`${genre}/bass: notes should cover all ${bars} bars`, () => {
        const bundle = generateLoopBundle(
          'bass',
          defaultParams,
          'C',
          'major',
          genre,
          12345,
          undefined,
          bars
        );

        for (const variation of bundle.variations) {
          expect(notesCoverAllBars(variation.notes, bars)).toBe(true);
        }
      });
    }
  });

  describe('Note time bounds', () => {
    const instruments = ['bass', 'lead', 'keys', 'drums', 'pad'] as const;
    const bars = 2;

    for (const instrument of instruments) {
      it(`${instrument}: all notes should be within bar range [0, ${bars})`, () => {
        const bundle = generateLoopBundle(
          instrument,
          defaultParams,
          'C',
          'major',
          'pop',
          12345,
          undefined,
          bars
        );

        for (const variation of bundle.variations) {
          expect(notesWithinBarRange(variation.notes, bars)).toBe(true);
        }
      });
    }
  });

  describe('Note validity', () => {
    const instruments = ['bass', 'lead', 'keys', 'drums', 'pad'] as const;

    for (const instrument of instruments) {
      it(`${instrument}: all notes should have valid durations`, () => {
        const bundle = generateLoopBundle(
          instrument,
          defaultParams,
          'C',
          'major',
          'pop',
          12345,
          undefined,
          2
        );

        for (const variation of bundle.variations) {
          for (const note of variation.notes) {
            expect(isValidDuration(note.duration)).toBe(true);
          }
        }
      });

      it(`${instrument}: all notes should have valid velocities`, () => {
        const bundle = generateLoopBundle(
          instrument,
          defaultParams,
          'C',
          'major',
          'pop',
          12345,
          undefined,
          2
        );

        for (const variation of bundle.variations) {
          for (const note of variation.notes) {
            expect(isValidVelocity(note.velocity)).toBe(true);
          }
        }
      });

      it(`${instrument}: all notes should have non-empty pitch`, () => {
        const bundle = generateLoopBundle(
          instrument,
          defaultParams,
          'C',
          'major',
          'pop',
          12345,
          undefined,
          2
        );

        for (const variation of bundle.variations) {
          for (const note of variation.notes) {
            expect(note.pitch).toBeTruthy();
            expect(note.pitch.length).toBeGreaterThan(0);
          }
        }
      });
    }
  });

  describe('Chord-aware variations', () => {
    it('should create one variation per chord in progression', () => {
      const bundle = generateLoopBundle(
        'bass',
        defaultParams,
        'C',
        'major',
        'pop',
        12345,
        'pop-classic', // I-V-vi-IV
        2
      );

      expect(bundle.variations.length).toBe(4);
      expect(bundle.variations.map(v => v.chordIndex)).toEqual([0, 1, 2, 3]);
    });

    it('should have notes in each variation', () => {
      const bundle = generateLoopBundle(
        'lead',
        defaultParams,
        'C',
        'major',
        'pop',
        12345,
        'pop-classic',
        2
      );

      for (const variation of bundle.variations) {
        expect(variation.notes.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Drums special case', () => {
    it('drums should have only one variation (chord-independent)', () => {
      const bundle = generateLoopBundle(
        'drums',
        defaultParams,
        'C',
        'major',
        'pop',
        12345,
        'pop-classic',
        2
      );

      expect(bundle.variations.length).toBe(1);
    });

    it('drums should have valid drum pitches', () => {
      const validDrumPitches = ['kick', 'snare', 'hihat', 'openhat', 'tom', 'clap'];
      const bundle = generateLoopBundle(
        'drums',
        defaultParams,
        'C',
        'major',
        'pop',
        12345,
        undefined,
        2
      );

      for (const variation of bundle.variations) {
        for (const note of variation.notes) {
          expect(validDrumPitches).toContain(note.pitch);
        }
      }
    });
  });

  describe('Density parameter effect', () => {
    it('higher density should produce more notes', () => {
      const lowDensity = generateLoopBundle(
        'bass',
        { ...defaultParams, density: 0.2 },
        'C',
        'major',
        'pop',
        12345,
        undefined,
        2
      );

      const highDensity = generateLoopBundle(
        'bass',
        { ...defaultParams, density: 0.9 },
        'C',
        'major',
        'pop',
        12345,
        undefined,
        2
      );

      const lowNoteCount = lowDensity.variations.reduce((sum, v) => sum + v.notes.length, 0);
      const highNoteCount = highDensity.variations.reduce((sum, v) => sum + v.notes.length, 0);

      expect(highNoteCount).toBeGreaterThanOrEqual(lowNoteCount);
    });
  });

  describe('Reproducibility with seed', () => {
    it('same seed should produce identical output', () => {
      const bundle1 = generateLoopBundle(
        'bass',
        defaultParams,
        'C',
        'major',
        'pop',
        42,
        undefined,
        2
      );

      const bundle2 = generateLoopBundle(
        'bass',
        defaultParams,
        'C',
        'major',
        'pop',
        42,
        undefined,
        2
      );

      expect(bundle1.variations.length).toBe(bundle2.variations.length);
      for (let i = 0; i < bundle1.variations.length; i++) {
        expect(bundle1.variations[i].notes).toEqual(bundle2.variations[i].notes);
      }
    });

    it('different seeds should produce different output', () => {
      const bundle1 = generateLoopBundle(
        'bass',
        defaultParams,
        'C',
        'major',
        'pop',
        42,
        undefined,
        2
      );

      const bundle2 = generateLoopBundle(
        'bass',
        defaultParams,
        'C',
        'major',
        'pop',
        999,
        undefined,
        2
      );

      // At least some notes should be different
      const notes1 = JSON.stringify(bundle1.variations[0].notes);
      const notes2 = JSON.stringify(bundle2.variations[0].notes);
      expect(notes1).not.toBe(notes2);
    });
  });

  describe('Velocity normalization', () => {
    // Rhythmic instruments should use the rhythm pipeline which normalizes velocities to 0-1
    const rhythmicInstruments = ['bass', 'lead', 'drums', 'keys'] as const;

    for (const instrument of rhythmicInstruments) {
      it(`${instrument}: should have normalized velocities (0-1)`, () => {
        const bundle = generateLoopBundle(
          instrument,
          defaultParams,
          'C',
          'major',
          'pop',
          12345,
          undefined,
          2
        );

        for (const variation of bundle.variations) {
          for (const note of variation.notes) {
            expect(note.velocity).toBeGreaterThanOrEqual(0);
            expect(note.velocity).toBeLessThanOrEqual(1);
          }
        }
      });
    }
  });

  describe('Time format consistency', () => {
    it('all note times should match bar:beat:sixteenth format', () => {
      const timeFormatRegex = /^\d+:\d+:\d+(\.\d+)?$/;

      const bundle = generateLoopBundle(
        'bass',
        defaultParams,
        'C',
        'major',
        'pop',
        12345,
        undefined,
        2
      );

      for (const variation of bundle.variations) {
        for (const note of variation.notes) {
          expect(note.time).toMatch(timeFormatRegex);
        }
      }
    });

    it('beat values should be 0-3 (within a bar)', () => {
      const bundle = generateLoopBundle(
        'lead',
        defaultParams,
        'C',
        'major',
        'pop',
        12345,
        undefined,
        2
      );

      for (const variation of bundle.variations) {
        for (const note of variation.notes) {
          const beat = parseTimeToBeat(note.time);
          expect(beat).toBeGreaterThanOrEqual(0);
          expect(beat).toBeLessThanOrEqual(3);
        }
      }
    });
  });
});
