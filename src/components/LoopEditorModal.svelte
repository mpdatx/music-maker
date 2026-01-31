<script lang="ts">
  import { project, loops, musicalKey, scale, genre } from '../lib/stores';
  import type { Loop, InstrumentType } from '../lib/types';
  import { generateLoop, GENRE_PRESETS } from '../lib/generators';
  import DrumSequencer from './DrumSequencer.svelte';
  import PianoRoll from './PianoRoll.svelte';

  let {
    open = false,
    loopId = null as string | null,
    trackType = 'drums' as InstrumentType,
    onClose
  }: {
    open?: boolean;
    loopId?: string | null;
    trackType?: InstrumentType;
    onClose: () => void;
  } = $props();

  let loop = $derived(loopId ? $loops[loopId] : null);
  let isDrums = $derived(trackType === 'drums' || trackType === 'percussion');

  function handleUpdateNotes(notes: Loop['notes']) {
    if (loopId && loop) {
      project.updateLoop(loopId, { notes });
    }
  }

  function handleRegenerate() {
    if (!loop) return;

    const newLoop = generateLoop(
      trackType,
      GENRE_PRESETS[$genre].defaultParams,
      $musicalKey,
      $scale,
      undefined,
      loop.bars
    );

    // Keep the same ID but replace notes
    project.updateLoop(loop.id, { notes: newLoop.notes, seed: newLoop.seed });
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open && loop}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
  <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true">
    <div class="modal">
      <div class="modal-header">
        <h2>Edit Loop</h2>
        <button class="close-btn" onclick={onClose}>×</button>
      </div>

      <div class="modal-body">
        {#if isDrums}
          <DrumSequencer {loop} onUpdate={handleUpdateNotes} />
        {:else}
          <PianoRoll
            {loop}
            musicalKey={$musicalKey}
            scale={$scale}
            onUpdate={handleUpdateNotes}
          />
        {/if}
      </div>

      <div class="modal-footer">
        <span class="hint">
          {#if isDrums}
            Click to toggle steps. Use fill buttons for quick patterns.
          {:else}
            Click to add/remove notes. Drag to paint. Green notes are in scale.
          {/if}
        </span>
        <div class="footer-buttons">
          <button class="regenerate-btn" onclick={handleRegenerate}>🎲 Regenerate</button>
          <button class="done-btn" onclick={onClose}>Done</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: #1a1a2e;
    border-radius: 12px;
    width: 95%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    border: 1px solid #333;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #333;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  .close-btn {
    background: none;
    border: none;
    color: #888;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    color: #fff;
  }

  .modal-body {
    padding: 1.5rem;
    overflow: auto;
    flex: 1;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-top: 1px solid #333;
  }

  .hint {
    font-size: 0.75rem;
    color: #666;
  }

  .footer-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .regenerate-btn {
    background: #3a3a5e;
    border: none;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .regenerate-btn:hover {
    background: #4a4a6e;
  }

  .done-btn {
    background: #7c3aed;
    border: none;
    color: #fff;
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .done-btn:hover {
    background: #9333ea;
  }
</style>
