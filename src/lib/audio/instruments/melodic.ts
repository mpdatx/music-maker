import * as Tone from 'tone';
import type { InstrumentType, GenrePreset } from '../../types';

export type MelodicSynth = Tone.PolySynth | Tone.MonoSynth;

type SynthCreator = () => MelodicSynth;

interface GenreSynthPresets {
  bass: SynthCreator;
  keys: SynthCreator;
  lead: SynthCreator;
  pad: SynthCreator;
  pluck: SynthCreator;
  strings: SynthCreator;
  organ: SynthCreator;
  choir: SynthCreator;
  epiano: SynthCreator;
  kalimba: SynthCreator;
}

const GENRE_SYNTH_PRESETS: Record<GenrePreset, GenreSynthPresets> = {
  'lofi-hiphop': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.4, release: 0.3 },
      filterEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.5, release: 0.3, baseFrequency: 150, octaves: 2 },
    }),
    keys: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2,
      modulationIndex: 8,
      envelope: { attack: 0.02, decay: 0.5, sustain: 0.2, release: 0.6 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.4 },
      filterEnvelope: { attack: 0.05, decay: 0.3, sustain: 0.5, release: 0.4, baseFrequency: 400, octaves: 2 },
    }),
    pad: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.8, decay: 0.5, sustain: 0.7, release: 1.2 },
    }),
    pluck: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.4 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.3, decay: 0.4, sustain: 0.8, release: 0.8 },
    }),
    organ: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.9, release: 0.1 },
    }),
    choir: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.6, decay: 0.4, sustain: 0.8, release: 1.0 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 14,
      envelope: { attack: 0.01, decay: 0.8, sustain: 0.3, release: 0.8 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 2,
      envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 0.8 },
    }),
  },
  'edm-house': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0.3, release: 0.1 },
      filterEnvelope: { attack: 0.001, decay: 0.2, sustain: 0.2, release: 0.1, baseFrequency: 100, octaves: 4 },
    }),
    keys: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.2, release: 0.3 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0.5, release: 0.2 },
      filterEnvelope: { attack: 0.001, decay: 0.15, sustain: 0.3, release: 0.2, baseFrequency: 300, octaves: 4 },
    }),
    pad: () => new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 3,
      envelope: { attack: 0.3, decay: 0.4, sustain: 0.8, release: 0.8 },
    }),
    pluck: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.05, release: 0.2 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.15, decay: 0.3, sustain: 0.7, release: 0.5 },
    }),
    organ: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1,
      modulationIndex: 2,
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.05 },
    }),
    choir: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.3, decay: 0.3, sustain: 0.7, release: 0.6 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.5,
      modulationIndex: 10,
      envelope: { attack: 0.001, decay: 0.5, sustain: 0.2, release: 0.5 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 3,
      envelope: { attack: 0.001, decay: 0.8, sustain: 0, release: 0.5 },
    }),
  },
  'rock': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.2 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.2, baseFrequency: 200, octaves: 2.5 },
    }),
    keys: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.3, release: 0.4 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.25 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.25, baseFrequency: 500, octaves: 3 },
    }),
    pad: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.5, decay: 0.4, sustain: 0.6, release: 0.8 },
    }),
    pluck: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.3 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.2, decay: 0.3, sustain: 0.7, release: 0.6 },
    }),
    organ: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.15 },
    }),
    choir: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.4, decay: 0.3, sustain: 0.7, release: 0.7 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2,
      modulationIndex: 12,
      envelope: { attack: 0.01, decay: 0.6, sustain: 0.25, release: 0.6 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 2.5,
      envelope: { attack: 0.001, decay: 1.0, sustain: 0, release: 0.7 },
    }),
  },
  'ambient': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.6, sustain: 0.5, release: 0.8 },
      filterEnvelope: { attack: 0.1, decay: 0.5, sustain: 0.6, release: 0.8, baseFrequency: 100, octaves: 1.5 },
    }),
    keys: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1.5,
      modulationIndex: 5,
      envelope: { attack: 0.2, decay: 0.8, sustain: 0.5, release: 1.5 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.15, decay: 0.5, sustain: 0.5, release: 0.8 },
      filterEnvelope: { attack: 0.15, decay: 0.5, sustain: 0.5, release: 0.8, baseFrequency: 300, octaves: 1.5 },
    }),
    pad: () => new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 1.5,
      envelope: { attack: 1.5, decay: 0.5, sustain: 0.9, release: 2 },
    }),
    pluck: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 10,
      envelope: { attack: 0.01, decay: 0.8, sustain: 0.1, release: 1.2 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 1.0, decay: 0.5, sustain: 0.9, release: 1.5 },
    }),
    organ: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.2, decay: 0.2, sustain: 0.95, release: 0.5 },
    }),
    choir: () => new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 2,
      envelope: { attack: 1.2, decay: 0.5, sustain: 0.9, release: 2.0 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 8,
      envelope: { attack: 0.05, decay: 1.2, sustain: 0.4, release: 1.5 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 1.5,
      envelope: { attack: 0.001, decay: 2.0, sustain: 0, release: 1.5 },
    }),
  },
  'funk': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.15 },
      filterEnvelope: { attack: 0.005, decay: 0.25, sustain: 0.2, release: 0.15, baseFrequency: 150, octaves: 3.5 },
    }),
    keys: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.3 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0.4, release: 0.2 },
      filterEnvelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.2, baseFrequency: 400, octaves: 3 },
    }),
    pad: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.3, decay: 0.4, sustain: 0.6, release: 0.6 },
    }),
    pluck: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.25, sustain: 0.05, release: 0.2 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 0.4 },
    }),
    organ: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.85, release: 0.1 },
    }),
    choir: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.5, decay: 0.4, sustain: 0.7, release: 0.6 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 12,
      envelope: { attack: 0.005, decay: 0.5, sustain: 0.2, release: 0.4 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 2,
      envelope: { attack: 0.001, decay: 0.9, sustain: 0, release: 0.6 },
    }),
  },
  'pop': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.25, sustain: 0.4, release: 0.2 },
      filterEnvelope: { attack: 0.01, decay: 0.25, sustain: 0.4, release: 0.2, baseFrequency: 150, octaves: 2.5 },
    }),
    keys: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.3, release: 0.5 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3, baseFrequency: 400, octaves: 2.5 },
    }),
    pad: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, decay: 0.5, sustain: 0.7, release: 1 },
    }),
    pluck: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.35, sustain: 0.1, release: 0.3 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.25, decay: 0.4, sustain: 0.75, release: 0.7 },
    }),
    organ: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.03, decay: 0.1, sustain: 0.9, release: 0.12 },
    }),
    choir: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, decay: 0.4, sustain: 0.75, release: 0.8 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 14,
      envelope: { attack: 0.01, decay: 0.7, sustain: 0.3, release: 0.7 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 2,
      envelope: { attack: 0.001, decay: 1.1, sustain: 0, release: 0.8 },
    }),
  },
};

export function createMelodicSynth(type: InstrumentType, genre: GenrePreset = 'lofi-hiphop'): MelodicSynth {
  const genrePresets = GENRE_SYNTH_PRESETS[genre];
  const creator = genrePresets[type as keyof GenreSynthPresets];
  if (!creator) {
    throw new Error(`No preset for instrument type: ${type} in genre: ${genre}`);
  }
  return creator();
}

export function getGenrePresetNames(): GenrePreset[] {
  return Object.keys(GENRE_SYNTH_PRESETS) as GenrePreset[];
}
