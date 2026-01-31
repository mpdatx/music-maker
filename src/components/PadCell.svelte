<script lang="ts">
  let {
    note,
    isInScale = true,
    onPress,
    onRelease,
  }: {
    note: string;
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
    border: 1px solid #333;
    border-radius: 8px;
    background: linear-gradient(145deg, #2a2a4e, #1a1a2e);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.05s, background 0.1s, box-shadow 0.1s;
    user-select: none;
    touch-action: none;
  }

  .pad-cell:hover {
    background: linear-gradient(145deg, #3a3a5e, #2a2a4e);
  }

  .pad-cell.pressed {
    transform: scale(0.95);
    background: linear-gradient(145deg, #7c3aed, #5b21b6);
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.1);
  }

  .pad-cell.in-scale {
    border-color: #4a4a6e;
  }

  .pad-cell.accidental {
    background: linear-gradient(145deg, #1f1f35, #15152a);
  }

  .pad-cell.accidental:hover {
    background: linear-gradient(145deg, #2a2a45, #1f1f35);
  }

  .pad-cell.accidental.pressed {
    background: linear-gradient(145deg, #6d28d9, #4c1d95);
  }

  .note-label {
    font-size: 0.7rem;
    color: #888;
    font-weight: 500;
    pointer-events: none;
  }

  .pad-cell.pressed .note-label {
    color: #fff;
  }
</style>
