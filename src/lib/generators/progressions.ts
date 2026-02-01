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
    id: 'lofi-hiphop-dreamy',
    name: 'Dreamy',
    genre: 'lofi-hiphop',
    chords: ['Imaj7', 'iii7', 'vi7', 'IVmaj7', 'ii7', 'iii7', 'IVmaj7', 'V7'],
    isDefault: false,
  },
  {
    id: 'lofi-hiphop-melancholy',
    name: 'Melancholy',
    genre: 'lofi-hiphop',
    chords: ['vi7', 'IVmaj7', 'Imaj7', 'V7', 'vi7', 'ii7', 'Imaj7', 'V7'],
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
    id: 'edm-house-dark',
    name: 'Dark',
    genre: 'edm-house',
    chords: ['i', 'VI', 'III', 'VII'],
    isDefault: false,
  },
  {
    id: 'edm-house-euphoric',
    name: 'Euphoric',
    genre: 'edm-house',
    chords: ['I', 'IV', 'vi', 'V'],
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
    id: 'rock-grunge',
    name: 'Grunge',
    genre: 'rock',
    chords: ['i', 'IV', 'i', 'VII'],
    isDefault: false,
  },
  {
    id: 'rock-ballad',
    name: 'Rock Ballad',
    genre: 'rock',
    chords: ['I', 'V', 'vi', 'IV'],
    isDefault: false,
  },
  {
    id: 'rock-blues',
    name: 'Blues Rock',
    genre: 'rock',
    chords: ['I', 'I', 'IV', 'V'],
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
    id: 'ambient-glacial',
    name: 'Glacial',
    genre: 'ambient',
    chords: ['Imaj7', 'Imaj7', 'IVmaj7', 'IVmaj7', 'vi7', 'vi7', 'V7', 'V7'],
    isDefault: false,
  },
  {
    id: 'ambient-nocturnal',
    name: 'Nocturnal',
    genre: 'ambient',
    chords: ['i7', 'iv7', 'VI', 'III', 'i7', 'iv7', 'V7', 'i7'],
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
    id: 'funk-slap',
    name: 'Slap Funk',
    genre: 'funk',
    chords: ['i7', 'i7', 'iv7', 'iv7', 'i7', 'i7', 'V7', 'V7'],
    isDefault: false,
  },
  {
    id: 'funk-disco',
    name: 'Disco Funk',
    genre: 'funk',
    chords: ['I', 'vi', 'IV', 'V', 'I', 'vi', 'ii', 'V'],
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
    id: 'pop-hopeful',
    name: 'Hopeful',
    genre: 'pop',
    chords: ['I', 'IV', 'vi', 'V'],
    isDefault: false,
  },
  {
    id: 'pop-nostalgic',
    name: 'Nostalgic',
    genre: 'pop',
    chords: ['I', 'iii', 'IV', 'iv'],
    isDefault: false,
  },
  {
    id: 'pop-dance',
    name: 'Dance Pop',
    genre: 'pop',
    chords: ['vi', 'IV', 'V', 'I'],
    isDefault: false,
  },
  {
    id: 'pop-free',
    name: 'Free (Static)',
    genre: 'pop',
    chords: ['I'],
    isDefault: false,
  },

  // Jazz (ii-V-I based, extended chords)
  {
    id: 'jazz-classic',
    name: 'Classic Jazz',
    genre: 'jazz',
    chords: ['ii7', 'V7', 'Imaj7', 'Imaj7', 'ii7', 'V7', 'Imaj7', 'vi7'],
    isDefault: true,
  },
  {
    id: 'jazz-ballad',
    name: 'Jazz Ballad',
    genre: 'jazz',
    chords: ['Imaj7', 'vi7', 'ii7', 'V7', 'iii7', 'vi7', 'ii7', 'V7'],
    isDefault: false,
  },
  {
    id: 'jazz-blues',
    name: 'Jazz Blues',
    genre: 'jazz',
    chords: ['I7', 'IV7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'V7'],
    isDefault: false,
  },
  {
    id: 'jazz-modal',
    name: 'Modal Jazz',
    genre: 'jazz',
    chords: ['Imaj7', 'Imaj7', 'ii7', 'ii7', 'Imaj7', 'Imaj7', 'ii7', 'ii7'],
    isDefault: false,
  },

  // Classical (voice-leading focused)
  {
    id: 'classical-baroque',
    name: 'Baroque',
    genre: 'classical',
    chords: ['I', 'IV', 'V', 'I', 'vi', 'ii', 'V', 'I'],
    isDefault: true,
  },
  {
    id: 'classical-romantic',
    name: 'Romantic',
    genre: 'classical',
    chords: ['I', 'vi', 'IV', 'V', 'I', 'ii', 'V', 'I'],
    isDefault: false,
  },
  {
    id: 'classical-dramatic',
    name: 'Dramatic',
    genre: 'classical',
    chords: ['i', 'iv', 'V', 'i', 'VI', 'ii', 'V', 'i'],
    isDefault: false,
  },

  // Blues (12-bar blues and variants)
  {
    id: 'blues-classic',
    name: 'Classic Blues',
    genre: 'blues',
    chords: ['I', 'I', 'IV', 'I', 'V', 'IV', 'I', 'V'],
    isDefault: true,
  },
  {
    id: 'blues-minor',
    name: 'Minor Blues',
    genre: 'blues',
    chords: ['i', 'i', 'iv', 'i', 'V', 'iv', 'i', 'V'],
    isDefault: false,
  },
  {
    id: 'blues-shuffle',
    name: 'Shuffle Blues',
    genre: 'blues',
    chords: ['I7', 'IV7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'V7'],
    isDefault: false,
  },

  // Reggae (offbeat emphasis, simple progressions)
  {
    id: 'reggae-roots',
    name: 'Roots Reggae',
    genre: 'reggae',
    chords: ['I', 'IV', 'I', 'V', 'I', 'IV', 'V', 'I'],
    isDefault: true,
  },
  {
    id: 'reggae-dub',
    name: 'Dub',
    genre: 'reggae',
    chords: ['i', 'i', 'iv', 'iv', 'i', 'i', 'V', 'V'],
    isDefault: false,
  },
  {
    id: 'reggae-ska',
    name: 'Ska',
    genre: 'reggae',
    chords: ['I', 'vi', 'IV', 'V', 'I', 'vi', 'IV', 'V'],
    isDefault: false,
  },

  // Bossa Nova (jazz-influenced Brazilian)
  {
    id: 'bossa-classic',
    name: 'Classic Bossa',
    genre: 'bossa-nova',
    chords: ['Imaj7', 'ii7', 'iii7', 'vi7', 'ii7', 'V7', 'Imaj7', 'Imaj7'],
    isDefault: true,
  },
  {
    id: 'bossa-girl',
    name: 'Girl from Ipanema',
    genre: 'bossa-nova',
    chords: ['Imaj7', 'Imaj7', 'ii7', 'ii7', 'ii7', 'V7', 'Imaj7', 'Imaj7'],
    isDefault: false,
  },
  {
    id: 'bossa-minor',
    name: 'Minor Bossa',
    genre: 'bossa-nova',
    chords: ['i7', 'iv7', 'V7', 'i7', 'iv7', 'V7', 'i7', 'i7'],
    isDefault: false,
  },

  // Cinematic (epic, emotional, building)
  {
    id: 'cinematic-epic',
    name: 'Epic',
    genre: 'cinematic',
    chords: ['i', 'VI', 'III', 'VII', 'i', 'VI', 'VII', 'i'],
    isDefault: true,
  },
  {
    id: 'cinematic-emotional',
    name: 'Emotional',
    genre: 'cinematic',
    chords: ['I', 'V', 'vi', 'IV', 'I', 'iii', 'IV', 'V'],
    isDefault: false,
  },
  {
    id: 'cinematic-tension',
    name: 'Tension',
    genre: 'cinematic',
    chords: ['i', 'i', 'iv', 'iv', 'VI', 'VI', 'V', 'V'],
    isDefault: false,
  },
  {
    id: 'cinematic-heroic',
    name: 'Heroic',
    genre: 'cinematic',
    chords: ['I', 'IV', 'vi', 'V', 'I', 'IV', 'V', 'I'],
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
