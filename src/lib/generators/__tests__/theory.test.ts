import { describe, it, expect } from 'vitest';
import { SeededRandom, getNoteInScale, getChordNotes, resolveChordDegree, getChordTonesForDegree, isNoteAvailableForInstrument, SPARSE_INSTRUMENT_SAMPLES } from '../theory';
import { SAMPLED_INSTRUMENT_RANGES } from '../index';
import type { ChordDegree } from '../../types/music';

describe('SeededRandom', () => {
  it('produces reproducible results with same seed', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);

    expect(rng1.next()).toBe(rng2.next());
    expect(rng1.next()).toBe(rng2.next());
  });
});

describe('getNoteInScale', () => {
  it('returns correct note for degree 0 in C major', () => {
    expect(getNoteInScale('C', 'major', 0, 4)).toBe('C4');
  });

  it('returns correct note for degree 4 (fifth) in C major', () => {
    expect(getNoteInScale('C', 'major', 4, 4)).toBe('G4');
  });
});

describe('getChordNotes', () => {
  it('returns triad for C major chord', () => {
    const notes = getChordNotes('C', 'major', 0, 4);
    expect(notes).toEqual(['C4', 'E4', 'G4']);
  });
});

describe('resolveChordDegree', () => {
  it('resolves I to root note', () => {
    expect(resolveChordDegree('I', 'C', 'major')).toBe(0);
  });

  it('resolves IV to fourth degree', () => {
    expect(resolveChordDegree('IV', 'C', 'major')).toBe(3);
  });

  it('resolves vi to sixth degree', () => {
    expect(resolveChordDegree('vi', 'C', 'major')).toBe(5);
  });

  it('resolves ii7 to second degree', () => {
    expect(resolveChordDegree('ii7', 'C', 'major')).toBe(1);
  });
});

describe('getChordTonesForDegree', () => {
  it('returns triad tones for I in C major', () => {
    const tones = getChordTonesForDegree('I', 'C', 'major', 4);
    expect(tones).toContain('C4');
    expect(tones).toContain('E4');
    expect(tones).toContain('G4');
  });

  it('returns 7th chord tones for Imaj7', () => {
    const tones = getChordTonesForDegree('Imaj7', 'C', 'major', 4);
    expect(tones.length).toBe(4);
    expect(tones).toContain('B4');
  });

  it('returns minor triad for vi', () => {
    const tones = getChordTonesForDegree('vi', 'C', 'major', 4);
    expect(tones).toContain('A4');
    expect(tones).toContain('C5');
    expect(tones).toContain('E5');
  });
});

describe('isNoteAvailableForInstrument', () => {
  it('returns true for synth instruments (no range restrictions)', () => {
    expect(isNoteAvailableForInstrument('C4', 'pad', SAMPLED_INSTRUMENT_RANGES)).toBe(true);
    expect(isNoteAvailableForInstrument('C1', 'bass', SAMPLED_INSTRUMENT_RANGES)).toBe(true);
  });

  it('returns true for sampled instruments within range', () => {
    // Piano range is 33-108 (A1 to C8)
    expect(isNoteAvailableForInstrument('C4', 'piano', SAMPLED_INSTRUMENT_RANGES)).toBe(true);
    expect(isNoteAvailableForInstrument('A1', 'piano', SAMPLED_INSTRUMENT_RANGES)).toBe(true);
  });

  it('returns false for sampled instruments outside range', () => {
    // Piano range is 33-108 (A1 to C8)
    expect(isNoteAvailableForInstrument('C0', 'piano', SAMPLED_INSTRUMENT_RANGES)).toBe(false);
    expect(isNoteAvailableForInstrument('C9', 'piano', SAMPLED_INSTRUMENT_RANGES)).toBe(false);
  });

  it('returns true for sparse instruments only on actual sample notes', () => {
    // Flute samples: [60, 64, 69, 72, 76, 81, 84, 88, 93, 96]
    // C4 = 60 (has sample)
    expect(isNoteAvailableForInstrument('C4', 'flute', SAMPLED_INSTRUMENT_RANGES)).toBe(true);
    // E4 = 64 (has sample)
    expect(isNoteAvailableForInstrument('E4', 'flute', SAMPLED_INSTRUMENT_RANGES)).toBe(true);
  });

  it('returns false for sparse instruments on notes without samples', () => {
    // Flute samples: [60, 64, 69, 72, 76, 81, 84, 88, 93, 96]
    // D4 = 62 (no sample - between C4=60 and E4=64)
    expect(isNoteAvailableForInstrument('D4', 'flute', SAMPLED_INSTRUMENT_RANGES)).toBe(false);
    // F4 = 65 (no sample - between E4=64 and A4=69)
    expect(isNoteAvailableForInstrument('F4', 'flute', SAMPLED_INSTRUMENT_RANGES)).toBe(false);
  });

  it('handles all sparse instruments correctly', () => {
    for (const [instrument, samples] of Object.entries(SPARSE_INSTRUMENT_SAMPLES)) {
      // First sample should be available
      const firstSampleMidi = samples[0];
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const noteName = noteNames[firstSampleMidi % 12];
      const octave = Math.floor(firstSampleMidi / 12) - 1;
      const note = `${noteName}${octave}`;

      expect(isNoteAvailableForInstrument(note, instrument, SAMPLED_INSTRUMENT_RANGES)).toBe(true);
    }
  });
});
