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

  // Convert notes to a grid visualization (8 columns x 4 rows)
  const GRID_COLS = 8;
  const GRID_ROWS = 4;

  // Per-instrument MIDI note ranges for precise visualization
  // [lowNote, highNote] in MIDI note numbers (C4 = 60)
  const INSTRUMENT_RANGES: Record<string, [number, number]> = {
    bass: [28, 48],      // E1 to C3 (bass range)
    keys: [48, 72],      // C3 to C5
    lead: [60, 84],      // C4 to C6
    pad: [48, 72],       // C3 to C5
    pluck: [48, 84],     // C3 to C6
    strings: [48, 72],   // C3 to C5
    organ: [48, 72],     // C3 to C5
    choir: [48, 72],     // C3 to C5
    epiano: [48, 72],    // C3 to C5
    kalimba: [60, 96],   // C4 to C7 (bright, high range)
    drums: [0, 0],       // Special handling
    percussion: [0, 0],  // Special handling
  };

  const NOTE_TO_MIDI: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };

  function pitchToMidi(pitch: string): number {
    const match = pitch.match(/([A-G]#?)(\d)/);
    if (!match) return 60;
    const noteName = match[1];
    const octave = parseInt(match[2]);
    return (octave + 1) * 12 + NOTE_TO_MIDI[noteName];
  }

  function getVisualizationGrid(): boolean[][] {
    const grid: boolean[][] = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(false));
    if (!notes || notes.length === 0) return grid;

    const totalSteps = bars * 16;
    const stepsPerCol = totalSteps / GRID_COLS;
    const [lowNote, highNote] = INSTRUMENT_RANGES[instrumentType] || [48, 72];
    const noteRange = highNote - lowNote;

    for (const note of notes) {
      const timeParts = note.time.split(':').map(Number);
      const bar = timeParts[0] || 0;
      const beat = timeParts[1] || 0;
      const sixteenth = timeParts[2] || 0;
      const step = bar * 16 + beat * 4 + sixteenth;

      const col = Math.min(Math.floor(step / stepsPerCol), GRID_COLS - 1);

      let row = 1;
      if (note.pitch) {
        if (['kick', 'snare', 'hihat', 'openhat', 'tom', 'clap'].includes(note.pitch)) {
          const drumMap: Record<string, number> = { kick: 3, snare: 2, tom: 2, clap: 1, hihat: 0, openhat: 0 };
          row = drumMap[note.pitch] ?? 1;
        } else {
          const midi = pitchToMidi(note.pitch);
          const normalized = (midi - lowNote) / noteRange;
          row = Math.max(0, Math.min(GRID_ROWS - 1, GRID_ROWS - 1 - Math.floor(normalized * GRID_ROWS)));
        }
      }

      grid[row][col] = true;
    }

    return grid;
  }

  let visualGrid = $derived(getVisualizationGrid());

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
    <div class="note-grid">
      {#each visualGrid as row, rowIdx}
        {#each row as hasNote, colIdx}
          <div class="note-dot" class:active={hasNote}></div>
        {/each}
      {/each}
    </div>
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

  .note-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 2px;
    width: 70%;
    height: 70%;
    z-index: 1;
    pointer-events: none;
  }

  .note-dot {
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.15);
  }

  .note-dot.active {
    background: rgba(255, 255, 255, 0.7);
  }

  .cell.active .note-dot.active {
    background: #4ade80;
  }

  .cell.queued .note-dot.active {
    background: #fbbf24;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
</style>
