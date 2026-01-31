// src/lib/generators/rhythm/groove.ts
import type { Note } from '../../types/music';
import type { GrooveProfile } from './types';

// Parse Tone.js time format "bar:beat:sixteenth" to total sixteenths
function parseTime(time: string): number {
  const parts = time.split(':').map(Number);
  const bar = parts[0] || 0;
  const beat = parts[1] || 0;
  const sixteenth = parts[2] || 0;
  return bar * 16 + beat * 4 + sixteenth;
}

// Convert sixteenths back to Tone.js time format
function formatTime(sixteenths: number): string {
  const bar = Math.floor(sixteenths / 16);
  const remainder = sixteenths % 16;
  const beat = Math.floor(remainder / 4);
  const sixteenth = remainder % 4;
  return `${bar}:${beat}:${sixteenth}`;
}

export function applySwing(
  notes: Note[],
  swingAmount: number,
  swingTarget: 'eighths' | 'sixteenths'
): Note[] {
  if (swingAmount === 0) return notes;

  const swingOffset = swingAmount * 0.33; // Max swing is triplet feel (~33%)
  const gridSize = swingTarget === 'eighths' ? 2 : 1; // In sixteenths

  return notes.map(note => {
    const sixteenths = parseTime(note.time);
    const gridPosition = sixteenths % (gridSize * 2);

    // Only swing the offbeat (second note of each pair)
    if (gridPosition === gridSize) {
      const swungSixteenths = sixteenths + swingOffset;
      return { ...note, time: formatTime(swungSixteenths) };
    }

    return note;
  });
}

export function applyGroove(notes: Note[], profile: GrooveProfile): Note[] {
  let result = notes;

  // Apply swing
  result = applySwing(result, profile.swingAmount, profile.swingTarget);

  // Apply pocket (overall timing offset)
  if (profile.pocket !== 'center') {
    const pocketOffset = profile.pocket === 'behind' ? 0.1 : -0.1;
    const scaledOffset = pocketOffset * (1 - profile.tightness);

    result = result.map(note => {
      const sixteenths = parseTime(note.time);
      const adjusted = Math.max(0, sixteenths + scaledOffset);
      return { ...note, time: formatTime(adjusted) };
    });
  }

  // Apply push/pull per beat position
  if (Object.keys(profile.pushPull).length > 0) {
    result = result.map(note => {
      const sixteenths = parseTime(note.time);
      const beatPosition = sixteenths % 16;
      const offset = profile.pushPull[beatPosition] || 0;

      if (offset !== 0) {
        // Offset is in ms, convert to sixteenths (approximate at 120bpm: 1 sixteenth = 125ms)
        const offsetSixteenths = (offset / 125) * 0.25;
        const adjusted = Math.max(0, sixteenths + offsetSixteenths);
        return { ...note, time: formatTime(adjusted) };
      }

      return note;
    });
  }

  return result;
}
