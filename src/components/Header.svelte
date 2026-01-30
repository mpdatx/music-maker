<script lang="ts">
  import { project, bpm, musicalKey, scale } from '../lib/stores';
  import { transport } from '../lib/audio';
  import type { GenrePreset, ScaleType } from '../lib/types';
  import { GENRE_PRESETS, getGenreBpm } from '../lib/generators';

  const genres: GenrePreset[] = ['lofi-hiphop', 'edm-house', 'rock', 'ambient', 'funk', 'pop'];
  const scales: ScaleType[] = ['major', 'minor', 'dorian', 'mixolydian', 'pentatonic'];
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  let selectedGenre: GenrePreset = 'lofi-hiphop';

  function handleGenreChange() {
    const newBpm = getGenreBpm(selectedGenre);
    project.setBpm(newBpm);
    transport.setBpm(newBpm);
  }

  function handleBpmChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    project.setBpm(value);
    transport.setBpm(value);
  }
</script>

<header>
  <div class="left">
    <h1>Music Maker</h1>
  </div>

  <div class="center">
    <label>
      Genre:
      <select bind:value={selectedGenre} on:change={handleGenreChange}>
        {#each genres as genre}
          <option value={genre}>{GENRE_PRESETS[genre].name}</option>
        {/each}
      </select>
    </label>

    <label>
      Key:
      <select value={$musicalKey} on:change={(e) => project.setKey(e.currentTarget.value)}>
        {#each keys as key}
          <option value={key}>{key}</option>
        {/each}
      </select>
    </label>

    <label>
      Scale:
      <select value={$scale} on:change={(e) => project.setScale(e.currentTarget.value as ScaleType)}>
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
        on:input={handleBpmChange}
      />
      <span>{$bpm}</span>
    </label>
  </div>

  <div class="right">
    <button on:click={() => {}}>Settings</button>
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
  }

  h1 {
    font-size: 1.25rem;
    margin: 0;
    color: #fff;
  }

  .center {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ccc;
    font-size: 0.875rem;
  }

  select, input[type="range"] {
    background: #2a2a4e;
    border: 1px solid #444;
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  button {
    background: #3a3a5e;
    border: 1px solid #555;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #4a4a6e;
  }

  .left, .right {
    flex: 1;
  }

  .right {
    text-align: right;
  }
</style>
