import * as Tone from 'tone';
import type { InstrumentType } from '../../types';

export type MelodicSynth = Tone.PolySynth | Tone.MonoSynth;

interface SynthPreset {
  name: string;
  create: () => MelodicSynth;
}

const bassPresets: SynthPreset[] = [
  {
    name: 'sub',
    create: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.2 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.2, baseFrequency: 200, octaves: 2 },
    }),
  },
  {
    name: 'acid',
    create: () => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.1 },
      filterEnvelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.2, baseFrequency: 150, octaves: 4 },
    }),
  },
];

const keysPresets: SynthPreset[] = [
  {
    name: 'piano',
    create: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 0.5 },
    }),
  },
  {
    name: 'epiano',
    create: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 10,
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.2, release: 0.5 },
    }),
  },
];

const leadPresets: SynthPreset[] = [
  {
    name: 'saw',
    create: () => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 },
    }),
  },
  {
    name: 'square',
    create: () => new Tone.MonoSynth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.2 },
    }),
  },
];

const padPresets: SynthPreset[] = [
  {
    name: 'warm',
    create: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1 },
    }),
  },
  {
    name: 'airy',
    create: () => new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 2,
      envelope: { attack: 0.8, decay: 0.3, sustain: 0.7, release: 1.5 },
    }),
  },
];

const presetsByType: Record<string, SynthPreset[]> = {
  bass: bassPresets,
  keys: keysPresets,
  lead: leadPresets,
  pad: padPresets,
};

export function createMelodicSynth(type: InstrumentType, presetIndex = 0): MelodicSynth {
  const presets = presetsByType[type];
  if (!presets) {
    throw new Error(`No presets for instrument type: ${type}`);
  }
  const preset = presets[presetIndex % presets.length];
  return preset.create();
}

export function getPresetNames(type: InstrumentType): string[] {
  const presets = presetsByType[type];
  return presets ? presets.map(p => p.name) : [];
}
