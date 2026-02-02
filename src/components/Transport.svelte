<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { playback, isPlaying, bpm } from '../lib/stores';
  import { transport, initAudio, setMasterVolume } from '../lib/audio';

  const dispatch = createEventDispatcher<{
    stop: void;
  }>();

  let volume = 80; // 0-100 scale

  async function handlePlayPause() {
    await initAudio();
    transport.toggle();
    playback.setTransportState(transport.getState());
  }

  function handleStop() {
    transport.stop();
    transport.position = 0; // Reset position so Parts starting at 0 will play immediately
    playback.reset();
    dispatch('stop');
  }

  function handleVolumeChange(e: Event) {
    volume = parseInt((e.target as HTMLInputElement).value);
    // Convert 0-100 to decibels (-60 to 0)
    const db = volume === 0 ? -Infinity : (volume / 100) * 60 - 60;
    setMasterVolume(db);
  }
</script>

<div class="transport">
  <div class="volume-control">
    <span class="volume-icon">{volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}</span>
    <input
      type="range"
      min="0"
      max="100"
      value={volume}
      on:input={handleVolumeChange}
      class="volume-slider"
    />
  </div>

  <button class="transport-btn play-btn" class:playing={$isPlaying} on:click={handlePlayPause}>
    {#if $isPlaying}
      <span class="icon">⏸</span>
    {:else}
      <span class="icon">▶</span>
    {/if}
  </button>

  <button class="transport-btn stop-btn" on:click={handleStop}>
    <span class="icon">⏹</span>
  </button>

  <div class="bpm-display">
    {$bpm} BPM
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
    position: relative;
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

  .play-btn.playing {
    background: #4ade80;
    border-color: #4ade80;
    color: #1a1a2e;
  }

  .stop-btn:hover {
    background: #f87171;
    border-color: #f87171;
  }

  .bpm-display {
    position: absolute;
    right: 1rem;
    font-size: 0.875rem;
    color: #888;
    font-variant-numeric: tabular-nums;
  }

  .volume-control {
    position: absolute;
    left: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .volume-icon {
    font-size: 1rem;
  }

  .volume-slider {
    width: 100px;
    height: 44px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }

  .volume-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: #444;
    border-radius: 4px;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    margin-top: -8px;
  }

  .volume-slider::-moz-range-track {
    width: 100%;
    height: 8px;
    background: #444;
    border-radius: 4px;
  }

  .volume-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
</style>
