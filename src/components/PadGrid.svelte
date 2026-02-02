<script lang="ts">
  import { padConfig, playMode } from '../lib/stores';
  import { padPlayer, initAudio } from '../lib/audio';
  import { genre, musicalKey, scale } from '../lib/stores';
  import type { InstrumentType } from '../lib/types';
  import PadCell from './PadCell.svelte';

  const INSTRUMENT_COLORS: Record<string, string> = {
    // Synth instruments
    drums: '#e11d48',
    percussion: '#db2777',
    bass: '#7c3aed',
    keys: '#2563eb',
    lead: '#0891b2',
    pad: '#059669',
    pluck: '#d97706',
    strings: '#9333ea',
    organ: '#be185d',
    choir: '#6366f1',
    epiano: '#0d9488',
    kalimba: '#ca8a04',
    // Sampled instruments
    piano: '#1e40af',
    'guitar-acoustic': '#b45309',
    'guitar-electric': '#dc2626',
    'bass-electric': '#4c1d95',
    violin: '#7e22ce',
    cello: '#6d28d9',
    contrabass: '#4338ca',
    harp: '#c2410c',
    trumpet: '#eab308',
    trombone: '#f59e0b',
    'french-horn': '#d97706',
    tuba: '#92400e',
    saxophone: '#f97316',
    flute: '#06b6d4',
    clarinet: '#0891b2',
    bassoon: '#0e7490',
    'organ-sampled': '#a21caf',
    harmonium: '#c026d3',
    xylophone: '#16a34a',
  };

  // Grouped instruments for better organization
  const instrumentGroups: { label: string; instruments: Array<Exclude<InstrumentType, 'drums' | 'percussion'>> }[] = [
    {
      label: 'Synths',
      instruments: ['keys', 'bass', 'lead', 'pad', 'pluck', 'strings', 'organ', 'choir', 'epiano', 'kalimba'],
    },
    {
      label: 'Piano & Keys',
      instruments: ['piano', 'organ-sampled', 'harmonium'],
    },
    {
      label: 'Guitars',
      instruments: ['guitar-acoustic', 'guitar-electric', 'bass-electric'],
    },
    {
      label: 'Strings',
      instruments: ['violin', 'cello', 'contrabass', 'harp'],
    },
    {
      label: 'Brass',
      instruments: ['trumpet', 'trombone', 'french-horn', 'tuba'],
    },
    {
      label: 'Woodwinds',
      instruments: ['flute', 'clarinet', 'saxophone', 'bassoon'],
    },
    {
      label: 'Percussion',
      instruments: ['xylophone'],
    },
  ];

  function formatInstrumentName(name: string): string {
    return name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .replace('Epiano', 'E-Piano')
      .replace('Organ Sampled', 'Organ (Sampled)');
  }

  let currentInstrument = $derived($padConfig.instrument);
  let baseOctave = $derived($padConfig.baseOctave);
  let rows = $derived($padConfig.rows);
  let isLoading = $state(false);

  // Colors for each row (matching grid mode's variety)
  const ROW_COLORS = [
    '#0891b2', // cyan
    '#2563eb', // blue
    '#7c3aed', // purple
    '#db2777', // pink
    '#dc2626', // red
    '#d97706', // orange
  ];

  function getRowColor(row: number): string {
    return ROW_COLORS[row % ROW_COLORS.length];
  }

  // Columns = number of notes in the scale
  let cols = $derived(padPlayer.getScaleLength($scale));

  // Check loading state periodically when instrument changes
  $effect(() => {
    currentInstrument; // Track this dependency
    const checkLoading = () => {
      isLoading = padPlayer.isLoading();
      if (isLoading) {
        setTimeout(checkLoading, 100);
      }
    };
    checkLoading();
  });

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
        {#each instrumentGroups as group}
          <optgroup label={group.label}>
            {#each group.instruments as inst}
              <option value={inst}>{formatInstrumentName(inst)}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
    </label>

    <div class="octave-control">
      <span>Octave: {baseOctave}</span>
      <button onclick={() => handleOctaveChange(-1)} disabled={baseOctave <= 1}>-</button>
      <button onclick={() => handleOctaveChange(1)} disabled={baseOctave >= 6}>+</button>
    </div>

    {#if isLoading}
      <span class="loading">Loading samples...</span>
    {/if}
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
            color={getRowColor(row)}
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
    max-width: 180px;
  }

  select optgroup {
    background: #1a1a2e;
    color: #888;
    font-weight: 600;
    padding: 0.25rem;
  }

  select option {
    background: #2a2a4e;
    color: #fff;
    padding: 0.25rem;
  }

  .loading {
    color: #f59e0b;
    font-size: 0.75rem;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
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
    width: 44px;
    height: 44px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.25rem;
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
    gap: 0.5rem;
    padding: 1rem 0;
  }

  .octave-label {
    height: 80px;
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
    grid-template-columns: repeat(var(--cols), minmax(0, 80px));
    grid-template-rows: repeat(var(--rows), minmax(0, 80px));
    gap: 0.5rem;
    padding: 1rem;
    background: #1a1a2e;
    border-radius: 12px;
    border: 1px solid #333;
  }

  .pad-footer {
    text-align: center;
  }

  .instructions {
    color: #666;
    font-size: 0.75rem;
  }
</style>
