<script lang="ts">
  import Header from './components/Header.svelte';
</script>

<main>
  <Header />
  <div class="content">
    <!-- Grid will go here -->
    <p style="color: #ccc; text-align: center; padding: 2rem;">Loop Grid Coming Soon</p>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f0f1a;
    color: #fff;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .content {
    flex: 1;
    padding: 1rem;
  }
</style>
