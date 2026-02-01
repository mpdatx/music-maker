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
  'jazz': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.5, release: 0.4 },
      filterEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.5, release: 0.4, baseFrequency: 120, octaves: 2 },
    }),
    keys: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2,
      modulationIndex: 6,
      envelope: { attack: 0.01, decay: 0.6, sustain: 0.3, release: 0.8 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.4, sustain: 0.5, release: 0.5 },
      filterEnvelope: { attack: 0.05, decay: 0.4, sustain: 0.5, release: 0.5, baseFrequency: 350, octaves: 2 },
    }),
    pad: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.8, decay: 0.5, sustain: 0.7, release: 1.2 },
    }),
    pluck: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.5, sustain: 0.1, release: 0.5 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.4, decay: 0.4, sustain: 0.8, release: 0.9 },
    }),
    organ: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.9, release: 0.15 },
    }),
    choir: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.6, decay: 0.4, sustain: 0.8, release: 1.0 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 10,
      envelope: { attack: 0.01, decay: 0.9, sustain: 0.35, release: 1.0 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 2,
      envelope: { attack: 0.001, decay: 1.3, sustain: 0, release: 0.9 },
    }),
  },
  'classical': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.08, decay: 0.5, sustain: 0.6, release: 0.6 },
      filterEnvelope: { attack: 0.08, decay: 0.4, sustain: 0.6, release: 0.6, baseFrequency: 100, octaves: 1.5 },
    }),
    keys: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2,
      modulationIndex: 5,
      envelope: { attack: 0.02, decay: 0.7, sustain: 0.4, release: 1.0 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.5, sustain: 0.6, release: 0.7 },
      filterEnvelope: { attack: 0.1, decay: 0.5, sustain: 0.5, release: 0.7, baseFrequency: 300, octaves: 1.5 },
    }),
    pad: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 1.2, decay: 0.5, sustain: 0.85, release: 1.8 },
    }),
    pluck: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 8,
      envelope: { attack: 0.01, decay: 0.7, sustain: 0.1, release: 1.0 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.8, decay: 0.5, sustain: 0.9, release: 1.2 },
    }),
    organ: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.15, sustain: 0.95, release: 0.3 },
    }),
    choir: () => new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 2,
      envelope: { attack: 1.0, decay: 0.5, sustain: 0.9, release: 1.8 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2.5,
      modulationIndex: 8,
      envelope: { attack: 0.02, decay: 1.0, sustain: 0.4, release: 1.2 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 1.5,
      envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 1.2 },
    }),
  },
  'bossa-nova': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.35, sustain: 0.45, release: 0.35 },
      filterEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.5, release: 0.35, baseFrequency: 130, octaves: 2 },
    }),
    keys: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2,
      modulationIndex: 7,
      envelope: { attack: 0.01, decay: 0.55, sustain: 0.3, release: 0.7 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.04, decay: 0.35, sustain: 0.45, release: 0.45 },
      filterEnvelope: { attack: 0.04, decay: 0.35, sustain: 0.5, release: 0.45, baseFrequency: 380, octaves: 2 },
    }),
    pad: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.7, decay: 0.5, sustain: 0.7, release: 1.1 },
    }),
    pluck: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.003, decay: 0.45, sustain: 0.1, release: 0.45 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.35, decay: 0.4, sustain: 0.8, release: 0.85 },
    }),
    organ: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.04, decay: 0.1, sustain: 0.9, release: 0.12 },
    }),
    choir: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.55, decay: 0.4, sustain: 0.78, release: 0.9 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 11,
      envelope: { attack: 0.01, decay: 0.75, sustain: 0.32, release: 0.8 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 2,
      envelope: { attack: 0.001, decay: 1.15, sustain: 0, release: 0.85 },
    }),
  },
  'blues': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.38, sustain: 0.45, release: 0.35 },
      filterEnvelope: { attack: 0.02, decay: 0.32, sustain: 0.48, release: 0.35, baseFrequency: 140, octaves: 2.2 },
    }),
    keys: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2,
      modulationIndex: 9,
      envelope: { attack: 0.015, decay: 0.58, sustain: 0.28, release: 0.72 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.03, decay: 0.32, sustain: 0.48, release: 0.42 },
      filterEnvelope: { attack: 0.03, decay: 0.32, sustain: 0.45, release: 0.42, baseFrequency: 420, octaves: 2.5 },
    }),
    pad: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.72, decay: 0.48, sustain: 0.68, release: 1.1 },
    }),
    pluck: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.004, decay: 0.42, sustain: 0.12, release: 0.42 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.32, decay: 0.42, sustain: 0.78, release: 0.82 },
    }),
    organ: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.025, decay: 0.08, sustain: 0.88, release: 0.12 },
    }),
    choir: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.52, decay: 0.42, sustain: 0.76, release: 0.88 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 13,
      envelope: { attack: 0.012, decay: 0.72, sustain: 0.3, release: 0.75 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 2.2,
      envelope: { attack: 0.001, decay: 1.12, sustain: 0, release: 0.82 },
    }),
  },
  'reggae': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.025, decay: 0.42, sustain: 0.5, release: 0.4 },
      filterEnvelope: { attack: 0.025, decay: 0.35, sustain: 0.52, release: 0.4, baseFrequency: 125, octaves: 2 },
    }),
    keys: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.22, sustain: 0.25, release: 0.25 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.04, decay: 0.35, sustain: 0.45, release: 0.45 },
      filterEnvelope: { attack: 0.04, decay: 0.35, sustain: 0.48, release: 0.45, baseFrequency: 360, octaves: 2 },
    }),
    pad: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.75, decay: 0.5, sustain: 0.72, release: 1.15 },
    }),
    pluck: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.003, decay: 0.35, sustain: 0.08, release: 0.32 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.35, decay: 0.42, sustain: 0.78, release: 0.85 },
    }),
    organ: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.04, decay: 0.1, sustain: 0.9, release: 0.12 },
    }),
    choir: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.55, decay: 0.42, sustain: 0.76, release: 0.92 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 12,
      envelope: { attack: 0.012, decay: 0.68, sustain: 0.28, release: 0.72 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 2,
      envelope: { attack: 0.001, decay: 1.18, sustain: 0, release: 0.85 },
    }),
  },
  'cinematic': {
    bass: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.6, sustain: 0.55, release: 0.8 },
      filterEnvelope: { attack: 0.1, decay: 0.5, sustain: 0.58, release: 0.8, baseFrequency: 95, octaves: 1.5 },
    }),
    keys: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1.8,
      modulationIndex: 6,
      envelope: { attack: 0.15, decay: 0.85, sustain: 0.45, release: 1.3 },
    }),
    lead: () => new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.12, decay: 0.55, sustain: 0.55, release: 0.75 },
      filterEnvelope: { attack: 0.12, decay: 0.5, sustain: 0.52, release: 0.75, baseFrequency: 280, octaves: 1.8 },
    }),
    pad: () => new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 1.8,
      envelope: { attack: 1.8, decay: 0.6, sustain: 0.92, release: 2.5 },
    }),
    pluck: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.5,
      modulationIndex: 9,
      envelope: { attack: 0.015, decay: 0.85, sustain: 0.12, release: 1.2 },
    }),
    strings: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 1.2, decay: 0.6, sustain: 0.92, release: 1.8 },
    }),
    organ: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.15, decay: 0.18, sustain: 0.95, release: 0.4 },
    }),
    choir: () => new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 2.2,
      envelope: { attack: 1.5, decay: 0.6, sustain: 0.92, release: 2.2 },
    }),
    epiano: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2.5,
      modulationIndex: 7,
      envelope: { attack: 0.04, decay: 1.1, sustain: 0.42, release: 1.4 },
    }),
    kalimba: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 1.5,
      envelope: { attack: 0.001, decay: 1.8, sustain: 0, release: 1.4 },
    }),
  },
};

// Gain staging: reduce synth output to prevent clipping
// Different instruments need different levels based on their characteristics
const SYNTH_VOLUME_DB: Record<string, number> = {
  bass: -15,      // Bass is loud and sustained
  keys: -12,      // Keys can have multiple voices
  lead: -12,      // Lead is typically monophonic
  pad: -18,       // Pads stack and sustain, need more headroom
  pluck: -12,     // Pluck is percussive, quick decay
  strings: -18,   // Strings sustain and layer
  organ: -15,     // Organ sustains
  choir: -18,     // Choir sustains and layers
  epiano: -12,    // E-piano is percussive
  kalimba: -12,   // Kalimba is percussive
};

export function createMelodicSynth(type: InstrumentType, genre: GenrePreset = 'lofi-hiphop'): MelodicSynth {
  const genrePresets = GENRE_SYNTH_PRESETS[genre] ?? GENRE_SYNTH_PRESETS['lofi-hiphop'];
  const creator = genrePresets[type as keyof GenreSynthPresets];
  let synth: MelodicSynth;
  if (!creator) {
    // Fallback to a basic synth if type not found
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.5, release: 0.5 },
    });
  } else {
    synth = creator();
  }
  // Apply gain staging
  synth.volume.value = SYNTH_VOLUME_DB[type] ?? -12;
  return synth;
}

export function getGenrePresetNames(): GenrePreset[] {
  return Object.keys(GENRE_SYNTH_PRESETS) as GenrePreset[];
}
