<script lang="ts">
  import { loadingStore, isLoading, loadingProgress, loadingMessage } from '../lib/stores';

  // Reactive bindings
  let showing = $derived($isLoading);
  let progress = $derived($loadingProgress);
  let message = $derived($loadingMessage);
</script>

{#if showing}
  <div class="overlay">
    <div class="loader">
      <div class="spinner"></div>
      <div class="message">{message || 'Loading...'}</div>
      {#if progress > 0 && progress < 100}
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progress}%"></div>
        </div>
        <div class="progress-text">{progress}%</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 15, 26, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid #333;
    border-top-color: #7c3aed;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .message {
    color: #888;
    font-size: 0.9rem;
  }

  .progress-bar {
    width: 200px;
    height: 4px;
    background: #333;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #7c3aed;
    transition: width 0.2s ease;
  }

  .progress-text {
    color: #666;
    font-size: 0.75rem;
  }
</style>
