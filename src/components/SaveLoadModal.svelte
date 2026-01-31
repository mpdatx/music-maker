<script lang="ts">
  import { onMount } from 'svelte';
  import { project } from '../lib/stores';
  import {
    saveProject,
    loadProject,
    deleteProject,
    listProjects,
    exportProjectAsJSON,
    importProjectFromJSON
  } from '../lib/storage';
  import type { Project } from '../lib/types';

  export let open = false;
  export let onClose: () => void;
  export let onLoad: () => void;

  let savedProjects: Project[] = [];
  let projectName = '';
  let loading = false;
  let error = '';

  $: if (open) {
    loadProjectList();
    projectName = project.getSnapshot().name;
  }

  async function loadProjectList() {
    savedProjects = await listProjects();
  }

  async function handleSave() {
    loading = true;
    error = '';
    try {
      const currentProject = project.getSnapshot();
      currentProject.name = projectName || 'Untitled Project';
      project.setName(currentProject.name);
      await saveProject(currentProject);
      await loadProjectList();
      loading = false;
    } catch (e) {
      error = 'Failed to save project';
      loading = false;
    }
  }

  async function handleLoad(id: string) {
    loading = true;
    error = '';
    try {
      const loaded = await loadProject(id);
      if (loaded) {
        project.load(loaded);
        onLoad();
        onClose();
      }
    } catch (e) {
      error = 'Failed to load project';
    }
    loading = false;
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this project?')) {
      await deleteProject(id);
      await loadProjectList();
    }
  }

  function handleExport() {
    const currentProject = project.getSnapshot();
    currentProject.name = projectName || 'Untitled Project';
    exportProjectAsJSON(currentProject);
  }

  async function handleImport(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    loading = true;
    error = '';
    try {
      const imported = await importProjectFromJSON(file);
      // Give it a new ID so it doesn't overwrite existing
      imported.id = crypto.randomUUID();
      project.load(imported);
      onLoad();
      onClose();
    } catch (e) {
      error = (e as Error).message || 'Failed to import project';
    }
    loading = false;
    input.value = '';
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal">
      <div class="modal-header">
        <h2>Projects</h2>
        <button class="close-btn" onclick={onClose}>×</button>
      </div>

      <div class="modal-body">
        {#if error}
          <div class="error">{error}</div>
        {/if}

        <div class="save-section">
          <h3>Save Current Project</h3>
          <div class="save-row">
            <input
              type="text"
              bind:value={projectName}
              placeholder="Project name"
              class="name-input"
            />
            <button onclick={handleSave} disabled={loading}>
              Save
            </button>
            <button onclick={handleExport} class="secondary">
              Export JSON
            </button>
          </div>
        </div>

        <div class="import-section">
          <h3>Import Project</h3>
          <label class="import-btn">
            Import JSON File
            <input type="file" accept=".json" onchange={handleImport} hidden />
          </label>
        </div>

        <div class="projects-section">
          <h3>Saved Projects ({savedProjects.length})</h3>
          {#if savedProjects.length === 0}
            <p class="empty">No saved projects yet</p>
          {:else}
            <ul class="project-list">
              {#each savedProjects as proj}
                <li class="project-item">
                  <div class="project-info">
                    <span class="project-name">{proj.name}</span>
                    <span class="project-meta">
                      {proj.bpm} BPM · {proj.key} {proj.scale} · {formatDate(proj.updatedAt)}
                    </span>
                  </div>
                  <div class="project-actions">
                    <button onclick={() => handleLoad(proj.id)} disabled={loading}>
                      Load
                    </button>
                    <button onclick={() => handleDelete(proj.id)} class="danger">
                      Delete
                    </button>
                  </div>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: #1a1a2e;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    border: 1px solid #333;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #333;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  .close-btn {
    background: none;
    border: none;
    color: #888;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    color: #fff;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }

  h3 {
    margin: 0 0 0.75rem;
    font-size: 0.875rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .error {
    background: #f8717133;
    color: #f87171;
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  .save-section, .import-section, .projects-section {
    margin-bottom: 1.5rem;
  }

  .save-row {
    display: flex;
    gap: 0.5rem;
  }

  .name-input {
    flex: 1;
    background: #2a2a4e;
    border: 1px solid #444;
    color: #fff;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .name-input:focus {
    outline: none;
    border-color: #7c3aed;
  }

  button {
    background: #7c3aed;
    border: none;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    white-space: nowrap;
  }

  button:hover:not(:disabled) {
    background: #9333ea;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button.secondary {
    background: #3a3a5e;
  }

  button.secondary:hover:not(:disabled) {
    background: #4a4a6e;
  }

  button.danger {
    background: #dc2626;
  }

  button.danger:hover:not(:disabled) {
    background: #ef4444;
  }

  .import-btn {
    display: inline-block;
    background: #3a3a5e;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .import-btn:hover {
    background: #4a4a6e;
  }

  .empty {
    color: #666;
    font-style: italic;
  }

  .project-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .project-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #2a2a4e;
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }

  .project-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .project-name {
    font-weight: 500;
  }

  .project-meta {
    font-size: 0.75rem;
    color: #888;
  }

  .project-actions {
    display: flex;
    gap: 0.5rem;
  }

  .project-actions button {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
</style>
