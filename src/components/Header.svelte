<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { project, bpm, musicalKey, scale, tracks, genre, playMode, playback, globalStaffView } from '../lib/stores';
  import { transport, instrumentManager, setMasterVolume } from '../lib/audio';
  import type { ScaleType } from '../lib/types';
  import { GENRES, GENRE_PRESETS, getGenreBpm, generateLoop, getAllGenres } from '../lib/generators';
  import type { GenrePreset } from '../lib/genres';
  import ProgressionDisplay from './ProgressionDisplay.svelte';

  const dispatch = createEventDispatcher<{
    regenerateAll: void;
    stopAll: void;
    genreChange: { genre: GenrePreset };
    openSaveLoad: void;
  }>();

  let volume = $state(80);
  let showGenreSelector = $state(false);

  function handleVolumeChange(e: Event) {
    volume = parseInt((e.target as HTMLInputElement).value);
    const db = volume === 0 ? -Infinity : (volume / 100) * 60 - 60;
    setMasterVolume(db);
  }

  function handleStopAll() {
    transport.stop();
    transport.position = 0; // Reset position so Parts starting at 0 will play immediately
    playback.reset();
    dispatch('stopAll');
  }

  // Get all available genres dynamically
  const genres: GenrePreset[] = getAllGenres();
  const scales: ScaleType[] = ['major', 'minor', 'dorian', 'mixolydian', 'pentatonic', 'chromatic'];
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  async function handleGenreChange(newGenre: GenrePreset) {
    showGenreSelector = false;
    if (newGenre === $genre) return;

    // Emit event to let App.svelte preload instruments first
    dispatch('genreChange', { genre: newGenre });
  }

  // Called by App.svelte after preloading is complete
  export function applyGenreChange(newGenre: GenrePreset) {
    const config = GENRE_PRESETS[newGenre];
    const newBpm = getGenreBpm(newGenre);

    // Rebuild tracks with genre-appropriate instruments, key, and scale
    project.rebuildTracksForGenre(newGenre);

    project.setBpm(newBpm);
    transport.setBpm(newBpm);
    transport.setSwing(config.swing);

    // Update instrument manager genre (for synth presets)
    instrumentManager.setGenre(newGenre);

    dispatch('regenerateAll');
  }

  function regenerateAllWithParams(params: typeof GENRE_PRESETS['lofi-hiphop']['defaultParams']) {
    const projectData = project.getSnapshot();

    for (const track of $tracks) {
      for (const cell of track.cells) {
        const newLoop = generateLoop(
          track.type,
          params,
          projectData.key,
          projectData.scale
        );
        project.addLoop(newLoop);
        project.setCellLoop(track.id, cell.col, newLoop.id);
      }
    }

    dispatch('regenerateAll');
  }

  function handleBpmChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    project.setBpm(value);
    transport.setBpm(value);
  }

  function handleKeyChange(e: Event) {
    const newKey = (e.target as HTMLSelectElement).value;
    project.setKey(newKey);
    regenerateMelodicLoops(newKey, project.getSnapshot().scale);
  }

  function handleScaleChange(e: Event) {
    const newScale = (e.target as HTMLSelectElement).value as ScaleType;
    project.setScale(newScale);
    regenerateMelodicLoops(project.getSnapshot().key, newScale);
  }

  function regenerateMelodicLoops(key: string, scaleType: string) {
    const params = GENRE_PRESETS[$genre].defaultParams;
    const melodicTypes = ['bass', 'keys', 'lead', 'pad'];

    for (const track of $tracks) {
      if (melodicTypes.includes(track.type)) {
        for (const cell of track.cells) {
          const newLoop = generateLoop(
            track.type,
            params,
            key,
            scaleType
          );
          project.addLoop(newLoop);
          project.setCellLoop(track.id, cell.col, newLoop.id);
        }
      }
    }

    dispatch('regenerateAll');
  }

  function handleRegenerateAll() {
    regenerateAllWithParams(GENRE_PRESETS[$genre].defaultParams);
  }
</script>

<header>
  <div class="left">
    <div class="mode-toggle">
      <button
        class:active={$playMode === 'loop'}
        onclick={() => playMode.set('loop')}
        title="Loop mode"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      </button>
      <button
        class:active={$playMode === 'pad'}
        onclick={() => playMode.set('pad')}
        title="Pad mode"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <rect x="2" y="8" width="3" height="12" rx="0.5"/>
          <rect x="6" y="4" width="3" height="16" rx="0.5"/>
          <rect x="10" y="8" width="3" height="12" rx="0.5"/>
          <rect x="14" y="4" width="3" height="16" rx="0.5"/>
          <rect x="18" y="8" width="3" height="12" rx="0.5"/>
        </svg>
      </button>
    </div>
  </div>

  <div class="center">
    <div class="music-settings">
      <div class="genre-picker">
        <button
          class="genre-button"
          onclick={() => showGenreSelector = !showGenreSelector}
        >
          <span class="genre-label">Genre</span>
          <span class="genre-name">{GENRE_PRESETS[$genre].name}</span>
        </button>

        {#if showGenreSelector}
          <div class="genre-selector">
            {#each genres as g}
              <button
                class="genre-option"
                class:selected={g === $genre}
                onclick={() => handleGenreChange(g)}
              >
                {GENRE_PRESETS[g].name}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="key-scale-stack">
        <label>
          <span class="label-text">Key</span>
          <select value={$musicalKey} onchange={handleKeyChange}>
            {#each keys as k}
              <option value={k}>{k}</option>
            {/each}
          </select>
        </label>
        <label>
          <span class="label-text">Scale</span>
          <select value={$scale} onchange={handleScaleChange}>
            {#each scales as s}
              <option value={s}>{s}</option>
            {/each}
          </select>
        </label>
      </div>

    <ProgressionDisplay />

    <label>
        BPM:
        <input
          type="range"
          min="60"
          max="180"
          value={$bpm}
          oninput={handleBpmChange}
        />
        <span>{$bpm}</span>
      </label>
    </div>
  </div>

  <div class="right">
    <div class="volume-control">
      <span class="volume-icon">{volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}</span>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        oninput={handleVolumeChange}
        class="volume-slider"
      />
    </div>
    <button class="stop-btn" onclick={handleStopAll} title="Stop all">
      ⏹
    </button>
    <button
      class="staff-btn"
      class:active={$globalStaffView}
      onclick={() => globalStaffView.update(v => !v)}
      title="Toggle all tracks to staff view"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
      </svg>
    </button>
    <button class="action-btn" onclick={handleRegenerateAll} title="Regenerate all loops">
      🎲
    </button>
    <button onclick={() => dispatch('openSaveLoad')} title="Save/Load projects">
      💾
    </button>
  </div>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: #1a1a2e;
    border-bottom: 1px solid #333;
    gap: 1rem;
  }

  .center {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .music-settings {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #888;
    font-size: 0.75rem;
  }

  select, input[type="range"] {
    background: #2a2a4e;
    border: 1px solid #444;
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
  }

  button {
    background: #3a3a5e;
    border: 1px solid #555;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  button:hover {
    background: #4a4a6e;
  }

  .action-btn {
    background: #7c3aed;
    border-color: #7c3aed;
  }

  .action-btn:hover {
    background: #9333ea;
    border-color: #9333ea;
  }

  .left, .right {
    flex: 1;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.5rem;
  }

  .volume-control {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-right: 0.5rem;
  }

  .volume-icon {
    font-size: 0.9rem;
  }

  .volume-slider {
    width: 80px;
    height: 44px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
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
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    margin-top: -8px;
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
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  .stop-btn {
    background: #3a3a5e;
    border: 1px solid #555;
    color: #fff;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    transition: all 0.15s ease;
  }

  .stop-btn:hover {
    background: #f87171;
    border-color: #f87171;
  }

  .staff-btn {
    background: #3a3a5e;
    border: 1px solid #555;
    color: #888;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    transition: all 0.15s ease;
  }

  .staff-btn svg {
    width: 100%;
    height: 100%;
  }

  .staff-btn:hover {
    background: #4a4a6e;
  }

  .staff-btn.active {
    background: #8b5cf6;
    border-color: #8b5cf6;
    color: #fff;
  }

  .mode-toggle {
    display: flex;
    background: #2a2a4e;
    border-radius: 8px;
    padding: 3px;
  }

  .mode-toggle button {
    background: transparent;
    border: none;
    color: #888;
    width: 44px;
    height: 44px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mode-toggle button:hover {
    color: #ccc;
  }

  .mode-toggle button.active {
    background: #7c3aed;
    color: #fff;
  }

  .mode-toggle button svg {
    display: block;
    width: 24px;
    height: 24px;
  }

  .key-scale-stack {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .key-scale-stack label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .key-scale-stack .label-text {
    font-size: 0.65rem;
    width: 32px;
    text-align: right;
  }

  .key-scale-stack select {
    padding: 0.15rem 0.35rem;
    font-size: 0.7rem;
  }

  .genre-picker {
    position: relative;
    display: inline-block;
  }

  .genre-button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 1rem;
    background: #2a2a4e;
    border: 1px solid #444;
    border-radius: 0.5rem;
    cursor: pointer;
    color: #fff;
  }

  .genre-button:hover {
    background: #3a3a5e;
  }

  .genre-label {
    font-size: 0.65rem;
    opacity: 0.6;
    margin-bottom: 0.15rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .genre-name {
    font-size: 0.85rem;
    font-weight: 500;
  }

  .genre-selector {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 160px;
    margin-top: 0.25rem;
    background: #2a2a4e;
    border: 1px solid #444;
    border-radius: 0.5rem;
    overflow: hidden;
    z-index: 100;
    max-height: 300px;
    overflow-y: auto;
  }

  .genre-option {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    background: none;
    border: none;
    border-bottom: 1px solid #333;
    cursor: pointer;
    text-align: left;
    color: #ccc;
    font-size: 0.85rem;
  }

  .genre-option:last-child {
    border-bottom: none;
  }

  .genre-option:hover {
    background: #3a3a5e;
    color: #fff;
  }

  .genre-option.selected {
    background: #7c3aed;
    color: #fff;
  }
</style>
