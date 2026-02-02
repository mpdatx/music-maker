import { describe, it, expect } from 'vitest';
import { generateCounterMelody } from '../counterMelody';
import type { Note } from '../../types/music';

describe('generateCounterMelody', () => {
  const chordTones = ['C4', 'E4', 'G4'];

  describe('rhythmic technique', () => {
    it('generates notes in gaps between main melody notes', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
        { pitch: 'E5', time: '0:2:0', duration: '4n', velocity: 0.8 },
      ];
      const counter = generateCounterMelody(mainNotes, 'rhythmic', chordTones, 'C', 'major', 12345);
      expect(counter.length).toBeGreaterThan(0);
      // Counter notes should NOT be at the same times as main notes
      const counterTimes = counter.map(n => n.time);
      expect(counterTimes).not.toContain('0:0:0');
      expect(counterTimes).not.toContain('0:2:0');
    });

    it('uses chord tones for counter melody', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '8n', velocity: 0.8 },
      ];
      const counter = generateCounterMelody(mainNotes, 'rhythmic', chordTones, 'C', 'major', 12345);
      for (const note of counter) {
        const pitchClass = note.pitch.replace(/\d+/, '');
        expect(['C', 'E', 'G']).toContain(pitchClass);
      }
    });

    it('reduces velocity by 50%', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      ];
      const counter = generateCounterMelody(mainNotes, 'rhythmic', chordTones, 'C', 'major', 12345);
      for (const note of counter) {
        expect(note.velocity).toBeLessThanOrEqual(0.5);
        expect(note.velocity).toBeGreaterThanOrEqual(0.2);
      }
    });

    it('is reproducible with same seed', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      ];
      const c1 = generateCounterMelody(mainNotes, 'rhythmic', chordTones, 'C', 'major', 12345);
      const c2 = generateCounterMelody(mainNotes, 'rhythmic', chordTones, 'C', 'major', 12345);
      expect(c1).toEqual(c2);
    });
  });

  describe('harmonic technique', () => {
    it('generates notes at same times as main melody', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
        { pitch: 'E5', time: '0:1:0', duration: '4n', velocity: 0.8 },
      ];
      const counter = generateCounterMelody(mainNotes, 'harmonic', chordTones, 'C', 'major', 12345);
      expect(counter.length).toBe(mainNotes.length);
      expect(counter[0].time).toBe('0:0:0');
      expect(counter[1].time).toBe('0:1:0');
    });

    it('plays different chord tones than main melody (no unisons)', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      ];
      const counter = generateCounterMelody(mainNotes, 'harmonic', chordTones, 'C', 'major', 12345);
      const mainPitchClass = 'C';
      const counterPitchClass = counter[0].pitch.replace(/\d+/, '');
      expect(counterPitchClass).not.toBe(mainPitchClass);
    });

    it('uses octave 4 (one below main)', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      ];
      const counter = generateCounterMelody(mainNotes, 'harmonic', chordTones, 'C', 'major', 12345);
      expect(counter[0].pitch).toMatch(/4$/);
    });
  });

  describe('contrary motion technique', () => {
    it('generates same number of notes as main melody', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
        { pitch: 'D5', time: '0:1:0', duration: '4n', velocity: 0.8 },
        { pitch: 'E5', time: '0:2:0', duration: '4n', velocity: 0.8 },
      ];
      const counter = generateCounterMelody(mainNotes, 'contrary', chordTones, 'C', 'major', 12345);
      expect(counter.length).toBe(mainNotes.length);
    });

    it('uses same octave as main melody', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      ];
      const counter = generateCounterMelody(mainNotes, 'contrary', chordTones, 'C', 'major', 12345);
      expect(counter[0].pitch).toMatch(/5$/);
    });

    it('plays at same times as main melody', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
        { pitch: 'E5', time: '0:2:0', duration: '4n', velocity: 0.8 },
      ];
      const counter = generateCounterMelody(mainNotes, 'contrary', chordTones, 'C', 'major', 12345);
      expect(counter[0].time).toBe('0:0:0');
      expect(counter[1].time).toBe('0:2:0');
    });
  });
});
