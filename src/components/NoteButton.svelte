<script lang="ts">
  import { onMount } from 'svelte';

  let {
    note,
    color = '#3a3a5e',
    flipped = true,
    index = 0,
    active = false,
    dragging = false,
    disabled = false,
    onpress,
    onrelease,
    onenter,
    ondragend
  }: {
    note: string;
    color?: string;
    flipped?: boolean;
    index?: number;
    active?: boolean;
    dragging?: boolean;
    disabled?: boolean;
    onpress?: () => void;
    onrelease?: () => void;
    onenter?: () => void;
    ondragend?: () => void;
  } = $props();

  let isFlipped = $state(false);
  let buttonEl: HTMLButtonElement;

  // Stagger animation based on index
  $effect(() => {
    const delay = index * 30;
    const timeout = setTimeout(() => {
      isFlipped = flipped;
    }, delay);
    return () => clearTimeout(timeout);
  });

  function handlePointerDown(e: PointerEvent) {
    if (disabled) return;
    e.preventDefault();
    // Don't capture - allow pointer to move to other buttons
    onpress?.();
  }

  function handlePointerUp(e: PointerEvent) {
    if (disabled) return;
    onrelease?.();
    ondragend?.();
  }

  function handlePointerEnter(e: PointerEvent) {
    if (disabled) return;
    // Glissando: trigger note when entering while dragging
    if (dragging && e.buttons > 0) {
      onenter?.();
    }
  }

  // Handle global pointer up to end drag
  onMount(() => {
    function handleGlobalPointerUp() {
      if (active) {
        ondragend?.();
      }
    }
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  });

  // Format note for display (e.g., "C#4" -> "C#" and "4")
  function formatNote(n: string): { name: string; octave: string } {
    const match = n.match(/^([A-G]#?)(\d+)$/);
    if (!match) return { name: n, octave: '' };
    return { name: match[1], octave: match[2] };
  }

  let noteDisplay = $derived(formatNote(note));
</script>

<button
  bind:this={buttonEl}
  class="note-button"
  class:pressed={active}
  class:flipped={isFlipped}
  class:disabled={disabled}
  style="--button-color: {color}"
  onpointerdown={handlePointerDown}
  onpointerup={handlePointerUp}
  onpointerenter={handlePointerEnter}
  oncontextmenu={(e) => e.preventDefault()}
>
  <span class="note-name">{noteDisplay.name}</span>
  <span class="note-octave">{noteDisplay.octave}</span>
</button>

<style>
  .note-button {
    width: 100%;
    aspect-ratio: 1;
    max-width: 80px;
    background: var(--button-color);
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    padding: 0;
    touch-action: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease, opacity 0.3s ease;
    opacity: 0;
  }

  .note-button.flipped {
    opacity: 1;
    border-color: rgba(255, 255, 255, 0.3);
  }

  .note-button:hover {
    filter: brightness(1.2);
  }

  .note-button.pressed {
    border-color: #4ade80;
    box-shadow: 0 0 12px rgba(74, 222, 128, 0.4);
    transform: scale(0.95);
  }

  .note-button.disabled {
    cursor: not-allowed;
    opacity: 0.4 !important;
  }

  .note-name {
    font-size: 1.25rem;
    font-weight: bold;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    line-height: 1;
  }

  .note-octave {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 2px;
  }
</style>
