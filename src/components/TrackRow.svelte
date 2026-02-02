<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Track, LoopState, CounterMelodyTechnique } from '../lib/types';
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
    level = 0,
    levelDb = -Infinity,
    peak = 0,
    peakDb = -Infinity,
    onNotePress,
    onNoteRelease,
    onCounterToggle,
    onCounterTechniqueChange,
  }: {
    track: Track;
    allCellStates: Record<string, LoopState>;
    allCellProgress: Record<string, number>;
    loops: Record<string, any>;
    level?: number;
    levelDb?: number;
    peak?: number;
    peakDb?: number;
    onNotePress?: (trackId: string, note: string) => void;
    onNoteRelease?: (trackId: string, note: string) => void;
    onCounterToggle?: (trackId: string) => void;
    onCounterTechniqueChange?: (trackId: string, technique: CounterMelodyTechnique) => void;
  } = $props();

  let isSampled = $derived(isSampledInstrument(track.type));

  // Counter-melody state - all melodic instruments support it (exclude drums/percussion)
  let supportsCounter = $derived(track.type !== 'drums' && track.type !== 'percussion');
  let counterEnabled = $derived(track.counterMelody?.enabled ?? false);
  let counterTechnique = $derived(track.counterMelody?.technique ?? 'rhythmic');

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
    <div class="track-icon-label">
      <span class="track-icon" style="color: {INSTRUMENT_COLORS[track.type] ?? '#888'}">
        {@html getInstrumentIcon(track.type)}
      </span>
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
    </div>
    <div class="track-controls">
      <div class="button-rows">
        <div class="button-row">
          <button
            class="mute-btn"
            class:active={track.muted}
            onclick={() => dispatch('mute', { trackId: track.id })}
            title="Mute"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3z"/>
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          </button>
          <button
            class="solo-btn"
            class:active={track.solo}
            onclick={() => dispatch('solo', { trackId: track.id })}
            title="Solo"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
            </svg>
          </button>
          <button
            class="keys-btn"
            class:active={showKeys}
            onclick={toggleKeysMode}
            title="Toggle keys mode"
          >
            K
          </button>
        </div>
        {#if supportsCounter}
          <div class="button-row counter-row">
            <div class="technique-picker">
              <button
                class="technique-btn"
                class:active={counterEnabled && counterTechnique === 'rhythmic'}
                onclick={() => {
                  if (counterEnabled && counterTechnique === 'rhythmic') {
                    onCounterToggle?.(track.id);
                  } else {
                    if (!counterEnabled) onCounterToggle?.(track.id);
                    onCounterTechniqueChange?.(track.id, 'rhythmic');
                  }
                }}
                title="Rhythmic counter-melody (click again to disable)"
              >
                R
              </button>
              <button
                class="technique-btn"
                class:active={counterEnabled && counterTechnique === 'harmonic'}
                onclick={() => {
                  if (counterEnabled && counterTechnique === 'harmonic') {
                    onCounterToggle?.(track.id);
                  } else {
                    if (!counterEnabled) onCounterToggle?.(track.id);
                    onCounterTechniqueChange?.(track.id, 'harmonic');
                  }
                }}
                title="Harmonic counter-melody (click again to disable)"
              >
                H
              </button>
              <button
                class="technique-btn"
                class:active={counterEnabled && counterTechnique === 'contrary'}
                onclick={() => {
                  if (counterEnabled && counterTechnique === 'contrary') {
                    onCounterToggle?.(track.id);
                  } else {
                    if (!counterEnabled) onCounterToggle?.(track.id);
                    onCounterTechniqueChange?.(track.id, 'contrary');
                  }
                }}
                title="Contrary motion"
              >
                M
              </button>
            </div>
          </div>
        {/if}
      </div>
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
      <div class="level-meter-vertical">
        <div class="level-fill-vertical" style="height: {level * 100}%"></div>
        <div class="peak-indicator" style="bottom: {peak * 100}%"></div>
        <span class="level-db-vertical">{peakDb > -60 ? peakDb.toFixed(0) : '-∞'}</span>
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
    width: 420px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .track-icon-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    width: 70px;
    flex-shrink: 0;
  }

  .track-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .track-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .track-name-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
  }

  .sampled-badge {
    width: 12px;
    height: 12px;
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
    font-size: 0.7rem;
    font-weight: 500;
    color: #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 65px;
    text-align: center;
  }

  .track-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .button-rows {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .button-row {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }


  .mute-btn, .solo-btn, .keys-btn {
    width: 44px;
    height: 44px;
    border: 1px solid #444;
    background: #2a2a4e;
    color: #888;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
  }

  .mute-btn, .solo-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }

  .mute-btn svg, .solo-btn svg {
    width: 100%;
    height: 100%;
  }

  .mute-btn:hover, .solo-btn:hover, .keys-btn:hover {
    background: #3a3a5e;
  }

  .mute-btn.active {
    background: #2a2a4e;
    color: #dc2626;
    border-color: #dc2626;
  }

  .solo-btn.active {
    background: #2a2a4e;
    color: #eab308;
    border-color: #eab308;
  }

  .keys-btn.active {
    background: #06b6d4;
    color: #fff;
    border-color: #06b6d4;
  }

  .technique-picker {
    display: flex;
  }

  .technique-btn {
    width: 44px;
    height: 44px;
    border: 1px solid #444;
    border-right: none;
    background: #2a2a4e;
    color: #666;
    border-radius: 0;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: bold;
    padding: 0;
  }

  .technique-btn:first-child {
    border-radius: 6px 0 0 6px;
  }

  .technique-btn:last-child {
    border-right: 1px solid #444;
    border-radius: 0 6px 6px 0;
  }

  .technique-btn:hover {
    background: #3a3a5e;
  }

  .technique-btn.active {
    background: #0891b2;
    color: #fff;
    border-color: #0891b2;
  }

  .technique-btn.active + .technique-btn {
    border-left-color: #0891b2;
  }

  .volume-slider {
    width: 80px;
    height: 44px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    transform: rotate(-90deg);
    transform-origin: center center;
    margin: 0 -18px;
  }

  .volume-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: #444;
    border-radius: 4px;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #888;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.15s;
    margin-top: -8px;
  }

  .volume-slider::-webkit-slider-thumb:hover {
    background: #aaa;
  }

  .volume-slider::-moz-range-track {
    width: 100%;
    height: 8px;
    background: #444;
    border-radius: 4px;
  }

  .volume-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: #888;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  .volume-slider::-moz-range-thumb:hover {
    background: #aaa;
  }

  .level-meter-vertical {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 24px;
    height: 80px;
    background: #222;
    border-radius: 4px;
    overflow: hidden;
    margin-left: 0.5rem;
    position: relative;
  }

  .level-fill-vertical {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, #4ade80, #fbbf24, #ef4444);
    transition: height 0.05s ease-out;
  }

  .peak-indicator {
    position: absolute;
    left: 2px;
    right: 2px;
    height: 2px;
    background: #fff;
    transition: bottom 0.05s ease-out;
  }

  .level-db-vertical {
    position: absolute;
    bottom: 2px;
    font-size: 0.5rem;
    color: #fff;
    text-shadow: 0 0 2px #000;
    font-family: monospace;
    z-index: 1;
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
