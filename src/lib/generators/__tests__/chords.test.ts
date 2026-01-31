import { describe, it, expect } from 'vitest';
import { generateChordsBundle } from '../chords';
import type { ChordDegree } from '../../types/music';

describe('generateChordsBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const progression: ChordDegree[] = ['I', 'V', 'vi', 'IV'];

  it('generates one variation per chord', () => {
    const bundle = generateChordsBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle.variations.length).toBe(4);
  });

  it('variations use chord tones from the progression', () => {
    const bundle = generateChordsBundle(params, 'C', 'major', progression, 12345, 2);

    // First chord (I) should use C, E, G
    const iChordNotes = bundle.variations[0].notes.map(n => n.pitch.slice(0, -1));
    expect(iChordNotes.some(n => ['C', 'E', 'G'].includes(n))).toBe(true);
  });

  it('is reproducible with same seed', () => {
    const bundle1 = generateChordsBundle(params, 'C', 'major', progression, 12345, 2);
    const bundle2 = generateChordsBundle(params, 'C', 'major', progression, 12345, 2);
    expect(bundle1.variations[0].notes).toEqual(bundle2.variations[0].notes);
  });

  it('each variation has correct chord index', () => {
    const bundle = generateChordsBundle(params, 'C', 'major', progression, 12345, 2);
    bundle.variations.forEach((v, i) => {
      expect(v.chordIndex).toBe(i);
    });
  });

  it('variations contain notes', () => {
    const bundle = generateChordsBundle(params, 'C', 'major', progression, 12345, 2);
    bundle.variations.forEach(v => {
      expect(v.notes.length).toBeGreaterThan(0);
    });
  });

  it('V chord uses G, B, D tones', () => {
    const bundle = generateChordsBundle(params, 'C', 'major', progression, 12345, 2);
    // Second variation (V) should use G, B, D
    const vChordNotes = bundle.variations[1].notes.map(n => n.pitch.slice(0, -1));
    expect(vChordNotes.some(n => ['G', 'B', 'D'].includes(n))).toBe(true);
  });
});
