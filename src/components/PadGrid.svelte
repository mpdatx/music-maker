<script lang="ts">
  import { padConfig, playMode } from '../lib/stores';
  import { padPlayer, initAudio } from '../lib/audio';
  import { genre, musicalKey, scale } from '../lib/stores';
  import type { InstrumentType } from '../lib/types';
  import PadCell from './PadCell.svelte';

  const melodicInstruments: Array<Exclude<InstrumentType, 'drums' | 'percussion'>> = ['keys', 'bass', 'lead', 'pad', 'pluck', 'strings', 'organ', 'choir', 'epiano', 'kalimba'];

  let currentInstrument = $derived($padConfig.instrument);
  let baseOctave = $derived($padConfig.baseOctave);
  let rows = $derived($padConfig.rows);

  // Columns = number of notes in the scale
  let cols = $derived(padPlayer.getScaleLength($scale));

  // Update pad player when settings change
  $effect(() => {
    padPlayer.setInstrument(currentInstrument);
  });

  $effect(() => {
    padPlayer.setGenre($genre);
  });

  function getNoteForCell(row: number, col: number): string {
    return padPlayer.getNoteForPosition(row, col, $musicalKey, $scale, baseOctave, rows);
  }

  function getOctaveLabel(row: number): number {
    return baseOctave + (rows - 1 - row);
  }

  async function handlePress(row: number, col: number) {
    await initAudio();
    const note = getNoteForCell(row, col);
    padPlayer.playNote(note);
  }

  function handleRelease(row: number, col: number) {
    const note = getNoteForCell(row, col);
    padPlayer.releaseNote(note);
  }

  function handleInstrumentChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as Exclude<InstrumentType, 'drums' | 'percussion'>;
    padConfig.setInstrument(value);
  }

  function handleOctaveChange(delta: number) {
    const newOctave = Math.max(1, Math.min(5, baseOctave + delta));
    padConfig.setBaseOctave(newOctave);
  }

  function switchToLoopMode() {
    padPlayer.releaseAll();
    playMode.set('loop');
  }
</script>

<div class="pad-grid-container">
  <div class="pad-controls">
    <button class="mode-switch" onclick={switchToLoopMode}>
      Switch to Loop Mode
    </button>

    <label>
      Instrument:
      <select value={currentInstrument} onchange={handleInstrumentChange}>
        {#each melodicInstruments as inst}
          <option value={inst}>{inst.charAt(0).toUpperCase() + inst.slice(1)}</option>
        {/each}
      </select>
    </label>

    <div class="octave-control">
      <span>Octave: {baseOctave}</span>
      <button onclick={() => handleOctaveChange(-1)} disabled={baseOctave <= 1}>-</button>
      <button onclick={() => handleOctaveChange(1)} disabled={baseOctave >= 6}>+</button>
    </div>

    <span class="hint">Key: {$musicalKey} {$scale}</span>
  </div>

  <div class="pad-grid-wrapper">
    <div class="octave-labels">
      {#each Array(rows) as _, row}
        <div class="octave-label">Oct {getOctaveLabel(row)}</div>
      {/each}
    </div>
    <div class="pad-grid" style="--cols: {cols}; --rows: {rows}">
      {#each Array(rows) as _, row}
        {#each Array(cols) as _, col}
          {@const note = getNoteForCell(row, col)}
          <PadCell
            {note}
            isInScale={true}
            onPress={() => handlePress(row, col)}
            onRelease={() => handleRelease(row, col)}
          />
        {/each}
      {/each}
    </div>
  </div>

  <div class="pad-footer">
    <span class="instructions">Click or touch pads to play. Drag across pads for glissando.</span>
  </div>
</div>

<style>
  .pad-grid-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .pad-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .mode-switch {
    background: #3a3a5e;
    border: 1px solid #555;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .mode-switch:hover {
    background: #4a4a6e;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ccc;
    font-size: 0.875rem;
  }

  select {
    background: #2a2a4e;
    border: 1px solid #444;
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .octave-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ccc;
    font-size: 0.875rem;
  }

  .octave-control button {
    background: #2a2a4e;
    border: 1px solid #444;
    color: #fff;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  .octave-control button:hover:not(:disabled) {
    background: #3a3a5e;
  }

  .octave-control button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hint {
    color: #666;
    font-size: 0.75rem;
    margin-left: auto;
  }

  .pad-grid-wrapper {
    display: flex;
    gap: 0.5rem;
  }

  .octave-labels {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 1rem 0;
  }

  .octave-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0.5rem;
    font-size: 0.7rem;
    color: #666;
    font-weight: 500;
    min-width: 45px;
  }

  .pad-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    gap: 6px;
    padding: 1rem;
    background: #1a1a2e;
    border-radius: 12px;
    border: 1px solid #333;
    flex: 1;
  }

  .pad-footer {
    text-align: center;
  }

  .instructions {
    color: #666;
    font-size: 0.75rem;
  }
</style>
