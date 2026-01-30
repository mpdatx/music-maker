<script lang="ts">
  import { onDestroy } from 'svelte';
  import { project, tracks, loops, playback, isPlaying } from '../lib/stores';
  import { initAudio, transport, instrumentManager, loopScheduler } from '../lib/audio';
  import { generateLoop, GENRE_PRESETS } from '../lib/generators';
  import type { Track, LoopState, GenrePreset } from '../lib/types';
  import TrackRow from './TrackRow.svelte';

  let audioInitialized = false;

  // Use plain object for reactivity - keyed by "trackId:col"
  let cellStates: Record<string, LoopState> = {};

  function getCellKey(trackId: string, col: number): string {
    return `${trackId}:${col}`;
  }

  function getCellStatesForTrack(trackId: string): Map<number, LoopState> {
    const result = new Map<number, LoopState>();
    for (const [key, state] of Object.entries(cellStates)) {
      if (key.startsWith(`${trackId}:`)) {
        const col = parseInt(key.split(':')[1]);
        result.set(col, state);
      }
    }
    return result;
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
          GENRE_PRESETS['lofi-hiphop'].defaultParams,
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
      loopScheduler.stopLoopAtEnd(trackId);
      cellStates = { ...cellStates, [key]: 'stopping' };
      // Will be set to inactive when loop actually stops
    } else {
      // Queue to play
      const cell = track.cells.find(c => c.col === col);
      let loopId = cell?.loopId;
      let loop = loopId ? $loops[loopId] : null;

      if (!loop) {
        const projectData = project.getSnapshot();
        loop = generateLoop(
          track.type,
          GENRE_PRESETS['lofi-hiphop'].defaultParams,
          projectData.key,
          projectData.scale
        );
        project.addLoop(loop);
        project.setCellLoop(trackId, col, loop.id);
      }

      loopScheduler.queueLoop(trackId, loop);
      cellStates = { ...cellStates, [key]: 'queued' };
    }
  }

  function handleCellContextMenu(e: CustomEvent<{ trackId: string; col: number }>) {
    // TODO: Show context menu for edit/regenerate/clear
    console.log('Context menu:', e.detail);
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
    if (track) {
      project.setTrackSolo(e.detail.trackId, !track.solo);
      // TODO: Implement solo logic (mute others)
    }
  }

  onDestroy(() => {
    loopScheduler.stopAll();
    transport.stop();
  });
</script>

<div class="loop-grid">
  {#each $tracks as track (track.id)}
    <TrackRow
      {track}
      cellStates={getCellStatesForTrack(track.id)}
      loops={$loops}
      on:cellTap={handleCellTap}
      on:cellDoubleTap={handleCellDoubleTap}
      on:cellContextMenu={handleCellContextMenu}
      on:mute={handleMute}
      on:solo={handleSolo}
    />
  {/each}
</div>

<style>
  .loop-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }
</style>
