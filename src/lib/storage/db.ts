import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Project } from '../types';

interface MusicMakerDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-updated': number };
  };
}

const DB_NAME = 'music-maker';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MusicMakerDB>> | null = null;

function getDB(): Promise<IDBPDatabase<MusicMakerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MusicMakerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('projects', { keyPath: 'id' });
        store.createIndex('by-updated', 'updatedAt');
      },
    });
  }
  return dbPromise;
}

export async function saveProject(project: Project): Promise<void> {
  const db = await getDB();
  await db.put('projects', { ...project, updatedAt: Date.now() });
}

export async function loadProject(id: string): Promise<Project | undefined> {
  const db = await getDB();
  return db.get('projects', id);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('projects', id);
}

export async function listProjects(): Promise<Project[]> {
  const db = await getDB();
  const projects = await db.getAllFromIndex('projects', 'by-updated');
  return projects.reverse(); // Most recent first
}

export async function getProjectCount(): Promise<number> {
  const db = await getDB();
  return db.count('projects');
}

// Export project as JSON file
export function exportProjectAsJSON(project: Project): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import project from JSON file
export function importProjectFromJSON(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string) as Project;
        // Validate basic structure
        if (!project.id || !project.name || !project.tracks || !project.loops) {
          reject(new Error('Invalid project file'));
          return;
        }
        resolve(project);
      } catch (err) {
        reject(new Error('Failed to parse project file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
