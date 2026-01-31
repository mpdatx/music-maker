// src/lib/generators/rhythm/templates/drums.ts
import type { GenrePreset } from '../../../types/music';
import type { RhythmTemplate, EnergyLevel, TemplateStep } from '../types';

// Helper to create kick/snare/hihat patterns
function drumTemplate(
  id: string,
  name: string,
  genre: GenrePreset,
  energy: EnergyLevel,
  feel: 'straight' | 'swung' | 'syncopated',
  kick: number[],
  snare: number[],
  hihat: number[]
): RhythmTemplate {
  const steps: TemplateStep[] = [
    ...kick.map(p => ({ position: p, velocity: 0.9, duration: '8n', accent: p === 0 })),
    ...snare.map(p => ({ position: p, velocity: 0.85, duration: '8n', accent: true })),
    ...hihat.map(p => ({ position: p, velocity: 0.6, duration: '16n' })),
  ];
  return {
    id, name, genre, instrument: 'drums', energyLevel: energy, feel, steps,
    variationPoints: [2, 6, 10, 14],
  };
}

const LOFI_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('lofi-lazy', 'Lazy Boom-Bap', 'lofi-hiphop', 'low', 'swung', [0, 10], [4, 12], [0, 4, 8, 12]),
  drumTemplate('lofi-dusty', 'Dusty Groove', 'lofi-hiphop', 'low', 'swung', [0, 6], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('lofi-chill', 'Chill Pocket', 'lofi-hiphop', 'mid', 'swung', [0, 6, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('lofi-bounce', 'Vinyl Bounce', 'lofi-hiphop', 'mid', 'swung', [0, 3, 8, 11], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('lofi-tape', 'Tape Hiss', 'lofi-hiphop', 'mid', 'syncopated', [0, 5, 10], [4, 14], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('lofi-head-nod', 'Head Nod', 'lofi-hiphop', 'high', 'swung', [0, 3, 6, 10, 13], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
];

const EDM_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('edm-minimal', 'Minimal Pulse', 'edm-house', 'low', 'straight', [0, 4, 8, 12], [], [2, 6, 10, 14]),
  drumTemplate('edm-four-floor', 'Four on Floor', 'edm-house', 'mid', 'straight', [0, 4, 8, 12], [4, 12], [2, 6, 10, 14]),
  drumTemplate('edm-driving', 'Driving House', 'edm-house', 'mid', 'straight', [0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('edm-offbeat', 'Offbeat Hats', 'edm-house', 'mid', 'syncopated', [0, 4, 8, 12], [4, 12], [1, 3, 5, 7, 9, 11, 13, 15]),
  drumTemplate('edm-peak', 'Peak Time', 'edm-house', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14], [4, 12], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
  drumTemplate('edm-drop', 'Drop Pattern', 'edm-house', 'high', 'syncopated', [0, 3, 4, 7, 8, 11, 12, 15], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
];

const ROCK_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('rock-ballad', 'Slow Ballad', 'rock', 'low', 'straight', [0, 8], [4, 12], [0, 4, 8, 12]),
  drumTemplate('rock-basic', 'Basic Rock', 'rock', 'mid', 'straight', [0, 8], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('rock-drive', 'Driving Beat', 'rock', 'mid', 'straight', [0, 6, 8, 14], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('rock-shuffle', 'Rock Shuffle', 'rock', 'mid', 'swung', [0, 8], [4, 12], [0, 3, 4, 7, 8, 11, 12, 15]),
  drumTemplate('rock-punk', 'Punk Drive', 'rock', 'high', 'straight', [0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('rock-double', 'Double Time', 'rock', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14], [4, 12], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
];

const FUNK_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('funk-pocket', 'Deep Pocket', 'funk', 'low', 'syncopated', [0, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('funk-classic', 'Classic Funk', 'funk', 'mid', 'syncopated', [0, 6, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('funk-chicken', 'Chicken Grease', 'funk', 'mid', 'syncopated', [0, 3, 6, 10, 13], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('funk-one', 'On The One', 'funk', 'mid', 'syncopated', [0], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('funk-busy', 'Busy Funk', 'funk', 'high', 'syncopated', [0, 3, 5, 8, 10, 13], [4, 12, 14], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('funk-slap', 'Slap Back', 'funk', 'high', 'syncopated', [0, 3, 6, 8, 11, 14], [4, 10, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
];

const POP_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('pop-simple', 'Simple Pop', 'pop', 'low', 'straight', [0, 8], [4, 12], [0, 4, 8, 12]),
  drumTemplate('pop-standard', 'Standard Pop', 'pop', 'mid', 'straight', [0, 8], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('pop-modern', 'Modern Pop', 'pop', 'mid', 'straight', [0, 6, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('pop-dance', 'Dance Pop', 'pop', 'mid', 'straight', [0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('pop-energy', 'High Energy', 'pop', 'high', 'straight', [0, 4, 6, 8, 12, 14], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('pop-anthem', 'Anthem', 'pop', 'high', 'straight', [0, 4, 8, 12], [4, 12], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
];

const AMBIENT_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('ambient-sparse', 'Sparse Pulse', 'ambient', 'low', 'straight', [0], [], []),
  drumTemplate('ambient-breath', 'Breathing', 'ambient', 'low', 'straight', [0, 8], [], [0, 8]),
  drumTemplate('ambient-texture', 'Textural', 'ambient', 'mid', 'straight', [0, 6, 12], [], [0, 4, 8, 12]),
  drumTemplate('ambient-pulse', 'Soft Pulse', 'ambient', 'mid', 'straight', [0, 4, 8, 12], [], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('ambient-wave', 'Wave', 'ambient', 'mid', 'swung', [0, 8], [12], [0, 4, 8, 12]),
  drumTemplate('ambient-build', 'Building', 'ambient', 'high', 'straight', [0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
];

const JAZZ_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('jazz-brush', 'Brush Swing', 'jazz', 'low', 'swung', [0, 8], [4, 12], [0, 3, 4, 7, 8, 11, 12, 15]),
  drumTemplate('jazz-ride', 'Ride Swing', 'jazz', 'mid', 'swung', [0, 8], [4, 12], [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15]),
  drumTemplate('jazz-bebop', 'Bebop', 'jazz', 'mid', 'swung', [0, 6, 10], [4, 12], [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15]),
  drumTemplate('jazz-latin', 'Latin Jazz', 'jazz', 'mid', 'syncopated', [0, 3, 6, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('jazz-uptempo', 'Uptempo Swing', 'jazz', 'high', 'swung', [0, 4, 8, 12], [4, 12], [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15]),
];

const CLASSICAL_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('classical-sparse', 'Sparse', 'classical', 'low', 'straight', [0], [], []),
  drumTemplate('classical-timpani', 'Timpani', 'classical', 'low', 'straight', [0, 8], [], []),
  drumTemplate('classical-march', 'March', 'classical', 'mid', 'straight', [0, 4, 8, 12], [4, 12], []),
  drumTemplate('classical-waltz', 'Waltz Feel', 'classical', 'mid', 'straight', [0], [4, 8], []),
  drumTemplate('classical-dramatic', 'Dramatic', 'classical', 'high', 'straight', [0, 4, 8, 12], [4, 12], [0, 4, 8, 12]),
];

const BOSSA_NOVA_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('bossa-basic', 'Basic Bossa', 'bossa-nova', 'low', 'swung', [0, 8], [], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('bossa-classic', 'Classic Bossa', 'bossa-nova', 'mid', 'swung', [0, 6, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('bossa-partido', 'Partido Alto', 'bossa-nova', 'mid', 'syncopated', [0, 3, 6, 10, 14], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('bossa-samba', 'Samba Feel', 'bossa-nova', 'high', 'syncopated', [0, 3, 6, 8, 10, 13], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
];

const BLUES_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('blues-slow', 'Slow Blues', 'blues', 'low', 'swung', [0, 8], [4, 12], [0, 3, 4, 7, 8, 11, 12, 15]),
  drumTemplate('blues-shuffle', 'Blues Shuffle', 'blues', 'mid', 'swung', [0, 8], [4, 12], [0, 3, 4, 7, 8, 11, 12, 15]),
  drumTemplate('blues-chicago', 'Chicago Blues', 'blues', 'mid', 'swung', [0, 6, 8, 14], [4, 12], [0, 3, 4, 7, 8, 11, 12, 15]),
  drumTemplate('blues-boogie', 'Boogie', 'blues', 'high', 'swung', [0, 3, 8, 11], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
];

const REGGAE_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('reggae-one-drop', 'One Drop', 'reggae', 'low', 'straight', [0], [12], [0, 4, 8, 12]),
  drumTemplate('reggae-roots', 'Roots', 'reggae', 'mid', 'straight', [0, 12], [6, 14], [2, 6, 10, 14]),
  drumTemplate('reggae-steppers', 'Steppers', 'reggae', 'mid', 'straight', [0, 4, 8, 12], [4, 12], [2, 6, 10, 14]),
  drumTemplate('reggae-dancehall', 'Dancehall', 'reggae', 'high', 'syncopated', [0, 3, 6, 10, 12], [4, 14], [2, 6, 10, 14]),
];

const CINEMATIC_TEMPLATES: RhythmTemplate[] = [
  drumTemplate('cinematic-sparse', 'Sparse Tension', 'cinematic', 'low', 'straight', [0], [], []),
  drumTemplate('cinematic-pulse', 'Pulse', 'cinematic', 'low', 'straight', [0, 8], [], []),
  drumTemplate('cinematic-march', 'Epic March', 'cinematic', 'mid', 'straight', [0, 4, 8, 12], [], [0, 4, 8, 12]),
  drumTemplate('cinematic-tension', 'Tension Build', 'cinematic', 'mid', 'straight', [0, 6, 10], [12], [0, 2, 4, 6, 8, 10, 12, 14]),
  drumTemplate('cinematic-epic', 'Epic Drums', 'cinematic', 'high', 'straight', [0, 4, 8, 12], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
];

const DRUM_TEMPLATES: Record<GenrePreset, RhythmTemplate[]> = {
  'lofi-hiphop': LOFI_TEMPLATES,
  'edm-house': EDM_TEMPLATES,
  'rock': ROCK_TEMPLATES,
  'funk': FUNK_TEMPLATES,
  'pop': POP_TEMPLATES,
  'ambient': AMBIENT_TEMPLATES,
  'jazz': JAZZ_TEMPLATES,
  'classical': CLASSICAL_TEMPLATES,
  'bossa-nova': BOSSA_NOVA_TEMPLATES,
  'blues': BLUES_TEMPLATES,
  'reggae': REGGAE_TEMPLATES,
  'cinematic': CINEMATIC_TEMPLATES,
};

export function getDrumTemplates(genre: GenrePreset): RhythmTemplate[] {
  // Use pop templates as fallback for undefined genres
  return DRUM_TEMPLATES[genre] ?? POP_TEMPLATES;
}

export function getDrumTemplatesByEnergy(genre: GenrePreset, energy: EnergyLevel): RhythmTemplate[] {
  return getDrumTemplates(genre).filter(t => t.energyLevel === energy);
}
