import * as Tone from 'tone';
import type { InstrumentType, GenrePreset, SynthInstrumentType } from '../types';
import { createDrumKit, connectDrumKit, disposeDrumKit, type DrumKit } from './instruments/drums';
import { createMelodicSynth, type MelodicSynth } from './instruments/melodic';
import {
  createSampledInstrument,
  isSampledInstrument,
  isSamplerLoaded,
  type SampledInstrumentType as SamplerType,
} from './instruments/samplers';

type InstrumentSynth = DrumKit | MelodicSynth | Tone.Sampler;

interface TrackInstrument {
  type: InstrumentType;
  synth: InstrumentSynth;
  channel: Tone.Channel;
  meter: Tone.Meter;
  loading?: boolean;
}

class InstrumentManager {
  private instruments: Map<string, TrackInstrument> = new Map();
  private master: Tone.Channel;
  private limiter: Tone.Limiter;
  private currentGenre: GenrePreset = 'lofi-hiphop';

  constructor() {
    this.limiter = new Tone.Limiter(-1).toDestination();
    this.master = new Tone.Channel().connect(this.limiter);
  }

  createTrackInstrument(trackId: string, type: InstrumentType, genre?: GenrePreset): TrackInstrument {
    // Dispose existing if any
    this.disposeTrackInstrument(trackId);

    const useGenre = genre ?? this.currentGenre;
    const meter = new Tone.Meter({ smoothing: 0.8 });
    // Chain: channel → meter → master (so meter sees post-volume signal)
    const channel = new Tone.Channel().connect(meter);
    meter.connect(this.master);

    let synth: InstrumentSynth;
    let loading = false;

    if (type === 'drums' || type === 'percussion') {
      synth = createDrumKit(useGenre);
      connectDrumKit(synth as DrumKit, channel);
    } else if (isSampledInstrument(type)) {
      // For sampled instruments, check if already preloaded
      if (isSamplerLoaded(type as SamplerType)) {
        // Sampler is already loaded, use it directly
        createSampledInstrument(type as SamplerType).then((sampler) => {
          sampler.connect(channel);
          const instrument = this.instruments.get(trackId);
          if (instrument) {
            instrument.synth = sampler;
          }
        });
        // Use a placeholder initially (will be replaced immediately)
        synth = new Tone.PolySynth(Tone.Synth).connect(channel);
        loading = false; // Not really loading since it's cached
      } else {
        // Sampler not preloaded - create placeholder and load async
        synth = new Tone.PolySynth(Tone.Synth).connect(channel);
        loading = true;

        createSampledInstrument(type as SamplerType).then((sampler) => {
          const instrument = this.instruments.get(trackId);
          if (instrument && instrument.type === type) {
            // Dispose placeholder and replace with sampler
            (instrument.synth as MelodicSynth).dispose();
            sampler.connect(channel);
            instrument.synth = sampler;
            instrument.loading = false;
            this.onInstrumentLoaded?.(trackId, type);
          }
        }).catch((err) => {
          console.error(`Failed to load sampler for ${type}:`, err);
          const instrument = this.instruments.get(trackId);
          if (instrument) {
            instrument.loading = false;
          }
        });
      }
    } else {
      synth = createMelodicSynth(type as SynthInstrumentType, useGenre);
      (synth as MelodicSynth).connect(channel);
    }

    const instrument: TrackInstrument = { type, synth, channel, meter, loading };
    this.instruments.set(trackId, instrument);
    return instrument;
  }

  // Callback for when sampled instrument finishes loading
  onInstrumentLoaded?: (trackId: string, type: InstrumentType) => void;

  isInstrumentLoading(trackId: string): boolean {
    return this.instruments.get(trackId)?.loading ?? false;
  }

  // Wait for an instrument to finish loading (resolves immediately if already loaded)
  async waitForInstrument(trackId: string): Promise<void> {
    const instrument = this.instruments.get(trackId);
    if (!instrument || !instrument.loading) {
      return;
    }

    // Poll until loading is complete
    return new Promise((resolve) => {
      const check = () => {
        const inst = this.instruments.get(trackId);
        if (!inst || !inst.loading) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  // Check if any instruments are currently loading
  isAnyInstrumentLoading(): boolean {
    for (const instrument of this.instruments.values()) {
      if (instrument.loading) {
        return true;
      }
    }
    return false;
  }

  // Wait for all instruments to finish loading
  async waitForAllInstruments(): Promise<void> {
    const loadingTracks = Array.from(this.instruments.entries())
      .filter(([_, inst]) => inst.loading)
      .map(([id]) => id);

    await Promise.all(loadingTracks.map(id => this.waitForInstrument(id)));
  }

  getTrackInstrument(trackId: string): TrackInstrument | undefined {
    return this.instruments.get(trackId);
  }

  setTrackVolume(trackId: string, volume: number): void {
    const instrument = this.instruments.get(trackId);
    if (instrument) {
      instrument.channel.volume.value = Tone.gainToDb(volume);
    }
  }

  setTrackPan(trackId: string, pan: number): void {
    const instrument = this.instruments.get(trackId);
    if (instrument) {
      instrument.channel.pan.value = pan;
    }
  }

  setTrackMute(trackId: string, muted: boolean): void {
    const instrument = this.instruments.get(trackId);
    if (instrument) {
      instrument.channel.mute = muted;
    }
  }

  setMasterVolume(volume: number): void {
    this.master.volume.value = Tone.gainToDb(volume);
  }

  getTrackLevel(trackId: string): number {
    const instrument = this.instruments.get(trackId);
    if (instrument) {
      const level = instrument.meter.getValue();
      const db = typeof level === 'number' ? level : level[0];
      // Map dB to 0-1: -48dB = 0, 0dB = 1, with steep curve
      const normalized = Math.max(0, Math.min(1, (db + 48) / 48));
      return Math.pow(normalized, 0.3);
    }
    return 0;
  }

  getTrackLevelDb(trackId: string): number {
    const instrument = this.instruments.get(trackId);
    if (instrument) {
      const level = instrument.meter.getValue();
      return typeof level === 'number' ? level : level[0];
    }
    return -Infinity;
  }

  disposeTrackInstrument(trackId: string): void {
    const instrument = this.instruments.get(trackId);
    if (instrument) {
      if (instrument.type === 'drums' || instrument.type === 'percussion') {
        disposeDrumKit(instrument.synth as DrumKit);
      } else if (instrument.synth instanceof Tone.Sampler) {
        instrument.synth.dispose();
      } else {
        (instrument.synth as MelodicSynth).dispose();
      }
      instrument.channel.dispose();
      instrument.meter.dispose();
      this.instruments.delete(trackId);
    }
  }

  disposeAll(): void {
    for (const trackId of this.instruments.keys()) {
      this.disposeTrackInstrument(trackId);
    }
    this.master.dispose();
    this.limiter.dispose();
  }

  setGenre(genre: GenrePreset): void {
    if (genre === this.currentGenre) return;

    this.currentGenre = genre;

    // Recreate all instruments with the new genre
    // Store current settings before disposing
    const trackSettings: Map<string, { type: InstrumentType; volume: number; pan: number; muted: boolean }> = new Map();

    for (const [trackId, instrument] of this.instruments.entries()) {
      trackSettings.set(trackId, {
        type: instrument.type,
        volume: Tone.dbToGain(instrument.channel.volume.value),
        pan: instrument.channel.pan.value,
        muted: instrument.channel.mute,
      });
    }

    // Recreate each instrument with new genre presets
    for (const [trackId, settings] of trackSettings.entries()) {
      this.createTrackInstrument(trackId, settings.type, genre);
      this.setTrackVolume(trackId, settings.volume);
      this.setTrackPan(trackId, settings.pan);
      this.setTrackMute(trackId, settings.muted);
    }
  }

  getGenre(): GenrePreset {
    return this.currentGenre;
  }
}

export const instrumentManager = new InstrumentManager();
