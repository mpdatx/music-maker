<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Track, LoopState } from '../lib/types';
  import GridCell from './GridCell.svelte';

  export let track: Track;
  export let cellStates: Map<number, LoopState>;
  export let loops: Record<string, any>;

  const dispatch = createEventDispatcher<{
    cellTap: { trackId: string; col: number };
    cellDoubleTap: { trackId: string; col: number };
    cellContextMenu: { trackId: string; col: number };
    mute: { trackId: string };
    solo: { trackId: string };
  }>();

  const INSTRUMENT_COLORS: Record<string, string> = {
    drums: '#e11d48',
    percussion: '#db2777',
    bass: '#7c3aed',
    keys: '#2563eb',
    lead: '#0891b2',
    pad: '#059669',
  };

  function getCellState(col: number): LoopState {
    return cellStates.get(col) ?? 'inactive';
  }

  function hasLoop(col: number): boolean {
    const loopId = track.cells.find(c => c.col === col)?.loopId;
    return loopId != null && loops[loopId] != null;
  }
</script>

<div class="track-row">
  <div class="track-header">
    <span class="track-name">{track.name}</span>
    <div class="track-controls">
      <button
        class="mute-btn"
        class:active={track.muted}
        on:click={() => dispatch('mute', { trackId: track.id })}
      >
        M
      </button>
      <button
        class="solo-btn"
        class:active={track.solo}
        on:click={() => dispatch('solo', { trackId: track.id })}
      >
        S
      </button>
    </div>
  </div>

  <div class="cells">
    {#each track.cells as cell (cell.col)}
      <GridCell
        hasLoop={hasLoop(cell.col)}
        state={getCellState(cell.col)}
        instrumentColor={INSTRUMENT_COLORS[track.type] ?? '#3a3a5e'}
        on:tap={() => dispatch('cellTap', { trackId: track.id, col: cell.col })}
        on:doubletap={() => dispatch('cellDoubleTap', { trackId: track.id, col: cell.col })}
        on:contextmenu={() => dispatch('cellContextMenu', { trackId: track.id, col: cell.col })}
      />
    {/each}
  </div>
</div>

<style>
  .track-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .track-header {
    width: 120px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .track-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #ccc;
  }

  .track-controls {
    display: flex;
    gap: 0.25rem;
  }

  .mute-btn, .solo-btn {
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

  .mute-btn:hover, .solo-btn:hover {
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
