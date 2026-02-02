import { SeededRandom } from './theory';
import type { Note, CounterMelodyTechnique } from '../types/music';

// Constants
const VELOCITY_MULTIPLIER = 0.5;
const MIN_VELOCITY = 0.2;

// Duration in 16th notes
const DURATION_MAP: Record<string, number> = {
  '1n': 16,
  '2n': 8,
  '4n': 4,
  '8n': 2,
  '16n': 1,
  '2n.': 12,
  '4n.': 6,
  '8n.': 3,
};

/**
 * Parse Tone.js time format "bar:beat:sixteenth" to position in 16th notes
 */
export function parseTime(time: string): number {
  const parts = time.split(':').map(Number);
  const bar = parts[0] || 0;
  const beat = parts[1] || 0;
  const sixteenth = parts[2] || 0;
  return bar * 16 + beat * 4 + sixteenth;
}

/**
 * Convert position in 16th notes back to Tone.js time format
 */
export function formatTime(position: number): string {
  const bar = Math.floor(position / 16);
  const remainder = position % 16;
  const beat = Math.floor(remainder / 4);
  const sixteenth = remainder % 4;
  return `${bar}:${beat}:${sixteenth}`;
}

/**
 * Parse duration string to 16th notes
 */
export function parseDuration(duration: string): number {
  return DURATION_MAP[duration] || 2; // Default to 8n
}

interface Gap {
  start: number;
  duration: number;
}

/**
 * Find gaps in the main melody where counter melody can play
 */
export function findGaps(mainNotes: Note[], totalLength: number): Gap[] {
  if (mainNotes.length === 0) {
    return [{ start: 0, duration: totalLength }];
  }

  // Build occupied positions
  const occupied = new Set<number>();
  for (const note of mainNotes) {
    const start = parseTime(note.time);
    const dur = parseDuration(note.duration);
    for (let i = 0; i < dur; i++) {
      occupied.add(start + i);
    }
  }

  // Find contiguous gaps
  const gaps: Gap[] = [];
  let gapStart: number | null = null;

  for (let pos = 0; pos < totalLength; pos++) {
    if (!occupied.has(pos)) {
      if (gapStart === null) {
        gapStart = pos;
      }
    } else {
      if (gapStart !== null) {
        gaps.push({ start: gapStart, duration: pos - gapStart });
        gapStart = null;
      }
    }
  }

  // Handle gap at the end
  if (gapStart !== null) {
    gaps.push({ start: gapStart, duration: totalLength - gapStart });
  }

  return gaps;
}

/**
 * Generate counter melody using rhythmic technique (fills gaps)
 */
function generateRhythmicCounter(
  mainNotes: Note[],
  chordTones: string[],
  rng: SeededRandom
): Note[] {
  if (chordTones.length === 0) {
    return [];
  }

  // Calculate total length from main notes
  let totalLength = 16; // Default 1 bar
  for (const note of mainNotes) {
    const end = parseTime(note.time) + parseDuration(note.duration);
    if (end > totalLength) {
      totalLength = end;
    }
  }

  const gaps = findGaps(mainNotes, totalLength);
  const counterNotes: Note[] = [];

  for (const gap of gaps) {
    // Only fill gaps of at least 2 sixteenths
    if (gap.duration < 2) continue;

    // Place notes in the gap
    let pos = gap.start;
    while (pos < gap.start + gap.duration) {
      // Choose duration: prefer 8n (2) but use 16n (1) for small gaps
      const remaining = gap.start + gap.duration - pos;
      const noteDur = remaining >= 2 ? 2 : 1;

      // Pick a chord tone
      const pitch = rng.pick(chordTones);

      // Calculate velocity
      const baseVelocity = 0.6 + rng.next() * 0.2; // 0.6-0.8
      const velocity = Math.max(MIN_VELOCITY, baseVelocity * VELOCITY_MULTIPLIER);

      counterNotes.push({
        pitch,
        time: formatTime(pos),
        duration: noteDur === 2 ? '8n' : '16n',
        velocity,
      });

      pos += noteDur;

      // Sometimes skip a position for rhythmic variety
      if (rng.chance(0.3) && pos < gap.start + gap.duration - 1) {
        pos += 1;
      }
    }
  }

  return counterNotes;
}

/**
 * Extract pitch class (note name without octave) from a pitch string
 */
function getPitchClass(pitch: string): string {
  return pitch.replace(/\d+/, '');
}

/**
 * Generate counter melody using harmonic technique (complementary chord tones)
 */
function generateHarmonicCounter(
  mainNotes: Note[],
  chordTones: string[],
  rng: SeededRandom
): Note[] {
  if (chordTones.length === 0 || mainNotes.length === 0) {
    return [];
  }

  // Extract pitch classes from chord tones
  const chordPitchClasses = chordTones.map(getPitchClass);

  const counterNotes: Note[] = [];

  for (const mainNote of mainNotes) {
    const mainPitchClass = getPitchClass(mainNote.pitch);

    // Find which chord tone index the main note is playing
    const mainIndex = chordPitchClasses.indexOf(mainPitchClass);

    // Choose complementary chord tone
    let counterPitchClass: string;
    if (mainIndex === 0) {
      // Main plays root -> counter plays third
      counterPitchClass = chordPitchClasses[1] || chordPitchClasses[0];
    } else if (mainIndex === 1) {
      // Main plays third -> counter plays fifth
      counterPitchClass = chordPitchClasses[2] || chordPitchClasses[0];
    } else if (mainIndex === 2) {
      // Main plays fifth -> counter plays root
      counterPitchClass = chordPitchClasses[0];
    } else {
      // Main note not in chord tones - pick a different one randomly
      const otherTones = chordPitchClasses.filter(pc => pc !== mainPitchClass);
      counterPitchClass = otherTones.length > 0 ? rng.pick(otherTones) : chordPitchClasses[0];
    }

    // Ensure no unisons - if somehow we'd play the same pitch class, shift
    if (counterPitchClass === mainPitchClass && chordPitchClasses.length > 1) {
      const alternatives = chordPitchClasses.filter(pc => pc !== mainPitchClass);
      counterPitchClass = rng.pick(alternatives);
    }

    // Use octave 4 (one below main melody's octave 5)
    const counterPitch = `${counterPitchClass}4`;

    // Calculate velocity
    const baseVelocity = mainNote.velocity;
    const velocity = Math.max(MIN_VELOCITY, baseVelocity * VELOCITY_MULTIPLIER);

    counterNotes.push({
      pitch: counterPitch,
      time: mainNote.time,
      duration: mainNote.duration,
      velocity,
    });
  }

  return counterNotes;
}

/**
 * Generate a counter melody based on the main melody
 */
export function generateCounterMelody(
  mainNotes: Note[],
  technique: CounterMelodyTechnique,
  chordTones: string[],
  _key: string,
  _scale: string,
  seed: number
): Note[] {
  const rng = new SeededRandom(seed);

  switch (technique) {
    case 'rhythmic':
      return generateRhythmicCounter(mainNotes, chordTones, rng);
    case 'harmonic':
      return generateHarmonicCounter(mainNotes, chordTones, rng);
    case 'contrary':
      // Placeholder - will be implemented in Task 4
      return [];
    default:
      return [];
  }
}
