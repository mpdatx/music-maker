import * as Tone from 'tone';
import type { Loop, Note, InstrumentType, LoopBundle } from '../types';
import { instrumentManager } from './instrumentManager';
import type { DrumKit } from './instruments/drums';
import type { MelodicSynth } from './instruments/melodic';

type InstrumentSynth = DrumKit | MelodicSynth | Tone.Sampler;

export interface ProgressionClockConfig {
  progressionId: string;
  progressionLength: number;
  barsPerChord: number;
  bpm: number;
}

export class ProgressionClock {
  private config: ProgressionClockConfig;

  constructor(config: ProgressionClockConfig) {
    this.config = config;
  }

  get totalBars(): number {
    return this.config.progressionLength * this.config.barsPerChord;
  }

  getChordIndexAtBar(bar: number): number {
    const barInProgression = bar % this.totalBars;
    return Math.floor(barInProgression / this.config.barsPerChord);
  }

  getChordIndexAtTime(seconds: number): number {
    const secondsPerBar = (4 * 60) / this.config.bpm;
    const bar = Math.floor(seconds / secondsPerBar);
    return this.getChordIndexAtBar(bar);
  }
}

interface ScheduledLoop {
  trackId: string;
  loop: Loop;
  part: Tone.Part;
}

interface ScheduledBundle {
  trackId: string;
  bundle: LoopBundle;
  parts: Tone.Part[];  // One part per variation
  clock: ProgressionClock;
}

class LoopScheduler {
  private scheduledLoops: Map<string, ScheduledLoop> = new Map();
  private scheduledBundles: Map<string, ScheduledBundle> = new Map();
  private progressionClock: ProgressionClock | null = null;
  private loopLength: Tone.Unit.Time = '2m'; // 2 bars default

  setProgressionClock(clock: ProgressionClock): void {
    this.progressionClock = clock;
  }

  getProgressionClock(): ProgressionClock | null {
    return this.progressionClock;
  }

  private getLoopKey(trackId: string): string {
    return trackId;
  }

  scheduleLoop(trackId: string, loop: Loop): void {
    // Stop any existing loop on this track
    this.stopLoop(trackId);

    const instrument = instrumentManager.getTrackInstrument(trackId);
    if (!instrument) {
      console.warn(`No instrument found for track ${trackId}`);
      return;
    }

    const events = loop.notes.map(note => ({
      time: note.time,
      pitch: note.pitch,
      duration: note.duration,
      velocity: note.velocity,
    }));

    const part = new Tone.Part((time, event) => {
      this.triggerNote(instrument, event, time);
    }, events);

    part.loop = true;
    part.loopEnd = `${loop.bars}m`;
    part.start(0);

    const key = this.getLoopKey(trackId);
    this.scheduledLoops.set(key, { trackId, loop, part });
  }

  private triggerNote(
    instrument: { type: InstrumentType; synth: InstrumentSynth },
    event: { pitch: string; duration: string; velocity: number },
    time: Tone.Unit.Time
  ): void {
    if (instrument.type === 'drums' || instrument.type === 'percussion') {
      const kit = instrument.synth as DrumKit;
      const drum = kit[event.pitch as keyof DrumKit];
      if (drum) {
        if ('triggerAttackRelease' in drum) {
          // NoiseSynth doesn't take a note, others do
          if (drum instanceof Tone.NoiseSynth) {
            drum.triggerAttackRelease(event.duration, time, event.velocity);
          } else {
            (drum as Tone.MembraneSynth | Tone.MetalSynth).triggerAttackRelease('C1', event.duration, time, event.velocity);
          }
        }
      }
    } else if (instrument.synth instanceof Tone.Sampler) {
      // Handle sampled instruments - wrap in try-catch for sparse sample coverage
      try {
        if (instrument.synth.loaded) {
          instrument.synth.triggerAttackRelease(event.pitch, event.duration, time, event.velocity);
        }
      } catch (e) {
        // Sampler couldn't play this note - likely out of sample range
        console.debug(`Sampler couldn't play note ${event.pitch}:`, e);
      }
    } else {
      const synth = instrument.synth as MelodicSynth;
      synth.triggerAttackRelease(event.pitch, event.duration, time, event.velocity);
    }
  }

  scheduleBundleLoop(trackId: string, bundle: LoopBundle, bpm: number): void {
    // Stop any existing loop or bundle on this track
    this.stopLoop(trackId);

    const instrument = instrumentManager.getTrackInstrument(trackId);
    if (!instrument) {
      console.warn(`No instrument found for track ${trackId}`);
      return;
    }

    if (!this.progressionClock) {
      console.warn('No progression clock set - cannot schedule bundle');
      return;
    }

    const clock = this.progressionClock;
    const barsPerChord = bundle.bars;
    const totalBars = clock.totalBars;
    const parts: Tone.Part[] = [];

    // Create a part for each variation, offset to start at the correct bar
    for (const variation of bundle.variations) {
      const startBar = variation.chordIndex * barsPerChord;
      const events = variation.notes.map(note => ({
        time: note.time,
        pitch: note.pitch,
        duration: note.duration,
        velocity: note.velocity,
      }));

      const part = new Tone.Part((time, event) => {
        this.triggerNote(instrument, event, time);
      }, events);

      part.loop = true;
      part.loopEnd = `${totalBars}m`;
      // Start this variation at its chord position within the progression cycle
      part.start(`${startBar}m`);
      parts.push(part);
    }

    const key = this.getLoopKey(trackId);
    this.scheduledBundles.set(key, { trackId, bundle, parts, clock });
  }

  stopLoop(trackId: string): void {
    const key = this.getLoopKey(trackId);

    // Stop regular loop if present
    const scheduled = this.scheduledLoops.get(key);
    if (scheduled) {
      scheduled.part.stop();
      scheduled.part.dispose();
      this.scheduledLoops.delete(key);
    }

    // Stop bundle if present
    const scheduledBundle = this.scheduledBundles.get(key);
    if (scheduledBundle) {
      for (const part of scheduledBundle.parts) {
        part.stop();
        part.dispose();
      }
      this.scheduledBundles.delete(key);
    }
  }

  stopLoopAtEnd(trackId: string, onStop?: () => void): void {
    const key = this.getLoopKey(trackId);
    const scheduled = this.scheduledLoops.get(key);
    if (scheduled) {
      const transport = Tone.getTransport();
      const loopBars = scheduled.loop.bars;

      // Calculate time until the end of current loop iteration
      const loopDurationSeconds = (loopBars * 4 * 60) / transport.bpm.value;
      const currentSeconds = transport.seconds;
      const progressSeconds = currentSeconds % loopDurationSeconds;
      const timeUntilEnd = loopDurationSeconds - progressSeconds;

      // Stop at the end of this loop iteration
      scheduled.part.stop(`+${timeUntilEnd}`);
      // Schedule cleanup
      transport.scheduleOnce(() => {
        scheduled.part.dispose();
        this.scheduledLoops.delete(key);
        onStop?.();
      }, `+${timeUntilEnd}`);
    }
  }

  queueLoop(trackId: string, loop: Loop, onStart?: () => void): void {
    const key = this.getLoopKey(trackId);
    const existing = this.scheduledLoops.get(key);
    const transport = Tone.getTransport();

    if (existing) {
      // Calculate time until end of current loop
      const loopBars = existing.loop.bars;
      const loopDurationSeconds = (loopBars * 4 * 60) / transport.bpm.value;
      const currentSeconds = transport.seconds;
      const progressSeconds = currentSeconds % loopDurationSeconds;
      const timeUntilEnd = loopDurationSeconds - progressSeconds;

      transport.scheduleOnce(() => {
        this.scheduleLoop(trackId, loop);
        onStart?.();
      }, `+${timeUntilEnd}`);
    } else {
      // No current loop, schedule to start at next measure
      transport.scheduleOnce(() => {
        this.scheduleLoop(trackId, loop);
        onStart?.();
      }, '@1m');
    }
  }

  isPlaying(trackId: string): boolean {
    const key = this.getLoopKey(trackId);
    return this.scheduledLoops.has(key) || this.scheduledBundles.has(key);
  }

  getCurrentChordIndex(): number {
    if (!this.progressionClock) return 0;
    const transport = Tone.getTransport();
    return this.progressionClock.getChordIndexAtTime(transport.seconds);
  }

  getLoopProgress(trackId: string): number {
    const key = this.getLoopKey(trackId);
    const transport = Tone.getTransport();

    // Check regular loops first
    const scheduled = this.scheduledLoops.get(key);
    if (scheduled) {
      const loopBars = scheduled.loop.bars;
      const loopDurationSeconds = (loopBars * 4 * 60) / transport.bpm.value;
      const currentSeconds = transport.seconds;
      const progressSeconds = currentSeconds % loopDurationSeconds;
      return progressSeconds / loopDurationSeconds;
    }

    // Check bundles
    const scheduledBundle = this.scheduledBundles.get(key);
    if (scheduledBundle) {
      const loopBars = scheduledBundle.bundle.bars;
      const loopDurationSeconds = (loopBars * 4 * 60) / transport.bpm.value;
      const currentSeconds = transport.seconds;
      const progressSeconds = currentSeconds % loopDurationSeconds;
      return progressSeconds / loopDurationSeconds;
    }

    return 0;
  }

  getActiveLoopBars(trackId: string): number {
    const key = this.getLoopKey(trackId);
    const scheduled = this.scheduledLoops.get(key);
    return scheduled?.loop.bars ?? 2;
  }

  stopAll(): void {
    for (const [, scheduled] of this.scheduledLoops) {
      scheduled.part.stop();
      scheduled.part.dispose();
    }
    this.scheduledLoops.clear();

    for (const [, scheduledBundle] of this.scheduledBundles) {
      for (const part of scheduledBundle.parts) {
        part.stop();
        part.dispose();
      }
    }
    this.scheduledBundles.clear();
  }
}

export const loopScheduler = new LoopScheduler();
