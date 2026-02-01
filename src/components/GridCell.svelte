<script lang="ts">
  import type { LoopState, Note, InstrumentType } from '../lib/types';

  let {
    hasLoop = false,
    state = 'inactive' as LoopState,
    progress = 0,
    instrumentColor = '#3a3a5e',
    notes = [] as Note[],
    bars = 2,
    instrumentType = 'keys' as InstrumentType,
    ontap,
    ondoubletap,
    oncontextmenu: oncontextmenuprop
  }: {
    hasLoop?: boolean;
    state?: LoopState;
    progress?: number;
    instrumentColor?: string;
    notes?: Note[];
    bars?: number;
    instrumentType?: InstrumentType;
    ontap?: () => void;
    ondoubletap?: () => void;
    oncontextmenu?: () => void;
  } = $props();

  // Staff visualization constants
  const STAFF_LINES = 5;
  const STAFF_POSITIONS = 12; // Lines + spaces + some ledger room

  const NOTE_TO_MIDI: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };

  // Diatonic note positions (ignoring sharps/flats for staff placement)
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

  // Convert MIDI note to staff position (0 = bottom, higher = up)
  // Uses treble clef for most instruments, bass clef for bass
  function midiToStaffPosition(midi: number, useBassClef: boolean): number {
    const noteInOctave = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const diatonicPos = DIATONIC_POSITION[noteInOctave];

    if (useBassClef) {
      // Bass clef: Middle line (line 3) = D3 (MIDI 50)
      // D3 = octave 3, diatonic pos 1
      const d3Position = 3 * 7 + 1;
      const notePosition = octave * 7 + diatonicPos;
      return (notePosition - d3Position) + 6; // 6 = middle of our 12 positions
    } else {
      // Treble clef: Middle line (line 3) = B4 (MIDI 71)
      // B4 = octave 4, diatonic pos 6
      const b4Position = 4 * 7 + 6;
      const notePosition = octave * 7 + diatonicPos;
      return (notePosition - b4Position) + 6; // 6 = middle of our 12 positions
    }
  }

  interface NotePosition {
    x: number; // 0-100 percentage
    y: number; // 0-100 percentage (0 = top)
    isAccidental: boolean;
  }

  function getStaffNotes(): NotePosition[] {
    if (!notes || notes.length === 0) return [];

    const useBassClef = ['bass', 'bass-electric', 'contrabass', 'tuba'].includes(instrumentType);
    const isDrums = ['drums', 'percussion'].includes(instrumentType);
    const totalSteps = bars * 16;
    const positions: NotePosition[] = [];

    for (const note of notes) {
      const timeParts = note.time.split(':').map(Number);
      const bar = timeParts[0] || 0;
      const beat = timeParts[1] || 0;
      const sixteenth = timeParts[2] || 0;
      const step = bar * 16 + beat * 4 + sixteenth;

      const x = (step / totalSteps) * 100;

      let y: number;
      let isAccidental = false;

      if (isDrums) {
        // Map drum sounds to staff positions
        const drumPositions: Record<string, number> = {
          hihat: 10, openhat: 10, clap: 8, snare: 6, tom: 4, kick: 2
        };
        const staffPos = drumPositions[note.pitch] ?? 6;
        y = 100 - (staffPos / STAFF_POSITIONS) * 100;
      } else if (note.pitch) {
        const midi = pitchToMidi(note.pitch);
        const noteInOctave = midi % 12;
        isAccidental = [1, 3, 6, 8, 10].includes(noteInOctave); // C#, D#, F#, G#, A#
        const staffPos = midiToStaffPosition(midi, useBassClef);
        // Clamp to visible range
        const clampedPos = Math.max(0, Math.min(STAFF_POSITIONS - 1, staffPos));
        y = 100 - (clampedPos / (STAFF_POSITIONS - 1)) * 100;
      } else {
        y = 50;
      }

      positions.push({ x, y, isAccidental });
    }

    return positions;
  }

  let staffNotes = $derived(getStaffNotes());
  let isDrums = $derived(['drums', 'percussion'].includes(instrumentType));

  let lastTapTime = 0;
  const DOUBLE_TAP_DELAY = 300;

  function handleClick() {
    const now = Date.now();
    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      ondoubletap?.();
      lastTapTime = 0;
    } else {
      lastTapTime = now;
      setTimeout(() => {
        if (lastTapTime !== 0 && Date.now() - lastTapTime >= DOUBLE_TAP_DELAY) {
          ontap?.();
          lastTapTime = 0;
        }
      }, DOUBLE_TAP_DELAY);
    }
  }

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    oncontextmenuprop?.();
  }

  // Calculate progress ring gradient
  function getProgressStyle(p: number): string {
    const degrees = p * 360;
    return `conic-gradient(#4ade80 ${degrees}deg, transparent ${degrees}deg)`;
  }
</script>

<button
  class="cell"
  class:has-loop={hasLoop}
  class:active={state === 'active'}
  class:queued={state === 'queued'}
  class:stopping={state === 'stopping'}
  style="--instrument-color: {instrumentColor}"
  onclick={handleClick}
  oncontextmenu={handleContextMenu}
  title="Click: play/stop | Double-click: queue | Right-click: edit"
>
  {#if state === 'active'}
    <div class="progress-ring" style="background: {getProgressStyle(progress)}"></div>
  {/if}
  {#if hasLoop && notes.length > 0}
    <svg class="staff-view" viewBox="0 0 100 100" preserveAspectRatio="none">
      <!-- Staff lines -->
      {#if !isDrums}
        {#each [20, 35, 50, 65, 80] as lineY}
          <line x1="0" y1={lineY} x2="100" y2={lineY} class="staff-line" />
        {/each}
      {:else}
        <!-- Simplified lines for drums -->
        {#each [30, 50, 70] as lineY}
          <line x1="0" y1={lineY} x2="100" y2={lineY} class="staff-line drum-line" />
        {/each}
      {/if}
      <!-- Notes -->
      {#each staffNotes as note}
        <ellipse
          cx={note.x}
          cy={note.y}
          rx="4"
          ry="3"
          class="note-head"
          class:accidental={note.isAccidental}
        />
      {/each}
    </svg>
  {:else if hasLoop}
    <span class="indicator"></span>
  {/if}
</button>

<style>
  .cell {
    width: 100%;
    aspect-ratio: 1;
    background: var(--instrument-color);
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .cell:hover {
    filter: brightness(1.2);
  }

  .cell.has-loop {
    border-color: rgba(255, 255, 255, 0.3);
  }

  .cell.active {
    border-color: #4ade80;
    box-shadow: 0 0 12px rgba(74, 222, 128, 0.4);
  }

  .cell.queued {
    border-color: #fbbf24;
    animation: blink 0.5s ease-in-out infinite;
  }

  .cell.stopping {
    border-color: #f87171;
    opacity: 0.7;
  }

  .progress-ring {
    position: absolute;
    inset: 0;
    border-radius: 6px;
    opacity: 0.4;
    pointer-events: none;
  }

  .indicator {
    width: 12px;
    height: 12px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    z-index: 1;
  }

  .active .indicator {
    background: #4ade80;
  }

  .queued .indicator {
    background: #fbbf24;
  }

  .staff-view {
    width: 80%;
    height: 80%;
    z-index: 1;
    pointer-events: none;
  }

  .staff-line {
    stroke: rgba(255, 255, 255, 0.25);
    stroke-width: 0.5;
  }

  .staff-line.drum-line {
    stroke: rgba(255, 255, 255, 0.15);
    stroke-dasharray: 2 2;
  }

  .note-head {
    fill: rgba(255, 255, 255, 0.8);
  }

  .note-head.accidental {
    fill: rgba(255, 200, 100, 0.8);
  }

  .cell.active .note-head {
    fill: #4ade80;
  }

  .cell.active .note-head.accidental {
    fill: #86efac;
  }

  .cell.queued .note-head {
    fill: #fbbf24;
  }

  .cell.queued .note-head.accidental {
    fill: #fcd34d;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
</style>
