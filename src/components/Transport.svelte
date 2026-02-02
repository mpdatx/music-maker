<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { playback, isPlaying, bpm, project, globalStaffView } from '../lib/stores';
  import { transport, initAudio, setMasterVolume } from '../lib/audio';

  const dispatch = createEventDispatcher<{
    stop: void;
  }>();

  let volume = 80; // 0-100 scale
  let bpmInput = $state($bpm.toString());

  // Sync bpmInput when store changes externally
  $effect(() => {
    bpmInput = $bpm.toString();
  });

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

  function handleBpmChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (!isNaN(value) && value >= 40 && value <= 240) {
      project.setBpm(value);
      transport.setBpm(value);
    }
  }

  function handleBpmBlur() {
    // Reset to valid value if invalid
    const value = parseInt(bpmInput);
    if (isNaN(value) || value < 40 || value > 240) {
      bpmInput = $bpm.toString();
    }
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

  <button
    class="transport-btn staff-btn"
    class:active={$globalStaffView}
    on:click={() => globalStaffView.update(v => !v)}
    title="Toggle all tracks to staff view"
  >
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
    </svg>
  </button>

  <div class="bpm-control">
    <input
      type="text"
      inputmode="numeric"
      class="bpm-input"
      bind:value={bpmInput}
      onchange={handleBpmChange}
      onblur={handleBpmBlur}
    />
    <span class="bpm-label">BPM</span>
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

  .staff-btn {
    padding: 12px;
  }

  .staff-btn svg {
    width: 100%;
    height: 100%;
  }

  .staff-btn.active {
    background: #8b5cf6;
    border-color: #8b5cf6;
  }

  .bpm-control {
    position: absolute;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .bpm-input {
    width: 50px;
    height: 44px;
    background: #2a2a4e;
    border: 1px solid #444;
    border-radius: 6px;
    color: #fff;
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  .bpm-input:focus {
    outline: none;
    border-color: #4ade80;
  }

  .bpm-label {
    font-size: 0.75rem;
    color: #888;
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
