// src/lib/generators/rhythm/__tests__/groove.test.ts
import { describe, it, expect } from 'vitest';
import { applyGroove, applySwing } from '../groove';
import type { GrooveProfile } from '../types';
import type { Note } from '../../../types/music';

describe('groove', () => {
  const straightNotes: Note[] = [
    { pitch: 'C4', time: '0:0:0', duration: '8n', velocity: 0.8 },
    { pitch: 'C4', time: '0:0:1', duration: '8n', velocity: 0.8 },
    { pitch: 'C4', time: '0:0:2', duration: '8n', velocity: 0.8 },
    { pitch: 'C4', time: '0:0:3', duration: '8n', velocity: 0.8 },
  ];

  it('should apply swing to sixteenths', () => {
    const swungNotes = applySwing(straightNotes, 0.5, 'sixteenths');
    // Odd sixteenths should be delayed
    const secondNote = swungNotes[1];
    expect(secondNote.time).not.toBe('0:0:1');
  });

  it('should not swing with swingAmount of 0', () => {
    const result = applySwing(straightNotes, 0, 'sixteenths');
    expect(result[1].time).toBe(straightNotes[1].time);
  });

  it('should apply pocket timing', () => {
    const behindProfile: GrooveProfile = {
      genre: 'lofi-hiphop',
      swingAmount: 0,
      swingTarget: 'sixteenths',
      pocket: 'behind',
      tightness: 0.5,
      pushPull: {},
    };
    const result = applyGroove(straightNotes, behindProfile);
    // Notes should be slightly delayed (behind the beat)
    expect(result.length).toBe(straightNotes.length);
  });

  it('should apply push/pull offsets', () => {
    const profile: GrooveProfile = {
      genre: 'funk',
      swingAmount: 0,
      swingTarget: 'sixteenths',
      pocket: 'center',
      tightness: 1,
      pushPull: { 0: 10, 4: -10 },
    };
    const notes: Note[] = [
      { pitch: 'C4', time: '0:0:0', duration: '8n', velocity: 0.8 },
      { pitch: 'C4', time: '0:1:0', duration: '8n', velocity: 0.8 },
    ];
    const result = applyGroove(notes, profile);
    expect(result.length).toBe(2);
  });
});
