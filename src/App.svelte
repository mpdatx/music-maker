<script lang="ts">
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';
  import LoopGrid from './components/LoopGrid.svelte';
  import PadGrid from './components/PadGrid.svelte';
  import SaveLoadModal from './components/SaveLoadModal.svelte';
  import { playback, project, playMode } from './lib/stores';
  import { transport, initAudio } from './lib/audio';
  import { saveProject } from './lib/storage';

  let loopGrid: LoopGrid;
  let saveLoadOpen = false;

  function handleKeydown(e: KeyboardEvent) {
    // Cmd/Ctrl+S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleQuickSave();
      return;
    }

    // Ignore if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

    if (e.code === 'Space') {
      e.preventDefault();
      handlePlayPause();
    } else if (e.code === 'Escape') {
      handleStop();
    }
  }

  async function handleQuickSave() {
    const currentProject = project.getSnapshot();
    await saveProject(currentProject);
    // Brief visual feedback could be added here
    console.log('Project saved:', currentProject.name);
  }

  async function handlePlayPause() {
    await initAudio();
    transport.toggle();
    playback.setTransportState(transport.getState());
  }

  function handleStop() {
    transport.stop();
    playback.reset();
    loopGrid?.stopAll();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<main>
  <Header
    on:regenerateAll={() => loopGrid?.stopAll()}
    on:openSaveLoad={() => saveLoadOpen = true}
    on:stopAll={() => loopGrid?.stopAll()}
  />
  <div class="content">
    {#if $playMode === 'pad'}
      <PadGrid />
    {:else}
      <LoopGrid bind:this={loopGrid} />
    {/if}
  </div>
</main>

<SaveLoadModal
  open={saveLoadOpen}
  onClose={() => saveLoadOpen = false}
  onLoad={() => loopGrid?.stopAll()}
/>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f0f1a;
    color: #fff;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
  }
</style>
