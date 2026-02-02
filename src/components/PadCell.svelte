<script lang="ts">
  let {
    note,
    color = '#3a3a5e',
    isInScale = true,
    onPress,
    onRelease,
  }: {
    note: string;
    color?: string;
    isInScale?: boolean;
    onPress: () => void;
    onRelease: () => void;
  } = $props();

  let isPressed = $state(false);

  function handlePointerDown(e: PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isPressed = true;
    onPress();
  }

  function handlePointerUp(e: PointerEvent) {
    e.preventDefault();
    isPressed = false;
    onRelease();
  }

  function handlePointerLeave(e: PointerEvent) {
    if (isPressed) {
      isPressed = false;
      onRelease();
    }
  }

  function handlePointerEnter(e: PointerEvent) {
    // For drag-to-play: if pointer is down when entering, trigger note
    if (e.buttons > 0 && !isPressed) {
      isPressed = true;
      onPress();
    }
  }
</script>

<button
  class="pad-cell"
  class:pressed={isPressed}
  class:in-scale={isInScale}
  class:accidental={note.includes('#')}
  style="--cell-color: {color}"
  onpointerdown={handlePointerDown}
  onpointerup={handlePointerUp}
  onpointerleave={handlePointerLeave}
  onpointerenter={handlePointerEnter}
  oncontextmenu={(e) => e.preventDefault()}
>
  <span class="note-label">{note}</span>
</button>

<style>
  .pad-cell {
    width: 100%;
    aspect-ratio: 1;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    background: var(--cell-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.05s, border-color 0.15s, box-shadow 0.15s, filter 0.1s;
    user-select: none;
    touch-action: none;
  }

  .pad-cell:hover {
    filter: brightness(1.2);
  }

  .pad-cell.pressed {
    transform: scale(0.95);
    border-color: #4ade80;
    box-shadow: 0 0 12px rgba(74, 222, 128, 0.4);
  }

  .pad-cell.accidental {
    filter: brightness(0.7);
  }

  .pad-cell.accidental:hover {
    filter: brightness(0.85);
  }

  .note-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    pointer-events: none;
  }

  .pad-cell.pressed .note-label {
    color: #4ade80;
  }
</style>
