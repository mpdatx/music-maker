import type { ChordProgression, GenrePreset } from '../types/music';

export const PROGRESSIONS: ChordProgression[] = [
  // Lo-fi Hip-hop (8-chord progressions - jazzy, mellow)
  {
    id: 'lofi-hiphop-jazzy',
    name: 'Jazzy Lo-fi',
    genre: 'lofi-hiphop',
    chords: ['ii7', 'V7', 'Imaj7', 'vi7', 'ii7', 'V7', 'Imaj7', 'Imaj7'],
    isDefault: true,
  },
  {
    id: 'lofi-hiphop-chill',
    name: 'Chill Vibes',
    genre: 'lofi-hiphop',
    chords: ['Imaj7', 'vi7', 'ii7', 'V7', 'Imaj7', 'vi7', 'ii7', 'V7'],
    isDefault: false,
  },
  {
    id: 'lofi-hiphop-free',
    name: 'Free (Static)',
    genre: 'lofi-hiphop',
    chords: ['Imaj7'],
    isDefault: false,
  },

  // EDM/House (4-chord progressions - driving, anthemic)
  {
    id: 'edm-house-anthem',
    name: 'Anthem',
    genre: 'edm-house',
    chords: ['vi', 'IV', 'I', 'V'],
    isDefault: true,
  },
  {
    id: 'edm-house-uplifting',
    name: 'Uplifting',
    genre: 'edm-house',
    chords: ['I', 'V', 'vi', 'IV'],
    isDefault: false,
  },
  {
    id: 'edm-house-free',
    name: 'Free (Static)',
    genre: 'edm-house',
    chords: ['I'],
    isDefault: false,
  },

  // Rock (4-chord progressions - powerful, classic)
  {
    id: 'rock-classic',
    name: 'Classic Rock',
    genre: 'rock',
    chords: ['I', 'IV', 'V', 'I'],
    isDefault: true,
  },
  {
    id: 'rock-power',
    name: 'Power Chords',
    genre: 'rock',
    chords: ['I', 'IV', 'V', 'IV'],
    isDefault: false,
  },
  {
    id: 'rock-free',
    name: 'Free (Static)',
    genre: 'rock',
    chords: ['I'],
    isDefault: false,
  },

  // Ambient (8-chord progressions - evolving, atmospheric)
  {
    id: 'ambient-dreamy',
    name: 'Dreamy',
    genre: 'ambient',
    chords: ['Imaj7', 'iii7', 'vi7', 'IVmaj7', 'Imaj7', 'iii7', 'vi7', 'V7'],
    isDefault: true,
  },
  {
    id: 'ambient-floating',
    name: 'Floating',
    genre: 'ambient',
    chords: ['Imaj7', 'IVmaj7', 'vi7', 'iii7', 'Imaj7', 'IVmaj7', 'vi7', 'V7'],
    isDefault: false,
  },
  {
    id: 'ambient-free',
    name: 'Free (Static)',
    genre: 'ambient',
    chords: ['Imaj7'],
    isDefault: false,
  },

  // Funk (8-chord progressions - groovy, soulful)
  {
    id: 'funk-groove',
    name: 'Classic Funk',
    genre: 'funk',
    chords: ['I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV'],
    isDefault: true,
  },
  {
    id: 'funk-soul',
    name: 'Soulful',
    genre: 'funk',
    chords: ['I', 'IV', 'I', 'V', 'I', 'IV', 'V', 'I'],
    isDefault: false,
  },
  {
    id: 'funk-free',
    name: 'Free (Static)',
    genre: 'funk',
    chords: ['I'],
    isDefault: false,
  },

  // Pop (4-chord progressions - catchy, familiar)
  {
    id: 'pop-classic',
    name: 'Classic Pop',
    genre: 'pop',
    chords: ['I', 'V', 'vi', 'IV'],
    isDefault: true,
  },
  {
    id: 'pop-emotional',
    name: 'Emotional',
    genre: 'pop',
    chords: ['vi', 'IV', 'I', 'V'],
    isDefault: false,
  },
  {
    id: 'pop-free',
    name: 'Free (Static)',
    genre: 'pop',
    chords: ['I'],
    isDefault: false,
  },
];

export function getProgressionsForGenre(genre: GenrePreset): ChordProgression[] {
  return PROGRESSIONS.filter((p) => p.genre === genre);
}

export function getDefaultProgression(genre: GenrePreset): ChordProgression {
  const defaultProg = PROGRESSIONS.find((p) => p.genre === genre && p.isDefault);
  if (defaultProg) {
    return defaultProg;
  }
  // Fallback: return first progression for genre or a generic one
  const genreProgs = getProgressionsForGenre(genre);
  if (genreProgs.length > 0) {
    return genreProgs[0];
  }
  // Ultimate fallback
  return {
    id: 'fallback',
    name: 'Fallback',
    genre,
    chords: ['I'],
    isDefault: true,
  };
}

export function getProgressionById(id: string): ChordProgression | undefined {
  return PROGRESSIONS.find((p) => p.id === id);
}
