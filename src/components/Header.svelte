<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { project, bpm, musicalKey, scale, tracks, genre, playMode, playback } from '../lib/stores';
  import { transport, instrumentManager, setMasterVolume } from '../lib/audio';
  import type { GenrePreset, ScaleType } from '../lib/types';
  import { GENRE_PRESETS, getGenreBpm, generateLoop } from '../lib/generators';

  const dispatch = createEventDispatcher<{
    regenerateAll: void;
    openSaveLoad: void;
    stopAll: void;
  }>();

  let volume = $state(80);

  function handleVolumeChange(e: Event) {
    volume = parseInt((e.target as HTMLInputElement).value);
    const db = volume === 0 ? -Infinity : (volume / 100) * 60 - 60;
    setMasterVolume(db);
  }

  function handleStopAll() {
    transport.stop();
    playback.reset();
    dispatch('stopAll');
  }

  const genres: GenrePreset[] = ['lofi-hiphop', 'edm-house', 'rock', 'ambient', 'funk', 'pop'];
  const scales: ScaleType[] = ['major', 'minor', 'dorian', 'mixolydian', 'pentatonic', 'chromatic'];
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  function handleGenreChange(newGenre: GenrePreset) {
    if (newGenre === $genre) return;
    project.setGenre(newGenre);

    const config = GENRE_PRESETS[newGenre];
    const newBpm = getGenreBpm(newGenre);
    project.setBpm(newBpm);
    transport.setBpm(newBpm);
    transport.setSwing(config.swing);

    // Update all instruments to use new genre sounds
    instrumentManager.setGenre(newGenre);

    // Regenerate all loops with new genre parameters
    regenerateAllWithParams(config.defaultParams);
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
      >
        Loops
      </button>
      <button
        class:active={$playMode === 'pad'}
        onclick={() => playMode.set('pad')}
      >
        Pads
      </button>
    </div>
  </div>

  <div class="center">
    <div class="genre-picker">
      {#each genres as g}
        <button
          class="genre-btn"
          class:active={$genre === g}
          onclick={() => handleGenreChange(g)}
        >
          {GENRE_PRESETS[g].name}
        </button>
      {/each}
    </div>

    <div class="music-settings">
      <label>
        Key:
      <select value={$musicalKey} onchange={handleKeyChange}>
        {#each keys as k}
          <option value={k}>{k}</option>
        {/each}
      </select>
    </label>

    <label>
      Scale:
      <select value={$scale} onchange={handleScaleChange}>
        {#each scales as s}
          <option value={s}>{s}</option>
        {/each}
      </select>
    </label>

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
    flex-direction: column;
  }

  .genre-picker {
    display: flex;
    gap: 0.25rem;
    background: #1a1a2e;
    padding: 3px;
    border-radius: 8px;
    border: 1px solid #333;
  }

  .genre-btn {
    background: transparent;
    border: none;
    color: #888;
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .genre-btn:hover {
    color: #ccc;
    background: rgba(124, 58, 237, 0.2);
  }

  .genre-btn.active {
    background: linear-gradient(135deg, #7c3aed, #9333ea);
    color: #fff;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4);
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
    width: 60px;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: #444;
    border-radius: 2px;
    cursor: pointer;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
  }

  .volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  .stop-btn {
    background: #3a3a5e;
    border: 1px solid #555;
    color: #fff;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    transition: all 0.15s ease;
  }

  .stop-btn:hover {
    background: #f87171;
    border-color: #f87171;
  }

  .mode-toggle {
    display: flex;
    background: #2a2a4e;
    border-radius: 6px;
    padding: 2px;
  }

  .mode-toggle button {
    background: transparent;
    border: none;
    color: #888;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.15s ease;
  }

  .mode-toggle button:hover {
    color: #ccc;
  }

  .mode-toggle button.active {
    background: #7c3aed;
    color: #fff;
  }
</style>
