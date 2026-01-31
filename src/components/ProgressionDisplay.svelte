<script lang="ts">
  import { progressionStore, currentProgression, currentChordIndex, progressionsForCurrentGenre } from '../lib/stores/progression';
  import type { ChordProgression } from '../lib/types/music';

  let showSelector = false;

  function selectProgression(prog: ChordProgression) {
    progressionStore.setProgression(prog);
    showSelector = false;
  }
</script>

<div class="progression-display">
  <button
    class="progression-button"
    onclick={() => showSelector = !showSelector}
  >
    <span class="progression-name">{$currentProgression.name}</span>
    <span class="progression-chords">
      {#each $currentProgression.chords as chord, i}
        <span
          class="chord"
          class:active={i === $currentChordIndex}
        >
          {chord}
        </span>
        {#if i < $currentProgression.chords.length - 1}
          <span class="separator">-</span>
        {/if}
      {/each}
    </span>
  </button>

  {#if showSelector}
    <div class="progression-selector">
      {#each $progressionsForCurrentGenre as prog}
        <button
          class="progression-option"
          class:selected={prog.id === $currentProgression.id}
          onclick={() => selectProgression(prog)}
        >
          <span class="option-name">{prog.name}</span>
          <span class="option-chords">
            {prog.chords.join(' - ')}
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .progression-display {
    position: relative;
    display: inline-block;
  }

  .progression-button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 1rem;
    background: var(--surface-2, #2a2a2a);
    border: 1px solid var(--border, #444);
    border-radius: 0.5rem;
    cursor: pointer;
    color: inherit;
  }

  .progression-name {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-bottom: 0.25rem;
  }

  .progression-chords {
    display: flex;
    gap: 0.25rem;
    font-family: monospace;
  }

  .chord {
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.15s;
  }

  .chord.active {
    background: var(--accent, #4a9eff);
    color: white;
  }

  .separator {
    opacity: 0.5;
  }

  .progression-selector {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    min-width: 200px;
    margin-top: 0.25rem;
    background: var(--surface-2, #2a2a2a);
    border: 1px solid var(--border, #444);
    border-radius: 0.5rem;
    overflow: hidden;
    z-index: 100;
  }

  .progression-option {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0.5rem 1rem;
    background: none;
    border: none;
    border-bottom: 1px solid var(--border, #444);
    cursor: pointer;
    text-align: left;
    color: inherit;
  }

  .progression-option:last-child {
    border-bottom: none;
  }

  .progression-option:hover {
    background: var(--surface-3, #333);
  }

  .progression-option.selected {
    background: var(--accent-dim, #2a5a8f);
  }

  .option-name {
    font-weight: 500;
    margin-bottom: 0.125rem;
  }

  .option-chords {
    font-size: 0.75rem;
    font-family: monospace;
    opacity: 0.7;
  }
</style>
