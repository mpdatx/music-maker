import * as Tone from 'tone';
import type { GenrePreset } from '../../types';

export interface DrumKit {
  kick: Tone.MembraneSynth;
  snare: Tone.NoiseSynth;
  hihat: Tone.MetalSynth;
  openhat: Tone.MetalSynth;
  tom: Tone.MembraneSynth;
  clap: Tone.NoiseSynth;
}

interface DrumKitPreset {
  kick: Partial<Tone.MembraneSynthOptions>;
  snare: Partial<Tone.NoiseSynthOptions>;
  hihat: Partial<Tone.MetalSynthOptions>;
  openhat: Partial<Tone.MetalSynthOptions>;
  tom: Partial<Tone.MembraneSynthOptions>;
  clap: Partial<Tone.NoiseSynthOptions>;
}

const DRUM_PRESETS: Record<GenrePreset, DrumKitPreset> = {
  'lofi-hiphop': {
    kick: {
      pitchDecay: 0.08,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.5, sustain: 0.01, release: 0.5 },
    },
    snare: {
      noise: { type: 'pink' },
      envelope: { attack: 0.005, decay: 0.25, sustain: 0, release: 0.15 },
    },
    hihat: {
      envelope: { attack: 0.002, decay: 0.08, release: 0.02 },
      harmonicity: 5.1,
      modulationIndex: 20,
      resonance: 3000,
      octaves: 1,
    },
    openhat: {
      envelope: { attack: 0.002, decay: 0.4, release: 0.15 },
      harmonicity: 5.1,
      modulationIndex: 20,
      resonance: 3000,
      octaves: 1,
    },
    tom: {
      pitchDecay: 0.1,
      octaves: 3,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.01, release: 0.4 },
    },
    clap: {
      noise: { type: 'pink' },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
    },
  },
  'edm-house': {
    kick: {
      pitchDecay: 0.03,
      octaves: 8,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
    },
    snare: {
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.08 },
    },
    hihat: {
      envelope: { attack: 0.001, decay: 0.04, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 40,
      resonance: 5000,
      octaves: 2,
    },
    openhat: {
      envelope: { attack: 0.001, decay: 0.25, release: 0.08 },
      harmonicity: 5.1,
      modulationIndex: 40,
      resonance: 5000,
      octaves: 2,
    },
    tom: {
      pitchDecay: 0.05,
      octaves: 5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.2 },
    },
    clap: {
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
    },
  },
  'rock': {
    kick: {
      pitchDecay: 0.04,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.35, sustain: 0.01, release: 0.35 },
    },
    snare: {
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.02, release: 0.15 },
    },
    hihat: {
      envelope: { attack: 0.001, decay: 0.06, release: 0.02 },
      harmonicity: 5.1,
      modulationIndex: 35,
      resonance: 4500,
      octaves: 1.5,
    },
    openhat: {
      envelope: { attack: 0.001, decay: 0.35, release: 0.12 },
      harmonicity: 5.1,
      modulationIndex: 35,
      resonance: 4500,
      octaves: 1.5,
    },
    tom: {
      pitchDecay: 0.06,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.35, sustain: 0.02, release: 0.3 },
    },
    clap: {
      noise: { type: 'white' },
      envelope: { attack: 0.002, decay: 0.12, sustain: 0, release: 0.08 },
    },
  },
  'ambient': {
    kick: {
      pitchDecay: 0.15,
      octaves: 3,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.8, sustain: 0.02, release: 0.8 },
    },
    snare: {
      noise: { type: 'brown' },
      envelope: { attack: 0.02, decay: 0.4, sustain: 0, release: 0.3 },
    },
    hihat: {
      envelope: { attack: 0.01, decay: 0.15, release: 0.08 },
      harmonicity: 3,
      modulationIndex: 15,
      resonance: 2000,
      octaves: 0.8,
    },
    openhat: {
      envelope: { attack: 0.01, decay: 0.6, release: 0.3 },
      harmonicity: 3,
      modulationIndex: 15,
      resonance: 2000,
      octaves: 0.8,
    },
    tom: {
      pitchDecay: 0.2,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.03, decay: 0.6, sustain: 0.02, release: 0.6 },
    },
    clap: {
      noise: { type: 'pink' },
      envelope: { attack: 0.02, decay: 0.25, sustain: 0, release: 0.2 },
    },
  },
  'funk': {
    kick: {
      pitchDecay: 0.04,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.25 },
    },
    snare: {
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.18, sustain: 0.01, release: 0.1 },
    },
    hihat: {
      envelope: { attack: 0.001, decay: 0.05, release: 0.015 },
      harmonicity: 5.1,
      modulationIndex: 30,
      resonance: 4200,
      octaves: 1.5,
    },
    openhat: {
      envelope: { attack: 0.001, decay: 0.28, release: 0.1 },
      harmonicity: 5.1,
      modulationIndex: 30,
      resonance: 4200,
      octaves: 1.5,
    },
    tom: {
      pitchDecay: 0.07,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.28, sustain: 0.01, release: 0.25 },
    },
    clap: {
      noise: { type: 'white' },
      envelope: { attack: 0.003, decay: 0.1, sustain: 0, release: 0.08 },
    },
  },
  'pop': {
    kick: {
      pitchDecay: 0.04,
      octaves: 7,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.35, sustain: 0.01, release: 0.35 },
    },
    snare: {
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.12 },
    },
    hihat: {
      envelope: { attack: 0.001, decay: 0.05, release: 0.015 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4500,
      octaves: 1.5,
    },
    openhat: {
      envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4500,
      octaves: 1.5,
    },
    tom: {
      pitchDecay: 0.06,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.28 },
    },
    clap: {
      noise: { type: 'white' },
      envelope: { attack: 0.003, decay: 0.1, sustain: 0, release: 0.08 },
    },
  },
  'jazz': {
    kick: {
      pitchDecay: 0.06,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.02, release: 0.4 },
    },
    snare: {
      noise: { type: 'pink' },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.01, release: 0.15 },
    },
    hihat: {
      envelope: { attack: 0.002, decay: 0.08, release: 0.03 },
      harmonicity: 4,
      modulationIndex: 18,
      resonance: 3200,
      octaves: 1,
    },
    openhat: {
      envelope: { attack: 0.002, decay: 0.35, release: 0.15 },
      harmonicity: 4,
      modulationIndex: 18,
      resonance: 3200,
      octaves: 1,
    },
    tom: {
      pitchDecay: 0.08,
      octaves: 3,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.35, sustain: 0.02, release: 0.35 },
    },
    clap: {
      noise: { type: 'pink' },
      envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.1 },
    },
  },
  'classical': {
    kick: {
      pitchDecay: 0.1,
      octaves: 3,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.5, sustain: 0.02, release: 0.5 },
    },
    snare: {
      noise: { type: 'pink' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 },
    },
    hihat: {
      envelope: { attack: 0.005, decay: 0.12, release: 0.06 },
      harmonicity: 3.5,
      modulationIndex: 12,
      resonance: 2500,
      octaves: 0.8,
    },
    openhat: {
      envelope: { attack: 0.005, decay: 0.5, release: 0.25 },
      harmonicity: 3.5,
      modulationIndex: 12,
      resonance: 2500,
      octaves: 0.8,
    },
    tom: {
      pitchDecay: 0.12,
      octaves: 2.5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.45, sustain: 0.02, release: 0.45 },
    },
    clap: {
      noise: { type: 'pink' },
      envelope: { attack: 0.015, decay: 0.2, sustain: 0, release: 0.15 },
    },
  },
  'bossa-nova': {
    kick: {
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.008, decay: 0.35, sustain: 0.01, release: 0.35 },
    },
    snare: {
      noise: { type: 'pink' },
      envelope: { attack: 0.003, decay: 0.18, sustain: 0, release: 0.12 },
    },
    hihat: {
      envelope: { attack: 0.002, decay: 0.06, release: 0.02 },
      harmonicity: 4.5,
      modulationIndex: 22,
      resonance: 3500,
      octaves: 1.2,
    },
    openhat: {
      envelope: { attack: 0.002, decay: 0.3, release: 0.12 },
      harmonicity: 4.5,
      modulationIndex: 22,
      resonance: 3500,
      octaves: 1.2,
    },
    tom: {
      pitchDecay: 0.07,
      octaves: 3.5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.008, decay: 0.32, sustain: 0.01, release: 0.3 },
    },
    clap: {
      noise: { type: 'pink' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.08 },
    },
  },
  'blues': {
    kick: {
      pitchDecay: 0.06,
      octaves: 5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.4, sustain: 0.01, release: 0.4 },
    },
    snare: {
      noise: { type: 'pink' },
      envelope: { attack: 0.003, decay: 0.22, sustain: 0.01, release: 0.15 },
    },
    hihat: {
      envelope: { attack: 0.002, decay: 0.07, release: 0.025 },
      harmonicity: 4.5,
      modulationIndex: 25,
      resonance: 3800,
      octaves: 1.2,
    },
    openhat: {
      envelope: { attack: 0.002, decay: 0.35, release: 0.12 },
      harmonicity: 4.5,
      modulationIndex: 25,
      resonance: 3800,
      octaves: 1.2,
    },
    tom: {
      pitchDecay: 0.08,
      octaves: 3.5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.38, sustain: 0.01, release: 0.35 },
    },
    clap: {
      noise: { type: 'pink' },
      envelope: { attack: 0.008, decay: 0.12, sustain: 0, release: 0.1 },
    },
  },
  'reggae': {
    kick: {
      pitchDecay: 0.07,
      octaves: 5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.45, sustain: 0.02, release: 0.45 },
    },
    snare: {
      noise: { type: 'pink' },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.01, release: 0.15 },
    },
    hihat: {
      envelope: { attack: 0.002, decay: 0.06, release: 0.02 },
      harmonicity: 4.2,
      modulationIndex: 20,
      resonance: 3500,
      octaves: 1,
    },
    openhat: {
      envelope: { attack: 0.002, decay: 0.32, release: 0.12 },
      harmonicity: 4.2,
      modulationIndex: 20,
      resonance: 3500,
      octaves: 1,
    },
    tom: {
      pitchDecay: 0.09,
      octaves: 3,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.008, decay: 0.4, sustain: 0.02, release: 0.38 },
    },
    clap: {
      noise: { type: 'pink' },
      envelope: { attack: 0.008, decay: 0.12, sustain: 0, release: 0.1 },
    },
  },
  'cinematic': {
    kick: {
      pitchDecay: 0.12,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.7, sustain: 0.03, release: 0.7 },
    },
    snare: {
      noise: { type: 'brown' },
      envelope: { attack: 0.015, decay: 0.35, sustain: 0, release: 0.25 },
    },
    hihat: {
      envelope: { attack: 0.008, decay: 0.12, release: 0.06 },
      harmonicity: 3,
      modulationIndex: 15,
      resonance: 2200,
      octaves: 0.8,
    },
    openhat: {
      envelope: { attack: 0.008, decay: 0.55, release: 0.28 },
      harmonicity: 3,
      modulationIndex: 15,
      resonance: 2200,
      octaves: 0.8,
    },
    tom: {
      pitchDecay: 0.15,
      octaves: 2.5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.55, sustain: 0.03, release: 0.55 },
    },
    clap: {
      noise: { type: 'brown' },
      envelope: { attack: 0.02, decay: 0.22, sustain: 0, release: 0.18 },
    },
  },
};

export function createDrumKit(genre: GenrePreset = 'lofi-hiphop'): DrumKit {
  const preset = DRUM_PRESETS[genre] ?? DRUM_PRESETS['lofi-hiphop'];

  const kick = new Tone.MembraneSynth(preset.kick);
  const snare = new Tone.NoiseSynth(preset.snare);
  const hihat = new Tone.MetalSynth(preset.hihat);
  hihat.frequency.value = 400;
  const openhat = new Tone.MetalSynth(preset.openhat);
  openhat.frequency.value = 400;
  const tom = new Tone.MembraneSynth(preset.tom);
  const clap = new Tone.NoiseSynth(preset.clap);

  return { kick, snare, hihat, openhat, tom, clap };
}

export function connectDrumKit(kit: DrumKit, destination: Tone.InputNode): void {
  Object.values(kit).forEach(synth => synth.connect(destination));
}

export function disposeDrumKit(kit: DrumKit): void {
  Object.values(kit).forEach(synth => synth.dispose());
}
