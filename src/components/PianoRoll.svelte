<script lang="ts">
  import type { Loop, Note } from '../lib/types';

  let {
    loop,
    musicalKey,
    scale,
    onUpdate
  }: {
    loop: Loop;
    musicalKey: string;
    scale: string;
    onUpdate: (notes: Note[]) => void;
  } = $props();

  // Piano roll covers 2 octaves
  const BASE_OCTAVE = 3;
  const OCTAVES = 2;
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Generate all notes for the piano roll (high to low)
  const ALL_NOTES: string[] = [];
  for (let oct = BASE_OCTAVE + OCTAVES - 1; oct >= BASE_OCTAVE; oct--) {
    for (let i = NOTE_NAMES.length - 1; i >= 0; i--) {
      ALL_NOTES.push(`${NOTE_NAMES[i]}${oct}`);
    }
  }

  const STEPS_PER_BAR = 16;
  let totalSteps = $derived(loop.bars * STEPS_PER_BAR);

  // Scale degrees for highlighting
  const SCALE_PATTERNS: Record<string, number[]> = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    pentatonic: [0, 2, 4, 7, 9],
  };

  function isInScale(noteName: string): boolean {
    const noteIndex = NOTE_NAMES.indexOf(noteName.replace(/\d/, ''));
    const keyIndex = NOTE_NAMES.indexOf(musicalKey);
    const interval = (noteIndex - keyIndex + 12) % 12;
    return SCALE_PATTERNS[scale]?.includes(interval) ?? false;
  }

  function isBlackKey(noteName: string): boolean {
    return noteName.includes('#');
  }

  function timeToStep(time: string): number {
    const parts = time.split(':').map(Number);
    return parts[0] * 16 + parts[1] * 4 + parts[2];
  }

  function stepToTime(step: number): string {
    const bars = Math.floor(step / 16);
    const beats = Math.floor((step % 16) / 4);
    const sixteenths = step % 4;
    return `${bars}:${beats}:${sixteenths}`;
  }

  function durationToSteps(duration: string): number {
    const durations: Record<string, number> = {
      '16n': 1, '8n': 2, '8n.': 3, '4n': 4, '4n.': 6, '2n': 8, '1n': 16,
    };
    return durations[duration] ?? 1;
  }

  function stepsToDuration(steps: number): string {
    if (steps >= 16) return '1n';
    if (steps >= 8) return '2n';
    if (steps >= 6) return '4n.';
    if (steps >= 4) return '4n';
    if (steps >= 3) return '8n.';
    if (steps >= 2) return '8n';
    return '16n';
  }

  // Convert notes to grid positions
  interface NoteBlock {
    id: string;
    pitch: string;
    startStep: number;
    length: number;
    velocity: number;
  }

  function notesToBlocks(notes: Note[]): NoteBlock[] {
    return notes.map((note, i) => ({
      id: `note-${i}`,
      pitch: note.pitch,
      startStep: timeToStep(note.time),
      length: durationToSteps(note.duration),
      velocity: note.velocity,
    }));
  }

  function blocksToNotes(blocks: NoteBlock[]): Note[] {
    return blocks.map(block => ({
      pitch: block.pitch,
      time: stepToTime(block.startStep),
      duration: stepsToDuration(block.length),
      velocity: block.velocity,
    }));
  }

  let blocks = $derived(notesToBlocks(loop.notes));

  function getNoteAt(pitch: string, step: number): NoteBlock | undefined {
    return blocks.find(b =>
      b.pitch === pitch &&
      step >= b.startStep &&
      step < b.startStep + b.length
    );
  }

  function isNoteStart(pitch: string, step: number): boolean {
    return blocks.some(b => b.pitch === pitch && b.startStep === step);
  }

  function toggleNote(pitch: string, step: number) {
    const existing = getNoteAt(pitch, step);

    if (existing) {
      // Remove the note
      const newBlocks = blocks.filter(b => b !== existing);
      onUpdate(blocksToNotes(newBlocks));
    } else {
      // Add a new note (default 1 step)
      const newBlock: NoteBlock = {
        id: `note-${Date.now()}`,
        pitch,
        startStep: step,
        length: 1,
        velocity: 0.8,
      };
      onUpdate(blocksToNotes([...blocks, newBlock]));
    }
  }

  function extendNote(pitch: string, step: number) {
    // Find note that ends at this step and extend it
    const noteToExtend = blocks.find(b =>
      b.pitch === pitch &&
      b.startStep + b.length === step
    );

    if (noteToExtend) {
      const newBlocks = blocks.map(b =>
        b === noteToExtend ? { ...b, length: b.length + 1 } : b
      );
      onUpdate(blocksToNotes(newBlocks));
    } else {
      // No note to extend, create new one
      toggleNote(pitch, step);
    }
  }

  function clearAll() {
    onUpdate([]);
  }

  let isMouseDown = false;
  let lastPitch = '';
  let lastStep = -1;

  function handleMouseDown(pitch: string, step: number) {
    isMouseDown = true;
    lastPitch = pitch;
    lastStep = step;
    toggleNote(pitch, step);
  }

  function handleMouseEnter(pitch: string, step: number) {
    if (isMouseDown && (pitch !== lastPitch || step !== lastStep)) {
      lastPitch = pitch;
      lastStep = step;
      // Only add if no note exists (painting mode)
      if (!getNoteAt(pitch, step)) {
        extendNote(pitch, step);
      }
    }
  }

  function handleMouseUp() {
    isMouseDown = false;
  }
</script>

<svelte:window on:mouseup={handleMouseUp} />

<div class="piano-roll">
  <div class="toolbar">
    <span class="title">Piano Roll ({loop.bars} bars) - {musicalKey} {scale}</span>
    <button class="clear-btn" onclick={clearAll}>Clear All</button>
  </div>

  <div class="grid-container">
    <div class="grid">
      <!-- Header row with beat numbers -->
      <div class="row header-row">
        <div class="piano-key-spacer"></div>
        {#each Array(totalSteps) as _, step}
          <div
            class="step-header"
            class:downbeat={step % 4 === 0}
            class:bar-start={step % 16 === 0}
          >
            {#if step % 4 === 0}
              {Math.floor(step / 4) + 1}
            {/if}
          </div>
        {/each}
      </div>

      <!-- Note rows -->
      {#each ALL_NOTES as noteName}
        <div class="row" class:black-key={isBlackKey(noteName)}>
          <div
            class="piano-key"
            class:black={isBlackKey(noteName)}
            class:in-scale={isInScale(noteName)}
          >
            {noteName}
          </div>
          {#each Array(totalSteps) as _, step}
            {@const noteBlock = getNoteAt(noteName, step)}
            {@const isStart = isNoteStart(noteName, step)}
            <button
              class="cell"
              class:has-note={noteBlock != null}
              class:note-start={isStart}
              class:downbeat={step % 4 === 0}
              class:bar-start={step % 16 === 0}
              class:in-scale={isInScale(noteName)}
              onmousedown={() => handleMouseDown(noteName, step)}
              onmouseenter={() => handleMouseEnter(noteName, step)}
              aria-label="{noteName} step {step + 1}"
            ></button>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .piano-roll {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    font-weight: 500;
    color: #ccc;
  }

  .clear-btn {
    background: #dc2626;
    border: none;
    color: #fff;
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
  }

  .clear-btn:hover {
    background: #ef4444;
  }

  .grid-container {
    overflow: auto;
    max-height: 400px;
  }

  .grid {
    display: flex;
    flex-direction: column;
    min-width: fit-content;
  }

  .row {
    display: flex;
    align-items: center;
  }

  .row.black-key {
    background: rgba(0, 0, 0, 0.1);
  }

  .header-row {
    position: sticky;
    top: 0;
    background: #1a1a2e;
    z-index: 10;
    margin-bottom: 2px;
  }

  .piano-key-spacer {
    width: 50px;
    flex-shrink: 0;
  }

  .piano-key {
    width: 50px;
    flex-shrink: 0;
    font-size: 0.625rem;
    padding: 0 4px;
    text-align: right;
    color: #666;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .piano-key.black {
    color: #888;
    background: #222;
  }

  .piano-key.in-scale {
    color: #4ade80;
  }

  .step-header {
    width: 20px;
    height: 16px;
    font-size: 0.5rem;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-header.downbeat {
    color: #888;
  }

  .step-header.bar-start {
    color: #aaa;
    font-weight: bold;
  }

  .cell {
    width: 20px;
    height: 16px;
    background: #2a2a4e;
    border: none;
    border-right: 1px solid #222;
    border-bottom: 1px solid #222;
    cursor: crosshair;
    padding: 0;
  }

  .cell:hover {
    background: #3a3a5e;
  }

  .cell.downbeat {
    border-left: 1px solid #444;
  }

  .cell.bar-start {
    border-left: 2px solid #555;
  }

  .cell.in-scale {
    background: #2a2a5e;
  }

  .cell.has-note {
    background: #7c3aed;
  }

  .cell.has-note:hover {
    background: #9333ea;
  }

  .cell.note-start {
    border-left: 2px solid #a855f7;
  }
</style>
