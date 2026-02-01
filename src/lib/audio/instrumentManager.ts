import * as Tone from 'tone';
import type { InstrumentType, GenrePreset, SynthInstrumentType } from '../types';
import { createDrumKit, connectDrumKit, disposeDrumKit, type DrumKit } from './instruments/drums';
import { createMelodicSynth, type MelodicSynth } from './instruments/melodic';
import {
  createSampledInstrument,
  isSampledInstrument,
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
      // For sampled instruments, create a placeholder and load async
      synth = new Tone.PolySynth(Tone.Synth).connect(channel); // Placeholder
      loading = true;

      // Load the sampler async (mapping to library name handled internally)
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
        // Keep the placeholder synth as fallback
        const instrument = this.instruments.get(trackId);
        if (instrument) {
          instrument.loading = false;
        }
      });
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
      // Convert dB to 0-1 range (roughly -60dB to 0dB)
      const db = typeof level === 'number' ? level : level[0];
      return Math.max(0, Math.min(1, (db + 60) / 60));
    }
    return 0;
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
