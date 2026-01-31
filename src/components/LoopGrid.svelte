<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { project, tracks, loops, playback, isPlaying, genre } from '../lib/stores';
  import { initAudio, transport, instrumentManager, loopScheduler } from '../lib/audio';
  import { generateLoop, GENRE_PRESETS } from '../lib/generators';
  import type { Track, LoopState, GenrePreset, InstrumentType } from '../lib/types';
  import TrackRow from './TrackRow.svelte';
  import LoopEditorModal from './LoopEditorModal.svelte';

  let audioInitialized = false;

  // Use plain object for reactivity - keyed by "trackId:col"
  let cellStates: Record<string, LoopState> = {};

  // Progress for each active cell (0-1)
  let cellProgress: Record<string, number> = {};
  let animationFrame: number | null = null;

  function updateProgress() {
    const newProgress: Record<string, number> = {};

    for (const [key, state] of Object.entries(cellStates)) {
      if (state === 'active') {
        const [trackId] = key.split(':');
        newProgress[key] = loopScheduler.getLoopProgress(trackId);
      }
    }

    cellProgress = newProgress;
    animationFrame = requestAnimationFrame(updateProgress);
  }

  onMount(() => {
    animationFrame = requestAnimationFrame(updateProgress);
  });

  function getCellKey(trackId: string, col: number): string {
    return `${trackId}:${col}`;
  }

  async function ensureAudio() {
    if (!audioInitialized) {
      await initAudio();
      audioInitialized = true;

      // Initialize instruments for all tracks
      for (const track of $tracks) {
        instrumentManager.createTrackInstrument(track.id, track.type);
        instrumentManager.setTrackVolume(track.id, track.volume);
        instrumentManager.setTrackMute(track.id, track.muted);
      }
    }
  }

  async function handleCellTap(e: CustomEvent<{ trackId: string; col: number }>) {
    await ensureAudio();

    const { trackId, col } = e.detail;
    const track = $tracks.find(t => t.id === trackId);
    if (!track) return;

    const cell = track.cells.find(c => c.col === col);
    const loopId = cell?.loopId;
    const loop = loopId ? $loops[loopId] : null;

    const key = getCellKey(trackId, col);
    const currentState = cellStates[key] ?? 'inactive';

    if (currentState === 'active') {
      // Stop immediately
      loopScheduler.stopLoop(trackId);
      cellStates[key] = 'inactive';
      cellStates = { ...cellStates }; // trigger reactivity
    } else {
      // Generate loop if needed
      let actualLoop = loop;
      if (!actualLoop) {
        const projectData = project.getSnapshot();
        actualLoop = generateLoop(
          track.type,
          GENRE_PRESETS[$genre].defaultParams,
          projectData.key,
          projectData.scale
        );
        project.addLoop(actualLoop);
        project.setCellLoop(trackId, col, actualLoop.id);
      }

      // Clear other cells in this track
      const newStates = { ...cellStates };
      for (const [k, state] of Object.entries(newStates)) {
        if (k.startsWith(`${trackId}:`) && k !== key && state === 'active') {
          newStates[k] = 'inactive';
        }
      }

      // Start playing
      loopScheduler.scheduleLoop(trackId, actualLoop);
      newStates[key] = 'active';
      cellStates = newStates;

      if (!$isPlaying) {
        transport.start();
        playback.setTransportState('started');
      }
    }
  }

  async function handleCellDoubleTap(e: CustomEvent<{ trackId: string; col: number }>) {
    await ensureAudio();

    const { trackId, col } = e.detail;
    const track = $tracks.find(t => t.id === trackId);
    if (!track) return;

    const key = getCellKey(trackId, col);
    const currentState = cellStates[key] ?? 'inactive';

    if (currentState === 'active') {
      // Stop at end of loop
      loopScheduler.stopLoopAtEnd(trackId, () => {
        cellStates = { ...cellStates, [key]: 'inactive' };
      });
      cellStates = { ...cellStates, [key]: 'stopping' };
    } else {
      // Queue to play
      const cell = track.cells.find(c => c.col === col);
      let loopId = cell?.loopId;
      let loop = loopId ? $loops[loopId] : null;

      if (!loop) {
        const projectData = project.getSnapshot();
        loop = generateLoop(
          track.type,
          GENRE_PRESETS[$genre].defaultParams,
          projectData.key,
          projectData.scale
        );
        project.addLoop(loop);
        project.setCellLoop(trackId, col, loop.id);
      }

      // Queue with callback to update state when it starts
      loopScheduler.queueLoop(trackId, loop, () => {
        // Clear other cells in this track and set this one to active
        const newStates = { ...cellStates };
        for (const [k, state] of Object.entries(newStates)) {
          if (k.startsWith(`${trackId}:`)) {
            newStates[k] = k === key ? 'active' : 'inactive';
          }
        }
        cellStates = newStates;
      });

      cellStates = { ...cellStates, [key]: 'queued' };

      // Make sure transport is running
      if (!$isPlaying) {
        transport.start();
        playback.setTransportState('started');
      }
    }
  }

  function handleCellContextMenu(e: CustomEvent<{ trackId: string; col: number }>) {
    // Open the loop editor
    const { trackId, col } = e.detail;
    const track = $tracks.find(t => t.id === trackId);
    if (!track) return;

    const cell = track.cells.find(c => c.col === col);
    const loopId = cell?.loopId;

    if (loopId) {
      openEditor(loopId, track.type);
    }
  }

  function handleMute(e: CustomEvent<{ trackId: string }>) {
    const track = $tracks.find(t => t.id === e.detail.trackId);
    if (track) {
      const newMuted = !track.muted;
      project.setTrackMute(e.detail.trackId, newMuted);
      instrumentManager.setTrackMute(e.detail.trackId, newMuted);
    }
  }

  function handleSolo(e: CustomEvent<{ trackId: string }>) {
    const track = $tracks.find(t => t.id === e.detail.trackId);
    if (!track) return;

    const newSolo = !track.solo;
    project.setTrackSolo(e.detail.trackId, newSolo);

    // Update audio muting based on solo state
    updateSoloMuting();
  }

  function updateSoloMuting() {
    const trackList = $tracks;
    const anySoloed = trackList.some(t => t.solo);

    for (const track of trackList) {
      // If any track is soloed, mute non-soloed tracks (unless explicitly muted)
      // If no tracks soloed, respect the track's own mute state
      const shouldMute = anySoloed ? !track.solo : track.muted;
      instrumentManager.setTrackMute(track.id, shouldMute || track.muted);
    }
  }

  function isColumnActive(col: number): boolean {
    // Check if all tracks have this column active
    return $tracks.every(track => {
      const key = getCellKey(track.id, col);
      return cellStates[key] === 'active';
    });
  }

  async function handleColumnPlay(col: number) {
    await ensureAudio();

    // If column is already fully active, stop all
    if (isColumnActive(col)) {
      const newStates = { ...cellStates };
      for (const track of $tracks) {
        const key = getCellKey(track.id, col);
        loopScheduler.stopLoop(track.id);
        newStates[key] = 'inactive';
      }
      cellStates = newStates;
      return;
    }

    const newStates = { ...cellStates };

    // Start loop for each track in this column
    for (const track of $tracks) {
      const cell = track.cells.find(c => c.col === col);
      const loopId = cell?.loopId;
      const loop = loopId ? $loops[loopId] : null;

      if (loop) {
        // Clear other cells in this track
        for (const [k] of Object.entries(newStates)) {
          if (k.startsWith(`${track.id}:`)) {
            newStates[k] = 'inactive';
          }
        }

        // Start this cell
        const key = getCellKey(track.id, col);
        loopScheduler.scheduleLoop(track.id, loop);
        newStates[key] = 'active';
      }
    }

    cellStates = newStates;

    if (!$isPlaying) {
      transport.start();
      playback.setTransportState('started');
    }
  }

  // Get column count from first track
  $: columnCount = $tracks[0]?.cells.length ?? 8;

  // Editor modal state
  let editorOpen = false;
  let editorLoopId: string | null = null;
  let editorTrackType: InstrumentType = 'drums';

  export function openEditor(loopId: string, trackType: InstrumentType) {
    editorLoopId = loopId;
    editorTrackType = trackType;
    editorOpen = true;
  }

  export function closeEditor() {
    editorOpen = false;
    editorLoopId = null;
  }

  function handleAddColumn() {
    const projectData = project.getSnapshot();
    const params = GENRE_PRESETS[$genre].defaultParams;
    const newCol = columnCount;

    // Add a cell to each track with a generated loop
    for (const track of $tracks) {
      const newLoop = generateLoop(
        track.type,
        params,
        projectData.key,
        projectData.scale
      );
      project.addLoop(newLoop);
      // This uses addColumn which adds empty cells, so we need a different approach
    }

    project.addColumn();

    // Now assign loops to the new cells
    const updatedTracks = project.getSnapshot().tracks;
    for (const track of updatedTracks) {
      const newLoop = generateLoop(
        track.type,
        params,
        projectData.key,
        projectData.scale
      );
      project.addLoop(newLoop);
      project.setCellLoop(track.id, newCol, newLoop.id);
    }
  }

  // Expose stopAll for parent components
  export function stopAll() {
    loopScheduler.stopAll();
    cellStates = {};
  }

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    loopScheduler.stopAll();
    transport.stop();
  });
</script>

<div class="loop-grid">
  <div class="column-headers">
    <div class="header-spacer"></div>
    <div class="column-buttons">
      {#each Array(columnCount) as _, col}
        <button
          class="column-play-btn"
          class:active={isColumnActive(col)}
          onclick={() => handleColumnPlay(col)}
          title={isColumnActive(col) ? `Stop column ${col + 1}` : `Play column ${col + 1}`}
        >
          {isColumnActive(col) ? '⏹' : '▶'}
        </button>
      {/each}
      <button
        class="add-column-btn"
        onclick={handleAddColumn}
        title="Add column"
      >
        +
      </button>
    </div>
  </div>

  {#each $tracks as track (track.id)}
    <TrackRow
      {track}
      allCellStates={cellStates}
      allCellProgress={cellProgress}
      loops={$loops}
      on:cellTap={handleCellTap}
      on:cellDoubleTap={handleCellDoubleTap}
      on:cellContextMenu={handleCellContextMenu}
      on:mute={handleMute}
      on:solo={handleSolo}
    />
  {/each}
</div>

<LoopEditorModal
  open={editorOpen}
  loopId={editorLoopId}
  trackType={editorTrackType}
  onClose={closeEditor}
/>

<style>
  .loop-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .column-headers {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .header-spacer {
    width: 120px;
    flex-shrink: 0;
  }

  .column-buttons {
    display: flex;
    gap: 0.5rem;
    flex: 1;
  }

  .column-play-btn {
    flex: 1;
    max-width: 80px;
    height: 28px;
    border: 1px solid #444;
    background: #2a2a4e;
    color: #888;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.15s ease;
  }

  .column-play-btn:hover {
    background: #3a3a5e;
    color: #4ade80;
    border-color: #4ade80;
  }

  .column-play-btn.active {
    background: #4ade80;
    color: #1a1a2e;
    border-color: #4ade80;
  }

  .column-play-btn.active:hover {
    background: #f87171;
    border-color: #f87171;
  }

  .add-column-btn {
    width: 32px;
    height: 28px;
    border: 1px dashed #555;
    background: transparent;
    color: #666;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.25rem;
    font-weight: bold;
    transition: all 0.15s ease;
  }

  .add-column-btn:hover {
    background: #2a2a4e;
    color: #4ade80;
    border-color: #4ade80;
    border-style: solid;
  }
</style>
