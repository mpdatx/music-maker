<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { playback, isPlaying } from '../lib/stores';
  import { transport, initAudio } from '../lib/audio';

  let position = '0:0:0';
  let animationFrame: number;

  function updatePosition() {
    position = transport.getPosition();
    animationFrame = requestAnimationFrame(updatePosition);
  }

  async function handlePlayPause() {
    await initAudio();
    transport.toggle();
    playback.setTransportState(transport.getState());
  }

  function handleStop() {
    transport.stop();
    playback.reset();
  }

  onMount(() => {
    animationFrame = requestAnimationFrame(updatePosition);
  });

  onDestroy(() => {
    cancelAnimationFrame(animationFrame);
  });
</script>

<div class="transport">
  <button class="transport-btn" on:click={handlePlayPause}>
    {#if $isPlaying}
      <span class="icon">⏸</span>
    {:else}
      <span class="icon">▶</span>
    {/if}
  </button>

  <button class="transport-btn" on:click={handleStop}>
    <span class="icon">⏹</span>
  </button>

  <div class="position">
    {position}
  </div>
</div>

<style>
  .transport {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    background: #1a1a2e;
    border-top: 1px solid #333;
  }

  .transport-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid #555;
    background: #2a2a4e;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .transport-btn:hover {
    background: #3a3a5e;
    border-color: #666;
  }

  .icon {
    font-size: 1.25rem;
  }

  .position {
    font-family: monospace;
    font-size: 1rem;
    color: #888;
    min-width: 100px;
    text-align: center;
  }
</style>
