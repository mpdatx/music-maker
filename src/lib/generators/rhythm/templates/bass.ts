// src/lib/generators/rhythm/templates/bass.ts
import type { GenrePreset } from '../../../types/music';
import type { RhythmTemplate, EnergyLevel, TemplateStep } from '../types';

function bassTemplate(
  id: string,
  name: string,
  genre: GenrePreset,
  energy: EnergyLevel,
  feel: 'straight' | 'swung' | 'syncopated',
  positions: number[]
): RhythmTemplate {
  const steps: TemplateStep[] = positions.map((p, i) => ({
    position: p,
    velocity: p === 0 ? 0.9 : 0.8,
    duration: '8n',
    accent: p === 0 || i === 0,
  }));
  return {
    id, name, genre, instrument: 'bass', energyLevel: energy, feel, steps,
    variationPoints: positions.filter(p => p !== 0),
  };
}

const BASS_TEMPLATES: Record<GenrePreset, RhythmTemplate[]> = {
  'lofi-hiphop': [
    bassTemplate('lofi-bass-root', 'Root Notes', 'lofi-hiphop', 'low', 'swung', [0, 8]),
    bassTemplate('lofi-bass-lazy', 'Lazy Walk', 'lofi-hiphop', 'low', 'swung', [0, 6, 10]),
    bassTemplate('lofi-bass-bounce', 'Bounce', 'lofi-hiphop', 'mid', 'swung', [0, 3, 8, 11]),
    bassTemplate('lofi-bass-groove', 'Groove', 'lofi-hiphop', 'mid', 'swung', [0, 4, 6, 10, 14]),
    bassTemplate('lofi-bass-busy', 'Busy Line', 'lofi-hiphop', 'high', 'syncopated', [0, 3, 6, 8, 10, 13]),
  ],
  'edm-house': [
    bassTemplate('edm-bass-pulse', 'Pulse', 'edm-house', 'low', 'straight', [0, 4, 8, 12]),
    bassTemplate('edm-bass-offbeat', 'Offbeat', 'edm-house', 'mid', 'syncopated', [2, 6, 10, 14]),
    bassTemplate('edm-bass-drive', 'Driving', 'edm-house', 'mid', 'straight', [0, 2, 4, 6, 8, 10, 12, 14]),
    bassTemplate('edm-bass-stab', 'Stab', 'edm-house', 'high', 'syncopated', [0, 3, 6, 8, 11, 14]),
    bassTemplate('edm-bass-arp', 'Arp Bass', 'edm-house', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14]),
  ],
  'rock': [
    bassTemplate('rock-bass-whole', 'Whole Notes', 'rock', 'low', 'straight', [0]),
    bassTemplate('rock-bass-root', 'Root Eighth', 'rock', 'mid', 'straight', [0, 8]),
    bassTemplate('rock-bass-drive', 'Driving', 'rock', 'mid', 'straight', [0, 4, 8, 12]),
    bassTemplate('rock-bass-walk', 'Walking', 'rock', 'mid', 'straight', [0, 4, 6, 8, 12, 14]),
    bassTemplate('rock-bass-punk', 'Punk', 'rock', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14]),
  ],
  'funk': [
    bassTemplate('funk-bass-pocket', 'Deep Pocket', 'funk', 'low', 'syncopated', [0, 10]),
    bassTemplate('funk-bass-classic', 'Classic Funk', 'funk', 'mid', 'syncopated', [0, 3, 6, 10, 12]),
    bassTemplate('funk-bass-slap', 'Slap', 'funk', 'mid', 'syncopated', [0, 2, 6, 8, 10, 14]),
    bassTemplate('funk-bass-busy', 'Busy', 'funk', 'high', 'syncopated', [0, 2, 3, 6, 8, 10, 12, 14]),
    bassTemplate('funk-bass-thumb', 'Thumb', 'funk', 'high', 'syncopated', [0, 3, 4, 6, 8, 11, 12, 14]),
  ],
  'pop': [
    bassTemplate('pop-bass-simple', 'Simple', 'pop', 'low', 'straight', [0, 8]),
    bassTemplate('pop-bass-standard', 'Standard', 'pop', 'mid', 'straight', [0, 4, 8, 12]),
    bassTemplate('pop-bass-modern', 'Modern', 'pop', 'mid', 'straight', [0, 6, 8, 14]),
    bassTemplate('pop-bass-dance', 'Dance', 'pop', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14]),
  ],
  'ambient': [
    bassTemplate('ambient-bass-drone', 'Drone', 'ambient', 'low', 'straight', [0]),
    bassTemplate('ambient-bass-breath', 'Breathing', 'ambient', 'low', 'straight', [0, 8]),
    bassTemplate('ambient-bass-pulse', 'Soft Pulse', 'ambient', 'mid', 'straight', [0, 4, 8, 12]),
    bassTemplate('ambient-bass-motion', 'Motion', 'ambient', 'mid', 'straight', [0, 6, 12]),
  ],
  'jazz': [
    bassTemplate('jazz-bass-walk', 'Walking Bass', 'jazz', 'low', 'swung', [0, 4, 8, 12]),
    bassTemplate('jazz-bass-swing', 'Swing Walk', 'jazz', 'mid', 'swung', [0, 2, 4, 6, 8, 10, 12, 14]),
    bassTemplate('jazz-bass-bebop', 'Bebop Line', 'jazz', 'mid', 'swung', [0, 3, 4, 6, 8, 11, 12, 14]),
    bassTemplate('jazz-bass-busy', 'Busy Walk', 'jazz', 'high', 'syncopated', [0, 2, 3, 6, 8, 10, 12, 14]),
  ],
  'classical': [
    bassTemplate('classical-bass-whole', 'Whole Notes', 'classical', 'low', 'straight', [0]),
    bassTemplate('classical-bass-half', 'Half Notes', 'classical', 'low', 'straight', [0, 8]),
    bassTemplate('classical-bass-quarter', 'Quarter Notes', 'classical', 'mid', 'straight', [0, 4, 8, 12]),
    bassTemplate('classical-bass-alberti', 'Alberti-like', 'classical', 'mid', 'straight', [0, 2, 4, 6, 8, 10, 12, 14]),
  ],
  'bossa-nova': [
    bassTemplate('bossa-bass-root', 'Root Fifth', 'bossa-nova', 'low', 'swung', [0, 8]),
    bassTemplate('bossa-bass-classic', 'Classic Bossa', 'bossa-nova', 'mid', 'swung', [0, 6, 8, 14]),
    bassTemplate('bossa-bass-flowing', 'Flowing', 'bossa-nova', 'mid', 'swung', [0, 3, 6, 10, 14]),
    bassTemplate('bossa-bass-active', 'Active Line', 'bossa-nova', 'high', 'syncopated', [0, 2, 6, 8, 10, 14]),
  ],
  'blues': [
    bassTemplate('blues-bass-shuffle', 'Shuffle', 'blues', 'low', 'swung', [0, 8]),
    bassTemplate('blues-bass-walk', 'Walking Blues', 'blues', 'mid', 'swung', [0, 4, 8, 12]),
    bassTemplate('blues-bass-boogie', 'Boogie', 'blues', 'mid', 'swung', [0, 3, 4, 6, 8, 11, 12, 14]),
    bassTemplate('blues-bass-chicago', 'Chicago Style', 'blues', 'high', 'syncopated', [0, 2, 4, 6, 8, 10, 12, 14]),
  ],
  'reggae': [
    bassTemplate('reggae-bass-one-drop', 'One Drop', 'reggae', 'low', 'straight', [0, 12]),
    bassTemplate('reggae-bass-roots', 'Roots', 'reggae', 'mid', 'straight', [0, 6, 12]),
    bassTemplate('reggae-bass-steppers', 'Steppers', 'reggae', 'mid', 'straight', [0, 4, 8, 12]),
    bassTemplate('reggae-bass-dub', 'Dub Style', 'reggae', 'high', 'syncopated', [0, 3, 6, 10, 12]),
  ],
  'cinematic': [
    bassTemplate('cinematic-bass-drone', 'Drone', 'cinematic', 'low', 'straight', [0]),
    bassTemplate('cinematic-bass-pulse', 'Pulse', 'cinematic', 'low', 'straight', [0, 8]),
    bassTemplate('cinematic-bass-tension', 'Tension', 'cinematic', 'mid', 'straight', [0, 4, 8, 12]),
    bassTemplate('cinematic-bass-epic', 'Epic Build', 'cinematic', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14]),
  ],
};

// Default templates for genres not explicitly defined (uses pop-like patterns)
const DEFAULT_BASS_TEMPLATES: RhythmTemplate[] = [
  bassTemplate('default-bass-root', 'Root Notes', 'pop', 'low', 'straight', [0, 8]),
  bassTemplate('default-bass-basic', 'Basic', 'pop', 'mid', 'straight', [0, 4, 8, 12]),
  bassTemplate('default-bass-groove', 'Groove', 'pop', 'mid', 'straight', [0, 3, 8, 11]),
  bassTemplate('default-bass-active', 'Active', 'pop', 'high', 'straight', [0, 2, 4, 6, 8, 10, 12, 14]),
];

export function getBassTemplates(genre: GenrePreset): RhythmTemplate[] {
  return BASS_TEMPLATES[genre] ?? DEFAULT_BASS_TEMPLATES;
}

export function getBassTemplatesByEnergy(genre: GenrePreset, energy: EnergyLevel): RhythmTemplate[] {
  return getBassTemplates(genre).filter(t => t.energyLevel === energy);
}
