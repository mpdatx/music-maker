import * as Tone from 'tone';
import type { InstrumentType } from '../types';
import { createDrumKit, connectDrumKit, disposeDrumKit, type DrumKit } from './instruments/drums';
import { createMelodicSynth, type MelodicSynth } from './instruments/melodic';

interface TrackInstrument {
  type: InstrumentType;
  synth: DrumKit | MelodicSynth;
  channel: Tone.Channel;
}

class InstrumentManager {
  private instruments: Map<string, TrackInstrument> = new Map();
  private master: Tone.Channel;
  private limiter: Tone.Limiter;

  constructor() {
    this.limiter = new Tone.Limiter(-1).toDestination();
    this.master = new Tone.Channel().connect(this.limiter);
  }

  createTrackInstrument(trackId: string, type: InstrumentType): TrackInstrument {
    // Dispose existing if any
    this.disposeTrackInstrument(trackId);

    const channel = new Tone.Channel().connect(this.master);

    let synth: DrumKit | MelodicSynth;
    if (type === 'drums' || type === 'percussion') {
      synth = createDrumKit();
      connectDrumKit(synth as DrumKit, channel);
    } else {
      synth = createMelodicSynth(type);
      (synth as MelodicSynth).connect(channel);
    }

    const instrument: TrackInstrument = { type, synth, channel };
    this.instruments.set(trackId, instrument);
    return instrument;
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

  disposeTrackInstrument(trackId: string): void {
    const instrument = this.instruments.get(trackId);
    if (instrument) {
      if (instrument.type === 'drums' || instrument.type === 'percussion') {
        disposeDrumKit(instrument.synth as DrumKit);
      } else {
        (instrument.synth as MelodicSynth).dispose();
      }
      instrument.channel.dispose();
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
}

export const instrumentManager = new InstrumentManager();
