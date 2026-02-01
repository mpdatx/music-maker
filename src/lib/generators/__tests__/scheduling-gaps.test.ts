import { describe, it, expect } from 'vitest';
import { generateLoopBundle } from '../index';
import type { LoopBundle } from '../../types/music';

// Parse time to get bar number
function parseTimeToBar(time: string): number {
  const parts = time.split(':').map(Number);
  return parts[0] || 0;
}

// Check for gaps in bar coverage when variations are flattened to absolute times
function analyzeBarCoverage(bundle: LoopBundle, barsPerChord: number): {
  coveredBars: Set<number>;
  totalBars: number;
  missingBars: number[];
} {
  const coveredBars = new Set<number>();
  const totalBars = bundle.variations.length * barsPerChord;

  for (const variation of bundle.variations) {
    const startBar = variation.chordIndex * barsPerChord;
    for (const note of variation.notes) {
      const relativeBar = parseTimeToBar(note.time);
      const absoluteBar = startBar + relativeBar;
      coveredBars.add(absoluteBar);
    }
  }

  const missingBars: number[] = [];
  for (let bar = 0; bar < totalBars; bar++) {
    if (!coveredBars.has(bar)) {
      missingBars.push(bar);
    }
  }

  return { coveredBars, totalBars, missingBars };
}

describe('Scheduling gap analysis', () => {
  const defaultParams = {
    density: 0.5,
    complexity: 0.5,
    swing: 0,
    style: 'straight' as const,
  };
  const barsPerChord = 2;

  it('bass should cover all bars in the progression', () => {
    const bundle = generateLoopBundle(
      'bass', defaultParams, 'C', 'major', 'pop', 12345, 'pop-classic', barsPerChord
    );

    const { missingBars, totalBars } = analyzeBarCoverage(bundle, barsPerChord);
    console.log('Bass:', totalBars, 'total bars, missing:', missingBars);
    expect(missingBars).toEqual([]);
  });

  it('lead should cover all bars in the progression', () => {
    const bundle = generateLoopBundle(
      'lead', defaultParams, 'C', 'major', 'pop', 12345, 'pop-classic', barsPerChord
    );

    const { missingBars, totalBars } = analyzeBarCoverage(bundle, barsPerChord);
    console.log('Lead:', totalBars, 'total bars, missing:', missingBars);
    expect(missingBars).toEqual([]);
  });

  it('keys should cover all bars in the progression', () => {
    const bundle = generateLoopBundle(
      'keys', defaultParams, 'C', 'major', 'pop', 12345, 'pop-classic', barsPerChord
    );

    const { missingBars, totalBars } = analyzeBarCoverage(bundle, barsPerChord);
    console.log('Keys:', totalBars, 'total bars, missing:', missingBars);
    expect(missingBars).toEqual([]);
  });

  it('drums should cover all bars (single variation, internal looping)', () => {
    const bundle = generateLoopBundle(
      'drums', defaultParams, 'C', 'major', 'pop', 12345, 'pop-classic', barsPerChord
    );

    // Drums only have 1 variation that loops internally
    expect(bundle.variations.length).toBe(1);

    // But they should have notes in both bars 0 and 1
    const bars = new Set(bundle.variations[0].notes.map(n => parseTimeToBar(n.time)));
    console.log('Drums: bars covered:', Array.from(bars).sort());
    expect(bars.has(0)).toBe(true);
    expect(bars.has(1)).toBe(true);
  });

  it('pad should cover all bars (sustained notes)', () => {
    const bundle = generateLoopBundle(
      'pad', defaultParams, 'C', 'major', 'pop', 12345, 'pop-classic', barsPerChord
    );

    // Pads start at bar 0 but with long durations should sustain through
    // Check that each variation has notes (at least at bar 0)
    for (const variation of bundle.variations) {
      expect(variation.notes.length).toBeGreaterThan(0);
      // Check durations are long enough to cover the variation
      const hasSustainingNotes = variation.notes.some(n =>
        n.duration === '2m' || n.duration === '1m' || n.duration === '2n'
      );
      expect(hasSustainingNotes).toBe(true);
    }
  });

  it('all genres should have proper bar coverage for bass', () => {
    const genres = ['pop', 'rock', 'jazz', 'lofi-hiphop', 'edm-house', 'funk', 'ambient'] as const;

    for (const genre of genres) {
      const bundle = generateLoopBundle(
        'bass', defaultParams, 'C', 'major', genre, 12345, undefined, barsPerChord
      );

      const { missingBars, totalBars } = analyzeBarCoverage(bundle, barsPerChord);
      console.log('Bass/' + genre + ':', totalBars, 'bars, missing:', missingBars);
      expect(missingBars.length).toBe(0);
    }
  });
});
