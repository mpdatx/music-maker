<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { project, tracks, loops, playback, isPlaying, genre, playMode, bpm } from '../lib/stores';
  import { currentProgression, progressionStore } from '../lib/stores/progression';
  import { initAudio, transport, instrumentManager, loopScheduler, preloadInstruments, isSampledInstrument, ProgressionClock } from '../lib/audio';
  import { GENRE_TRACKS } from '../lib/stores/project';
  import { generateLoop, generateLoopBundle, GENRE_PRESETS } from '../lib/generators';
  import type { Track, LoopState, GenrePreset, InstrumentType, LoopBundle } from '../lib/types';
  import TrackRow from './TrackRow.svelte';
  import LoopEditorModal from './LoopEditorModal.svelte';

  let audioInitialized = false;

  // Use plain object for reactivity - keyed by "trackId:col"
  let cellStates: Record<string, LoopState> = {};

  // Progress for each active cell (0-1)
  let cellProgress: Record<string, number> = {};
  // Level meters for each track (0-1)
  let trackLevels: Record<string, number> = {};
  let trackLevelsDb: Record<string, number> = {};
  // Peak hold levels (decay slowly for visual indicator)
  let trackPeaks: Record<string, number> = {};
  let trackPeaksDb: Record<string, number> = {};
  // True maximum dB (never decays, for numeric display)
  let trackMaxDb: Record<string, number> = {};
  let animationFrame: number | null = null;

  function updateProgress() {
    const newProgress: Record<string, number> = {};
    const newLevels: Record<string, number> = {};
    const newLevelsDb: Record<string, number> = {};
    const newPeaks: Record<string, number> = { ...trackPeaks };
    const newPeaksDb: Record<string, number> = { ...trackPeaksDb };
    const newMaxDb: Record<string, number> = { ...trackMaxDb };

    for (const [key, state] of Object.entries(cellStates)) {
      if (state === 'active') {
        const [trackId] = key.split(':');
        newProgress[key] = loopScheduler.getLoopProgress(trackId);
      }
    }

    // Update track levels and peaks
    for (const track of $tracks) {
      const level = instrumentManager.getTrackLevel(track.id);
      const db = instrumentManager.getTrackLevelDb(track.id);
      newLevels[track.id] = level;
      newLevelsDb[track.id] = db;

      // Update peak if current level is higher, otherwise decay
      const currentPeak = newPeaks[track.id] ?? 0;
      const currentPeakDb = newPeaksDb[track.id] ?? -Infinity;
      const currentMaxDb = newMaxDb[track.id] ?? -Infinity;
      if (level >= currentPeak) {
        newPeaks[track.id] = level;
        newPeaksDb[track.id] = db;
      } else {
        // Decay peak slowly (about 1.5 seconds to fall from 1 to 0 at 60fps)
        newPeaks[track.id] = Math.max(0, currentPeak - 0.012);
        newPeaksDb[track.id] = currentPeakDb - 0.5;
      }
      // True max never decays
      if (db > currentMaxDb) {
        newMaxDb[track.id] = db;
      }
    }

    cellProgress = newProgress;
    trackLevels = newLevels;
    trackLevelsDb = newLevelsDb;
    trackPeaks = newPeaks;
    trackPeaksDb = newPeaksDb;
    trackMaxDb = newMaxDb;

    // Update current chord index for visual feedback
    const chordIndex = loopScheduler.getCurrentChordIndex();
    progressionStore.setChordIndex(chordIndex);

    animationFrame = requestAnimationFrame(updateProgress);
  }

  onMount(() => {
    animationFrame = requestAnimationFrame(updateProgress);
  });

  // Track the current track types to detect when genre changes tracks
  let lastTrackSignature = '';
  $: {
    const currentSignature = $tracks.map(t => `${t.id}:${t.type}`).join(',');
    if (lastTrackSignature && lastTrackSignature !== currentSignature && audioInitialized) {
      // Tracks have changed - reinitialize instruments
      reinitializeInstruments();
    }
    lastTrackSignature = currentSignature;
  }

  async function reinitializeInstruments() {
    // Stop all playing loops first
    loopScheduler.stopAll();
    cellStates = {};
    cellProgress = {};

    // Preload samples for current genre (start early)
    const preloadPromise = preloadGenreInstruments($genre);

    // Dispose old instruments and create new ones
    for (const track of $tracks) {
      instrumentManager.disposeTrackInstrument(track.id);
    }

    // Wait for preload to finish before creating instruments
    await preloadPromise;

    for (const track of $tracks) {
      instrumentManager.createTrackInstrument(track.id, track.type);
      instrumentManager.setTrackVolume(track.id, track.volume);
    }
    // Apply mute/solo state after all instruments are created
    updateSoloMuting();
  }

  function getCellKey(trackId: string, col: number): string {
    return `${trackId}:${col}`;
  }

  // Preload sampled instruments for a genre
  async function preloadGenreInstruments(genrePreset: typeof $genre) {
    const trackDefs = GENRE_TRACKS[genrePreset];
    const sampledTypes = trackDefs
      .map(t => t.type)
      .filter(type => isSampledInstrument(type)) as Parameters<typeof preloadInstruments>[0];

    if (sampledTypes.length > 0) {
      await preloadInstruments(sampledTypes);
    }
  }

  async function ensureAudio() {
    if (!audioInitialized) {
      await initAudio();
      audioInitialized = true;

      // Preload samples for current genre (non-blocking)
      preloadGenreInstruments($genre);

      // Initialize instruments for all tracks
      for (const track of $tracks) {
        instrumentManager.createTrackInstrument(track.id, track.type);
        instrumentManager.setTrackVolume(track.id, track.volume);
      }
      // Apply mute/solo state after all instruments are created
      updateSoloMuting();
    }
  }

  // Ensure progression clock is set up for bundle playback
  function ensureProgressionClock() {
    const progression = $currentProgression;
    const currentBpm = $bpm;
    const barsPerChord = 2; // Standard: 2 bars per chord

    const clock = new ProgressionClock({
      progressionId: progression.id,
      progressionLength: progression.chords.length,
      barsPerChord,
      bpm: currentBpm,
    });
    loopScheduler.setProgressionClock(clock);
  }

  // Generate a bundle for a track using the current progression
  function generateBundleForTrack(track: Track, seed?: number): LoopBundle {
    const projectData = project.getSnapshot();
    const progression = $currentProgression;
    const actualSeed = seed ?? Math.floor(Math.random() * 1000000);

    return generateLoopBundle(
      track.type,
      GENRE_PRESETS[$genre].defaultParams,
      projectData.key,
      projectData.scale,
      $genre,
      actualSeed,
      progression.id,
      2 // bars per variation
    );
  }

  async function handleCellTap(e: CustomEvent<{ trackId: string; col: number }>) {
    await ensureAudio();

    const { trackId, col } = e.detail;
    const track = $tracks.find(t => t.id === trackId);
    if (!track) return;

    const cell = track.cells.find(c => c.col === col);
    const loopId = cell?.loopId;
    const existingLoop = loopId ? $loops[loopId] : null;

    const key = getCellKey(trackId, col);
    const currentState = cellStates[key] ?? 'inactive';

    if (currentState === 'active') {
      // Stop immediately
      loopScheduler.stopLoop(trackId);
      cellStates[key] = 'inactive';
      cellStates = { ...cellStates }; // trigger reactivity
    } else {
      // Get seed from existing loop or generate new one
      const seed = existingLoop?.seed ?? Math.floor(Math.random() * 1000000);

      // Store a base loop for the editor if none exists
      if (!existingLoop) {
        const projectData = project.getSnapshot();
        const baseLoop = generateLoop(
          track.type,
          GENRE_PRESETS[$genre].defaultParams,
          projectData.key,
          projectData.scale,
          seed
        );
        project.addLoop(baseLoop);
        project.setCellLoop(trackId, col, baseLoop.id);
      }

      // Generate a chord-aware bundle for playback
      ensureProgressionClock();
      const bundle = generateBundleForTrack(track, seed);

      // Clear other cells in this track
      const newStates = { ...cellStates };
      for (const [k, state] of Object.entries(newStates)) {
        if (k.startsWith(`${trackId}:`) && k !== key && state === 'active') {
          newStates[k] = 'inactive';
        }
      }

      // Start playing with bundle (chord-aware variations)
      loopScheduler.scheduleBundleLoop(trackId, bundle, $bpm);
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
      const existingLoopId = cell?.loopId;
      const existingLoop = existingLoopId ? $loops[existingLoopId] : null;

      // Get seed from existing loop or generate new one
      const seed = existingLoop?.seed ?? Math.floor(Math.random() * 1000000);

      // Store a base loop for the editor if none exists
      if (!existingLoop) {
        const projectData = project.getSnapshot();
        const baseLoop = generateLoop(
          track.type,
          GENRE_PRESETS[$genre].defaultParams,
          projectData.key,
          projectData.scale,
          seed
        );
        project.addLoop(baseLoop);
        project.setCellLoop(trackId, col, baseLoop.id);
      }

      // Create a dummy loop for queueLoop timing, but schedule bundle when it fires
      const dummyLoop = existingLoop ?? $loops[cell?.loopId ?? ''];

      // Queue with callback that schedules the bundle when it starts
      loopScheduler.queueLoop(trackId, dummyLoop ?? { id: '', type: track.type, bars: 2, seed, generationParams: GENRE_PRESETS[$genre].defaultParams, notes: [] }, () => {
        // Generate and schedule the chord-aware bundle
        ensureProgressionClock();
        const bundle = generateBundleForTrack(track, seed);
        loopScheduler.scheduleBundleLoop(trackId, bundle, $bpm);

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

  function handleVolume(e: CustomEvent<{ trackId: string; volume: number }>) {
    project.setTrackVolume(e.detail.trackId, e.detail.volume);
    instrumentManager.setTrackVolume(e.detail.trackId, e.detail.volume);
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

    // Set up progression clock for bundle playback
    ensureProgressionClock();

    const newStates = { ...cellStates };

    // Start bundle for each track in this column
    for (const track of $tracks) {
      const cell = track.cells.find(c => c.col === col);
      const loopId = cell?.loopId;
      const existingLoop = loopId ? $loops[loopId] : null;

      // Clear other cells in this track
      for (const [k] of Object.entries(newStates)) {
        if (k.startsWith(`${track.id}:`)) {
          newStates[k] = 'inactive';
        }
      }

      // Generate and schedule a chord-aware bundle
      const seed = existingLoop?.seed ?? Math.floor(Math.random() * 1000000);
      const bundle = generateBundleForTrack(track, seed);
      loopScheduler.scheduleBundleLoop(track.id, bundle, $bpm);

      const key = getCellKey(track.id, col);
      newStates[key] = 'active';
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

  // Handle note press in keys mode
  async function handleNotePress(trackId: string, note: string) {
    await ensureAudio();
    const instrument = instrumentManager.getTrackInstrument(trackId);
    if (!instrument) return;

    const synth = instrument.synth;
    if ('triggerAttack' in synth) {
      synth.triggerAttack(note);
    }
  }

  // Handle note release in keys mode
  function handleNoteRelease(trackId: string, note: string) {
    const instrument = instrumentManager.getTrackInstrument(trackId);
    if (!instrument) return;

    const synth = instrument.synth;
    if ('triggerRelease' in synth) {
      synth.triggerRelease(note);
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
  {#if $playMode === 'loop'}
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
      </div>
    </div>
  {/if}

  {#each $tracks as track (track.id)}
    <TrackRow
      {track}
      allCellStates={cellStates}
      allCellProgress={cellProgress}
      loops={$loops}
      level={trackLevels[track.id] ?? 0}
      levelDb={trackLevelsDb[track.id] ?? -Infinity}
      peak={trackPeaks[track.id] ?? 0}
      peakDb={trackMaxDb[track.id] ?? -Infinity}
      onNotePress={handleNotePress}
      onNoteRelease={handleNoteRelease}
      on:cellTap={handleCellTap}
      on:cellDoubleTap={handleCellDoubleTap}
      on:cellContextMenu={handleCellContextMenu}
      on:mute={handleMute}
      on:solo={handleSolo}
      on:volume={handleVolume}
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
    width: 280px;
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

</style>
