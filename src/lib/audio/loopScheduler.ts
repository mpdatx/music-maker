import * as Tone from 'tone';
import type { Loop, Note, InstrumentType } from '../types';
import { instrumentManager } from './instrumentManager';
import type { DrumKit } from './instruments/drums';
import type { MelodicSynth } from './instruments/melodic';

type InstrumentSynth = DrumKit | MelodicSynth | Tone.Sampler;

interface ScheduledLoop {
  trackId: string;
  loop: Loop;
  part: Tone.Part;
}

class LoopScheduler {
  private scheduledLoops: Map<string, ScheduledLoop> = new Map();
  private loopLength: Tone.Unit.Time = '2m'; // 2 bars default

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
      // Handle sampled instruments
      instrument.synth.triggerAttackRelease(event.pitch, event.duration, time, event.velocity);
    } else {
      const synth = instrument.synth as MelodicSynth;
      synth.triggerAttackRelease(event.pitch, event.duration, time, event.velocity);
    }
  }

  stopLoop(trackId: string): void {
    const key = this.getLoopKey(trackId);
    const scheduled = this.scheduledLoops.get(key);
    if (scheduled) {
      scheduled.part.stop();
      scheduled.part.dispose();
      this.scheduledLoops.delete(key);
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
    return this.scheduledLoops.has(this.getLoopKey(trackId));
  }

  getLoopProgress(trackId: string): number {
    const key = this.getLoopKey(trackId);
    const scheduled = this.scheduledLoops.get(key);
    if (!scheduled) return 0;

    const transport = Tone.getTransport();
    const loopBars = scheduled.loop.bars;

    // Convert loop length to seconds
    const loopDurationSeconds = (loopBars * 4 * 60) / transport.bpm.value;

    // Get current time in seconds and find position within loop
    const currentSeconds = transport.seconds;
    const progressSeconds = currentSeconds % loopDurationSeconds;

    return progressSeconds / loopDurationSeconds;
  }

  getActiveLoopBars(trackId: string): number {
    const key = this.getLoopKey(trackId);
    const scheduled = this.scheduledLoops.get(key);
    return scheduled?.loop.bars ?? 2;
  }

  stopAll(): void {
    for (const [key, scheduled] of this.scheduledLoops) {
      scheduled.part.stop();
      scheduled.part.dispose();
    }
    this.scheduledLoops.clear();
  }
}

export const loopScheduler = new LoopScheduler();
