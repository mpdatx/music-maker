<script lang="ts">
  let {
    note,
    color = '#3a3a5e',
    onpress,
    onrelease
  }: {
    note: string;
    color?: string;
    onpress?: () => void;
    onrelease?: () => void;
  } = $props();

  let isPressed = $state(false);
  let isFlipped = $state(false);

  function handlePointerDown(e: PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isPressed = true;
    isFlipped = true;
    onpress?.();
  }

  function handlePointerUp(e: PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    isPressed = false;
    // Keep flipped to show note name
    onrelease?.();
  }

  function handlePointerLeave() {
    if (isPressed) {
      isPressed = false;
      onrelease?.();
    }
  }

  // Format note for display (e.g., "C#4" -> "C#" and "4")
  function formatNote(n: string): { name: string; octave: string } {
    const match = n.match(/^([A-G]#?)(\d+)$/);
    if (!match) return { name: n, octave: '' };
    return { name: match[1], octave: match[2] };
  }

  let noteDisplay = $derived(formatNote(note));
</script>

<button
  class="note-button"
  class:pressed={isPressed}
  class:flipped={isFlipped}
  style="--button-color: {color}"
  onpointerdown={handlePointerDown}
  onpointerup={handlePointerUp}
  onpointerleave={handlePointerLeave}
  oncontextmenu={(e) => e.preventDefault()}
>
  <div class="button-inner">
    <div class="button-front"></div>
    <div class="button-back">
      <span class="note-name">{noteDisplay.name}</span>
      <span class="note-octave">{noteDisplay.octave}</span>
    </div>
  </div>
</button>

<style>
  .note-button {
    width: 100%;
    aspect-ratio: 1;
    max-width: 80px;
    perspective: 200px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    touch-action: none;
  }

  .button-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
    transform-style: preserve-3d;
  }

  .note-button.flipped .button-inner {
    transform: rotateY(180deg);
  }

  .note-button.pressed .button-inner {
    transform: rotateY(180deg) scale(0.95);
  }

  .button-front,
  .button-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .button-front {
    background: linear-gradient(145deg, #3a3a5e 0%, #2a2a4e 100%);
    border: 2px solid #4a4a6e;
    box-shadow:
      0 4px 6px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .button-back {
    background: linear-gradient(145deg, var(--button-color) 0%, color-mix(in srgb, var(--button-color) 70%, black) 100%);
    border: 2px solid color-mix(in srgb, var(--button-color) 80%, white);
    transform: rotateY(180deg);
    box-shadow:
      0 4px 6px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .note-button.pressed .button-back {
    box-shadow:
      0 2px 3px rgba(0, 0, 0, 0.3),
      inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .note-name {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    line-height: 1;
  }

  .note-octave {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 2px;
  }
</style>
