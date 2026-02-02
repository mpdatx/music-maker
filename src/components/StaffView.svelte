<script lang="ts">
  import type { Note, InstrumentType } from '../lib/types';

  let {
    notes = [] as Note[],
    bars = 2,
    progress = 0,
    instrumentType = 'keys' as InstrumentType,
    instrumentColor = '#3a3a5e',
    isPlaying = false,
  }: {
    notes?: Note[];
    bars?: number;
    progress?: number;
    instrumentType?: InstrumentType;
    instrumentColor?: string;
    isPlaying?: boolean;
  } = $props();

  // Staff visualization constants
  const STAFF_POSITIONS = 12;

  const NOTE_TO_MIDI: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };

  const DIATONIC_POSITION: Record<number, number> = {
    0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 10: 5, 11: 6
  };

  function pitchToMidi(pitch: string): number {
    const match = pitch.match(/([A-G]#?)(\d)/);
    if (!match) return 60;
    const noteName = match[1];
    const octave = parseInt(match[2]);
    return (octave + 1) * 12 + NOTE_TO_MIDI[noteName];
  }

  function midiToStaffPosition(midi: number, useBassClef: boolean): number {
    const noteInOctave = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const diatonicPos = DIATONIC_POSITION[noteInOctave];

    if (useBassClef) {
      const d3Position = 3 * 7 + 1;
      const notePosition = octave * 7 + diatonicPos;
      return (notePosition - d3Position) + 6;
    } else {
      const b4Position = 4 * 7 + 6;
      const notePosition = octave * 7 + diatonicPos;
      return (notePosition - b4Position) + 6;
    }
  }

  // Parse time string to position (0-1 within the loop)
  function parseTimeToPosition(time: string): number {
    const parts = time.split(':').map(Number);
    const bar = parts[0] || 0;
    const beat = parts[1] || 0;
    const sixteenth = parts[2] || 0;
    const step = bar * 16 + beat * 4 + sixteenth;
    const totalSteps = bars * 16;
    return step / totalSteps;
  }

  // Parse duration to width (fraction of loop)
  function parseDurationToWidth(duration: string): number {
    const durationMap: Record<string, number> = {
      '1n': 16, '2n': 8, '4n': 4, '8n': 2, '16n': 1, '32n': 0.5,
      '2n.': 12, '4n.': 6, '8n.': 3,
    };
    const steps = durationMap[duration] || 2;
    return steps / (bars * 16);
  }

  interface StaffNote {
    x: number; // 0-1 position
    width: number; // 0-1 width
    y: number; // 0-100 percentage (0 = top)
    isAccidental: boolean;
    pitch: string;
    isActive: boolean;
  }

  let useBassClef = $derived(['bass', 'bass-electric', 'contrabass', 'tuba'].includes(instrumentType));
  let isDrums = $derived(['drums', 'percussion'].includes(instrumentType));

  let staffNotes = $derived.by(() => {
    if (!notes || notes.length === 0) return [];

    const positions: StaffNote[] = [];

    for (const note of notes) {
      const x = parseTimeToPosition(note.time);
      const width = parseDurationToWidth(note.duration);

      let y: number;
      let isAccidental = false;

      if (isDrums) {
        const drumPositions: Record<string, number> = {
          hihat: 10, openhat: 10, clap: 8, snare: 6, tom: 4, kick: 2
        };
        const staffPos = drumPositions[note.pitch] ?? 6;
        y = 100 - (staffPos / STAFF_POSITIONS) * 100;
      } else if (note.pitch) {
        const midi = pitchToMidi(note.pitch);
        const noteInOctave = midi % 12;
        isAccidental = [1, 3, 6, 8, 10].includes(noteInOctave);
        const staffPos = midiToStaffPosition(midi, useBassClef);
        const clampedPos = Math.max(0, Math.min(STAFF_POSITIONS - 1, staffPos));
        y = 100 - (clampedPos / (STAFF_POSITIONS - 1)) * 100;
      } else {
        y = 50;
      }

      // Check if this note is currently playing
      const noteEnd = x + width;
      const isActive = isPlaying && progress >= x && progress < noteEnd;

      positions.push({ x, width, y, isAccidental, pitch: note.pitch, isActive });
    }

    return positions;
  });

  // Scroll position to keep playhead visible
  let scrollOffset = $derived.by(() => {
    if (!isPlaying) return 0;
    // Start scrolling when playhead reaches 30% of visible area
    const scrollStart = 0.3;
    if (progress > scrollStart) {
      return (progress - scrollStart) * 100;
    }
    return 0;
  });
</script>

<div class="staff-view" style="--color: {instrumentColor}">
  <div class="staff-scroll" style="transform: translateX(-{scrollOffset}%)">
    <!-- Staff lines -->
    <svg class="staff-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
      {#if !isDrums}
        {#each [20, 35, 50, 65, 80] as lineY}
          <line x1="0" y1={lineY} x2="100" y2={lineY} class="staff-line" />
        {/each}
      {:else}
        {#each [30, 50, 70] as lineY}
          <line x1="0" y1={lineY} x2="100" y2={lineY} class="staff-line drum-line" />
        {/each}
      {/if}

      <!-- Bar lines -->
      {#each Array(bars + 1) as _, i}
        <line
          x1={i * (100 / bars)}
          y1="10"
          x2={i * (100 / bars)}
          y2="90"
          class="bar-line"
        />
      {/each}
    </svg>

    <!-- Notes -->
    <div class="notes-layer">
      {#each staffNotes as note}
        <div
          class="note"
          class:active={note.isActive}
          class:accidental={note.isAccidental}
          style="
            left: {note.x * 100}%;
            top: {note.y}%;
            width: {Math.max(note.width * 100, 2)}%;
          "
        >
          <span class="note-label">{note.pitch}</span>
        </div>
      {/each}
    </div>

    <!-- Playhead -->
    {#if isPlaying}
      <div class="playhead" style="left: {progress * 100}%"></div>
    {/if}
  </div>
</div>

<style>
  .staff-view {
    width: 100%;
    height: 80px;
    background: #1a1a2e;
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    position: relative;
  }

  .staff-scroll {
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    transition: transform 0.1s linear;
  }

  .staff-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .staff-line {
    stroke: rgba(255, 255, 255, 0.2);
    stroke-width: 0.5;
  }

  .staff-line.drum-line {
    stroke: rgba(255, 255, 255, 0.15);
    stroke-dasharray: 2 2;
  }

  .bar-line {
    stroke: rgba(255, 255, 255, 0.3);
    stroke-width: 0.5;
  }

  .notes-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .note {
    position: absolute;
    height: 12px;
    margin-top: -6px;
    background: var(--color);
    border-radius: 6px;
    opacity: 0.7;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.1s, transform 0.1s, box-shadow 0.1s;
  }

  .note.active {
    opacity: 1;
    transform: scale(1.2);
    box-shadow: 0 0 12px var(--color);
    z-index: 10;
  }

  .note.accidental {
    filter: brightness(0.8);
  }

  .note-label {
    font-size: 0.5rem;
    color: white;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    white-space: nowrap;
    overflow: hidden;
  }

  .playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
    z-index: 20;
  }
</style>
