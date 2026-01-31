import { describe, it, expect } from 'vitest';
import { generateDrumBundle, generateDrumPatternWithPipeline } from '../drums';
import type { ChordDegree } from '../../types/music';

describe('generateDrumBundle', () => {
  const params = { density: 0.5, complexity: 0.5, swing: 0, style: 'straight' as const };
  const progression: ChordDegree[] = ['I', 'V', 'vi', 'IV'];

  it('generates a single base pattern (drums ignore chords)', () => {
    const bundle = generateDrumBundle(params, progression, 12345, 2);
    // Drums have one variation (they don't change with chords)
    expect(bundle.variations.length).toBe(1);
  });

  it('includes drum fill points for chord boundaries', () => {
    const bundle = generateDrumBundle(params, progression, 12345, 2);
    expect(bundle.drumFills).toBeDefined();
    expect(bundle.drumFills!.fillPositions.length).toBeGreaterThan(0);
  });

  it('fill positions align with progression length', () => {
    const bundle = generateDrumBundle(params, progression, 12345, 2);
    // Last chord should have a fill before looping
    expect(bundle.drumFills!.fillPositions).toContain(progression.length - 1);
  });

  it('is reproducible with same seed', () => {
    const bundle1 = generateDrumBundle(params, progression, 12345, 2);
    const bundle2 = generateDrumBundle(params, progression, 12345, 2);
    expect(bundle1.variations[0].notes).toEqual(bundle2.variations[0].notes);
  });
});

describe('generateDrumPatternWithPipeline', () => {
  it('should generate pattern using rhythm pipeline', () => {
    const params = { density: 0.5, complexity: 0.5, swing: 0.3, style: 'swung' as const };
    const notes = generateDrumPatternWithPipeline(params, 'lofi-hiphop', 42, 2);
    expect(notes.length).toBeGreaterThan(0);
    expect(notes.every(n => ['kick', 'snare', 'hihat', 'openhat', 'tom'].includes(n.pitch as string))).toBe(true);
  });

  it('should produce genre-appropriate patterns', () => {
    const params = { density: 0.7, complexity: 0.5, swing: 0, style: 'straight' as const };
    const edmNotes = generateDrumPatternWithPipeline(params, 'edm-house', 42, 2);
    const kicks = edmNotes.filter(n => n.pitch === 'kick');
    expect(kicks.length).toBeGreaterThanOrEqual(4);
  });
});
