<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Track, LoopState } from '../lib/types';
  import GridCell from './GridCell.svelte';
  import NoteButton from './NoteButton.svelte';
  import { getInstrumentIcon, isSampledInstrument } from '../lib/icons';
  import { getScaleNotes, noteToMidi } from '../lib/generators/theory';
  import { SAMPLED_INSTRUMENT_RANGES } from '../lib/generators';
  import { musicalKey, scale } from '../lib/stores';

  let {
    track,
    allCellStates,
    allCellProgress,
    loops,
    onNotePress,
    onNoteRelease
  }: {
    track: Track;
    allCellStates: Record<string, LoopState>;
    allCellProgress: Record<string, number>;
    loops: Record<string, any>;
    onNotePress?: (trackId: string, note: string) => void;
    onNoteRelease?: (trackId: string, note: string) => void;
  } = $props();

  let isSampled = $derived(isSampledInstrument(track.type));

  // Per-row keys mode toggle with animation states
  let showKeys = $state(false);
  let keysFlipped = $state(false);

  function toggleKeysMode() {
    if (showKeys) {
      // Flip out, then hide
      keysFlipped = false;
      setTimeout(() => {
        showKeys = false;
      }, 300); // Match CSS transition duration
    } else {
      // Show, then flip in
      showKeys = true;
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        keysFlipped = true;
      }, 10);
    }
  }

  // Get notes for keys mode (one octave of the current scale)
  let scaleNotes = $derived(getScaleNotes($musicalKey, $scale, 4));

  // Check if a note is playable for the current instrument (within range)
  // Tone.Sampler pitch-shifts between samples, so any note in range is playable
  function isNoteAvailable(note: string): boolean {
    const range = SAMPLED_INSTRUMENT_RANGES[track.type];
    if (!range) return true; // Synth instruments have no restrictions
    const midi = noteToMidi(note);
    const [minMidi, maxMidi] = range;
    return midi >= minMidi && midi <= maxMidi;
  }

  // Glissando state
  let isDragging = $state(false);
  let activeNote = $state<string | null>(null);

  function handleNoteStart(note: string) {
    if (activeNote && activeNote !== note) {
      onNoteRelease?.(track.id, activeNote);
    }
    activeNote = note;
    isDragging = true;
    onNotePress?.(track.id, note);
  }

  function handleNoteEnd(note: string) {
    // Only release if this is the active note and we're not dragging to another
    if (activeNote === note && !isDragging) {
      activeNote = null;
      onNoteRelease?.(track.id, note);
    }
  }

  function handleNoteEnter(note: string) {
    if (isDragging && activeNote !== note) {
      if (activeNote) {
        onNoteRelease?.(track.id, activeNote);
      }
      activeNote = note;
      onNotePress?.(track.id, note);
    }
  }

  function handleDragEnd() {
    if (activeNote) {
      onNoteRelease?.(track.id, activeNote);
      activeNote = null;
    }
    isDragging = false;
  }

  const dispatch = createEventDispatcher<{
    cellTap: { trackId: string; col: number };
    cellDoubleTap: { trackId: string; col: number };
    cellContextMenu: { trackId: string; col: number };
    mute: { trackId: string };
    solo: { trackId: string };
    volume: { trackId: string; volume: number };
  }>();

  function handleVolumeChange(e: Event) {
    const value = parseFloat((e.target as HTMLInputElement).value);
    dispatch('volume', { trackId: track.id, volume: value });
  }

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

  function getCellState(col: number): LoopState {
    const key = `${track.id}:${col}`;
    return allCellStates[key] ?? 'inactive';
  }

  function hasLoop(col: number): boolean {
    const loopId = track.cells.find(c => c.col === col)?.loopId;
    return loopId != null && loops[loopId] != null;
  }

  function getLoop(col: number) {
    const loopId = track.cells.find(c => c.col === col)?.loopId;
    return loopId ? loops[loopId] : null;
  }

  function getCellProgress(col: number): number {
    const key = `${track.id}:${col}`;
    return allCellProgress[key] ?? 0;
  }
</script>

<div class="track-row" class:muted={track.muted}>
  <div class="track-header">
    <span class="track-icon" style="color: {INSTRUMENT_COLORS[track.type] ?? '#888'}">
      {@html getInstrumentIcon(track.type)}
    </span>
    <div class="track-label">
      <div class="track-name-row">
        {#if isSampled}
          <span class="sampled-badge" title="Sampled instrument" style="color: {INSTRUMENT_COLORS[track.type] ?? '#888'}">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 8a1.5 1.5 0 1 1 3 0v4a1.5 1.5 0 0 1-3 0V8zm4.5-2a1.5 1.5 0 0 1 3 0v6a1.5 1.5 0 0 1-3 0V6zm4.5-2a1.5 1.5 0 0 1 3 0v8a1.5 1.5 0 0 1-3 0V4z"/>
            </svg>
          </span>
        {/if}
        <span class="track-name">{track.name}</span>
      </div>
      <div class="track-controls">
        <button
          class="mute-btn"
          class:active={track.muted}
          onclick={() => dispatch('mute', { trackId: track.id })}
        >
          M
        </button>
        <button
          class="solo-btn"
          class:active={track.solo}
          onclick={() => dispatch('solo', { trackId: track.id })}
        >
          S
        </button>
        <button
          class="keys-btn"
          class:active={showKeys}
          onclick={toggleKeysMode}
          title="Toggle keys mode"
        >
          K
        </button>
        <input
          type="range"
          class="volume-slider"
          min="0"
          max="1"
          step="0.01"
          value={track.volume}
          oninput={handleVolumeChange}
          title="Volume: {Math.round(track.volume * 100)}%"
        />
      </div>
    </div>
  </div>

  <div class="cells">
    {#if showKeys}
      {#each scaleNotes as note, i (note)}
        {@const available = isNoteAvailable(note)}
        <NoteButton
          {note}
          color={INSTRUMENT_COLORS[track.type] ?? '#3a3a5e'}
          flipped={keysFlipped}
          index={i}
          active={activeNote === note}
          dragging={isDragging}
          disabled={!available}
          onpress={() => available && handleNoteStart(note)}
          onrelease={() => available && handleNoteEnd(note)}
          onenter={() => available && handleNoteEnter(note)}
          ondragend={handleDragEnd}
        />
      {/each}
    {:else}
      {#each track.cells as cell (cell.col)}
        {@const loop = getLoop(cell.col)}
        <GridCell
          hasLoop={hasLoop(cell.col)}
          state={getCellState(cell.col)}
          progress={getCellProgress(cell.col)}
          instrumentColor={INSTRUMENT_COLORS[track.type] ?? '#3a3a5e'}
          instrumentType={track.type}
          notes={loop?.notes ?? []}
          bars={loop?.bars ?? 2}
          ontap={() => dispatch('cellTap', { trackId: track.id, col: cell.col })}
          ondoubletap={() => dispatch('cellDoubleTap', { trackId: track.id, col: cell.col })}
          oncontextmenu={() => dispatch('cellContextMenu', { trackId: track.id, col: cell.col })}
        />
      {/each}
    {/if}
  </div>
</div>

<style>
  .track-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    transition: opacity 0.2s ease;
  }

  .track-row.muted {
    opacity: 0.4;
  }

  .track-row.muted .track-header {
    filter: grayscale(0.8);
  }

  .track-header {
    width: 160px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .track-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .track-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .track-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
  }

  .track-name-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .sampled-badge {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    opacity: 0.9;
  }

  .sampled-badge svg {
    width: 100%;
    height: 100%;
  }

  .track-name {
    font-size: 0.85rem;
    font-weight: 500;
    color: #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-controls {
    display: flex;
    gap: 0.25rem;
  }

  .mute-btn, .solo-btn, .keys-btn {
    width: 24px;
    height: 24px;
    border: 1px solid #444;
    background: #2a2a4e;
    color: #888;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .mute-btn:hover, .solo-btn:hover, .keys-btn:hover {
    background: #3a3a5e;
  }

  .mute-btn.active {
    background: #dc2626;
    color: #fff;
    border-color: #dc2626;
  }

  .solo-btn.active {
    background: #eab308;
    color: #000;
    border-color: #eab308;
  }

  .keys-btn.active {
    background: #06b6d4;
    color: #fff;
    border-color: #06b6d4;
  }

  .volume-slider {
    width: 50px;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: #444;
    border-radius: 2px;
    cursor: pointer;
    margin-left: 0.25rem;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    background: #888;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.15s;
  }

  .volume-slider::-webkit-slider-thumb:hover {
    background: #aaa;
  }

  .volume-slider::-moz-range-thumb {
    width: 10px;
    height: 10px;
    background: #888;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  .volume-slider::-moz-range-thumb:hover {
    background: #aaa;
  }

  .cells {
    display: flex;
    gap: 0.5rem;
    flex: 1;
  }

  .cells :global(.cell) {
    flex: 1;
    max-width: 80px;
  }
</style>
