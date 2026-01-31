<script lang="ts">
  import type { Loop, Note } from '../lib/types';

  let {
    loop,
    onUpdate
  }: {
    loop: Loop;
    onUpdate: (notes: Note[]) => void;
  } = $props();

  const DRUM_SOUNDS = [
    { id: 'kick', name: 'Kick', key: 'C1' },
    { id: 'snare', name: 'Snare', key: 'D1' },
    { id: 'hihat', name: 'Hi-Hat', key: 'F#1' },
    { id: 'openhat', name: 'Open Hat', key: 'A#1' },
    { id: 'clap', name: 'Clap', key: 'E1' },
    { id: 'tom', name: 'Tom', key: 'G1' },
  ];

  const STEPS_PER_BAR = 16;
  let totalSteps = $derived(loop.bars * STEPS_PER_BAR);

  // Convert notes to a grid format for easier editing
  function notesToGrid(notes: Note[]): Map<string, Set<number>> {
    const grid = new Map<string, Set<number>>();
    DRUM_SOUNDS.forEach(d => grid.set(d.id, new Set()));

    for (const note of notes) {
      const drum = DRUM_SOUNDS.find(d => d.key === note.pitch);
      if (drum) {
        // Parse time like "0:0:0" to step number
        const step = timeToStep(note.time);
        grid.get(drum.id)?.add(step);
      }
    }

    return grid;
  }

  function timeToStep(time: string): number {
    const parts = time.split(':').map(Number);
    const bars = parts[0];
    const beats = parts[1];
    const sixteenths = parts[2];
    return bars * 16 + beats * 4 + sixteenths;
  }

  function stepToTime(step: number): string {
    const bars = Math.floor(step / 16);
    const beats = Math.floor((step % 16) / 4);
    const sixteenths = step % 4;
    return `${bars}:${beats}:${sixteenths}`;
  }

  // Convert grid back to notes
  function gridToNotes(grid: Map<string, Set<number>>): Note[] {
    const notes: Note[] = [];

    for (const drum of DRUM_SOUNDS) {
      const steps = grid.get(drum.id);
      if (steps) {
        for (const step of steps) {
          notes.push({
            pitch: drum.key,
            time: stepToTime(step),
            duration: '16n',
            velocity: 0.8,
          });
        }
      }
    }

    // Sort by time
    notes.sort((a, b) => timeToStep(a.time) - timeToStep(b.time));
    return notes;
  }

  let grid = $derived(notesToGrid(loop.notes));

  function toggleStep(drumId: string, step: number) {
    const newGrid = new Map(grid);
    const steps = new Set(newGrid.get(drumId));

    if (steps.has(step)) {
      steps.delete(step);
    } else {
      steps.add(step);
    }

    newGrid.set(drumId, steps);
    onUpdate(gridToNotes(newGrid));
  }

  function isStepActive(drumId: string, step: number): boolean {
    return grid.get(drumId)?.has(step) ?? false;
  }

  function clearAll() {
    onUpdate([]);
  }

  function fillEvery(drumId: string, interval: number) {
    const newGrid = new Map(grid);
    const steps = new Set(newGrid.get(drumId));

    for (let i = 0; i < totalSteps; i += interval) {
      steps.add(i);
    }

    newGrid.set(drumId, steps);
    onUpdate(gridToNotes(newGrid));
  }
</script>

<div class="drum-sequencer">
  <div class="toolbar">
    <span class="title">Drum Sequencer ({loop.bars} bars)</span>
    <button class="clear-btn" onclick={clearAll}>Clear All</button>
  </div>

  <div class="grid-container">
    <div class="grid">
      <!-- Header row with beat numbers -->
      <div class="row header-row">
        <div class="label"></div>
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
        <div class="actions"></div>
      </div>

      <!-- Drum rows -->
      {#each DRUM_SOUNDS as drum}
        <div class="row">
          <div class="label">{drum.name}</div>
          {#each Array(totalSteps) as _, step}
            <button
              class="step"
              class:active={isStepActive(drum.id, step)}
              class:downbeat={step % 4 === 0}
              class:bar-start={step % 16 === 0}
              onclick={() => toggleStep(drum.id, step)}
              aria-label="{drum.name} step {step + 1}"
            ></button>
          {/each}
          <div class="actions">
            <button class="fill-btn" onclick={() => fillEvery(drum.id, 4)} title="Fill every beat">
              4
            </button>
            <button class="fill-btn" onclick={() => fillEvery(drum.id, 8)} title="Fill every half beat">
              8
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .drum-sequencer {
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
    overflow-x: auto;
  }

  .grid {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: fit-content;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .header-row {
    margin-bottom: 4px;
  }

  .label {
    width: 70px;
    flex-shrink: 0;
    font-size: 0.75rem;
    color: #888;
    text-align: right;
    padding-right: 8px;
  }

  .step-header {
    width: 24px;
    height: 16px;
    font-size: 0.625rem;
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

  .step {
    width: 24px;
    height: 24px;
    background: #2a2a4e;
    border: 1px solid #333;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .step:hover {
    background: #3a3a5e;
  }

  .step.downbeat {
    border-left-color: #555;
  }

  .step.bar-start {
    border-left: 2px solid #666;
  }

  .step.active {
    background: #e11d48;
    border-color: #e11d48;
  }

  .step.active:hover {
    background: #f43f5e;
  }

  .actions {
    width: 60px;
    flex-shrink: 0;
    display: flex;
    gap: 2px;
    padding-left: 8px;
  }

  .fill-btn {
    width: 24px;
    height: 24px;
    background: #3a3a5e;
    border: 1px solid #444;
    color: #888;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.625rem;
    font-weight: bold;
  }

  .fill-btn:hover {
    background: #4a4a6e;
    color: #fff;
  }
</style>
