import { describe, it, expect } from 'vitest';
import { generateCounterMelody, parseTime, formatTime, findGaps } from '../counterMelody';
import { generateLeadWithCounter } from '../lead';
import { generateChordsWithCounter } from '../chords';
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

    it('moves in opposite direction to main melody', () => {
      // Main melody ascending: C5 -> D5 -> E5 -> F5
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
        { pitch: 'D5', time: '0:1:0', duration: '4n', velocity: 0.8 },
        { pitch: 'E5', time: '0:2:0', duration: '4n', velocity: 0.8 },
        { pitch: 'F5', time: '0:3:0', duration: '4n', velocity: 0.8 },
      ];
      const counter = generateCounterMelody(mainNotes, 'contrary', chordTones, 'C', 'major', 12345);

      // Counter should descend as main ascends
      // Extract just the note names to check direction
      const counterPitches = counter.map(n => n.pitch);

      // Convert to MIDI-like values for comparison (simplified)
      const noteToValue = (pitch: string) => {
        const noteMap: Record<string, number> = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
        const match = pitch.match(/^([A-G])(\d+)$/);
        if (!match) return 0;
        return parseInt(match[2]) * 12 + noteMap[match[1]];
      };

      // Check that counter moves down between notes 1->2 and 2->3
      const v0 = noteToValue(counterPitches[0]);
      const v1 = noteToValue(counterPitches[1]);
      const v2 = noteToValue(counterPitches[2]);

      expect(v1).toBeLessThan(v0); // First movement should be down
      expect(v2).toBeLessThan(v1); // Second movement should also be down
    });

    it('reduces velocity by 50%', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
        { pitch: 'D5', time: '0:1:0', duration: '4n', velocity: 0.6 },
      ];
      const counter = generateCounterMelody(mainNotes, 'contrary', chordTones, 'C', 'major', 12345);

      // Velocity should be ~0.4 (0.8 * 0.5) and ~0.3 (0.6 * 0.5)
      expect(counter[0].velocity).toBeLessThanOrEqual(0.5);
      expect(counter[0].velocity).toBeGreaterThanOrEqual(0.2);
      expect(counter[1].velocity).toBeLessThanOrEqual(0.5);
      expect(counter[1].velocity).toBeGreaterThanOrEqual(0.2);
    });
  });

  describe('harmonic technique velocity', () => {
    it('reduces velocity by 50%', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
        { pitch: 'E5', time: '0:1:0', duration: '4n', velocity: 0.6 },
      ];
      const counter = generateCounterMelody(mainNotes, 'harmonic', chordTones, 'C', 'major', 12345);

      expect(counter[0].velocity).toBeLessThanOrEqual(0.5);
      expect(counter[0].velocity).toBeGreaterThanOrEqual(0.2);
      expect(counter[1].velocity).toBeLessThanOrEqual(0.5);
      expect(counter[1].velocity).toBeGreaterThanOrEqual(0.2);
    });
  });

  describe('edge cases', () => {
    it('handles empty main melody', () => {
      const counter = generateCounterMelody([], 'rhythmic', chordTones, 'C', 'major', 12345);
      // Rhythmic fills the entire gap when main is empty
      expect(counter.length).toBeGreaterThan(0);
    });

    it('handles empty main melody for harmonic', () => {
      const counter = generateCounterMelody([], 'harmonic', chordTones, 'C', 'major', 12345);
      expect(counter.length).toBe(0); // No main notes to harmonize with
    });

    it('handles empty main melody for contrary', () => {
      const counter = generateCounterMelody([], 'contrary', chordTones, 'C', 'major', 12345);
      expect(counter.length).toBe(0); // No main notes to move against
    });

    it('handles single note main melody', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      ];

      const rhythmic = generateCounterMelody(mainNotes, 'rhythmic', chordTones, 'C', 'major', 12345);
      const harmonic = generateCounterMelody(mainNotes, 'harmonic', chordTones, 'C', 'major', 12345);
      const contrary = generateCounterMelody(mainNotes, 'contrary', chordTones, 'C', 'major', 12345);

      expect(rhythmic.length).toBeGreaterThan(0); // Fills gaps around the note
      expect(harmonic.length).toBe(1); // One harmonizing note
      expect(contrary.length).toBe(1); // One contrary note
    });

    it('handles very dense main melody (no gaps for rhythmic)', () => {
      // 16 consecutive 16th notes - no gaps
      const mainNotes: Note[] = Array.from({ length: 16 }, (_, i) => ({
        pitch: 'C5',
        time: formatTime(i),
        duration: '16n',
        velocity: 0.8,
      }));

      const rhythmic = generateCounterMelody(mainNotes, 'rhythmic', chordTones, 'C', 'major', 12345);
      // Should produce no notes (or very few) since there are no gaps
      expect(rhythmic.length).toBe(0);
    });

    it('handles empty chord tones', () => {
      const mainNotes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 },
      ];

      const rhythmic = generateCounterMelody(mainNotes, 'rhythmic', [], 'C', 'major', 12345);
      const harmonic = generateCounterMelody(mainNotes, 'harmonic', [], 'C', 'major', 12345);

      expect(rhythmic.length).toBe(0);
      expect(harmonic.length).toBe(0);
    });
  });

  describe('helper functions', () => {
    it('parseTime converts time string to 16th note position', () => {
      expect(parseTime('0:0:0')).toBe(0);
      expect(parseTime('0:1:0')).toBe(4);
      expect(parseTime('0:2:0')).toBe(8);
      expect(parseTime('1:0:0')).toBe(16);
      expect(parseTime('1:2:3')).toBe(16 + 8 + 3);
    });

    it('formatTime converts 16th note position to time string', () => {
      expect(formatTime(0)).toBe('0:0:0');
      expect(formatTime(4)).toBe('0:1:0');
      expect(formatTime(8)).toBe('0:2:0');
      expect(formatTime(16)).toBe('1:0:0');
      expect(formatTime(27)).toBe('1:2:3');
    });

    it('findGaps identifies gaps in occupied positions', () => {
      const notes: Note[] = [
        { pitch: 'C5', time: '0:0:0', duration: '4n', velocity: 0.8 }, // occupies 0-3
        { pitch: 'E5', time: '0:2:0', duration: '4n', velocity: 0.8 }, // occupies 8-11
      ];

      const gaps = findGaps(notes, 16);

      // Should find gap from 4-7 (between the two notes)
      expect(gaps.length).toBeGreaterThan(0);
      const gapAt4 = gaps.find(g => g.start === 4);
      expect(gapAt4).toBeDefined();
      expect(gapAt4!.duration).toBe(4);
    });
  });
});

describe('integration with generators', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };

  describe('generateLeadWithCounter', () => {
    it('includes counter notes in output when enabled', () => {
      const result = generateLeadWithCounter(
        params, 'C', 'major', 12345, 2, 'pop',
        { enabled: true, technique: 'rhythmic' }
      );

      expect(result.main.length).toBeGreaterThan(0);
      expect(result.counter).not.toBeNull();
      expect(result.counter!.length).toBeGreaterThan(0);

      // Counter notes should have reduced velocity
      for (const note of result.counter!) {
        expect(note.velocity).toBeLessThanOrEqual(0.5);
      }
    });

    it('supports all three techniques', () => {
      const techniques = ['rhythmic', 'harmonic', 'contrary'] as const;

      for (const technique of techniques) {
        const result = generateLeadWithCounter(
          params, 'C', 'major', 12345, 2, 'pop',
          { enabled: true, technique }
        );

        expect(result.counter).not.toBeNull();
        expect(result.counter!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('generateChordsWithCounter', () => {
    it('includes counter notes in output when enabled', () => {
      const result = generateChordsWithCounter(
        params, 'C', 'major', 12345, 2, 'pop',
        { enabled: true, technique: 'harmonic' }
      );

      expect(result.main.length).toBeGreaterThan(0);
      expect(result.counter).not.toBeNull();
      expect(result.counter!.length).toBeGreaterThan(0);
    });
  });
});
