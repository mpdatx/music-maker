<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { LoopState } from '../lib/types';

  export let hasLoop: boolean = false;
  export let state: LoopState = 'inactive';
  export let instrumentColor: string = '#3a3a5e';

  const dispatch = createEventDispatcher<{
    tap: void;
    doubletap: void;
    contextmenu: void;
  }>();

  let lastTap = 0;
  const DOUBLE_TAP_DELAY = 300;

  function handleClick() {
    const now = Date.now();
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      dispatch('doubletap');
      lastTap = 0;
    } else {
      lastTap = now;
      setTimeout(() => {
        if (lastTap !== 0 && Date.now() - lastTap >= DOUBLE_TAP_DELAY) {
          dispatch('tap');
          lastTap = 0;
        }
      }, DOUBLE_TAP_DELAY);
    }
  }

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    dispatch('contextmenu');
  }
</script>

<button
  class="cell"
  class:has-loop={hasLoop}
  class:active={state === 'active'}
  class:queued={state === 'queued'}
  class:stopping={state === 'stopping'}
  style="--instrument-color: {instrumentColor}"
  on:click={handleClick}
  on:contextmenu={handleContextMenu}
>
  {#if hasLoop}
    <span class="indicator"></span>
  {/if}
</button>

<style>
  .cell {
    width: 100%;
    aspect-ratio: 1;
    background: var(--instrument-color);
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cell:hover {
    filter: brightness(1.2);
  }

  .cell.has-loop {
    border-color: rgba(255, 255, 255, 0.3);
  }

  .cell.active {
    border-color: #4ade80;
    box-shadow: 0 0 12px rgba(74, 222, 128, 0.4);
    animation: pulse 0.5s ease-in-out infinite;
  }

  .cell.queued {
    border-color: #fbbf24;
    animation: blink 0.5s ease-in-out infinite;
  }

  .cell.stopping {
    border-color: #f87171;
    opacity: 0.7;
  }

  .indicator {
    width: 12px;
    height: 12px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
  }

  .active .indicator {
    background: #4ade80;
  }

  .queued .indicator {
    background: #fbbf24;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
</style>
