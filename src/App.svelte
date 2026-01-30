<script lang="ts">
  import Header from './components/Header.svelte';
  import LoopGrid from './components/LoopGrid.svelte';
  import Transport from './components/Transport.svelte';
</script>

<main>
  <Header />
  <div class="content">
    <LoopGrid />
  </div>
  <Transport />
</main>

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
