import * as Tone from 'tone';
import type { Loop, Note, InstrumentType } from '../types';
import { instrumentManager } from './instrumentManager';
import type { DrumKit } from './instruments/drums';
import type { MelodicSynth } from './instruments/melodic';

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
    instrument: { type: InstrumentType; synth: DrumKit | MelodicSynth },
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

  stopLoopAtEnd(trackId: string): void {
    const key = this.getLoopKey(trackId);
    const scheduled = this.scheduledLoops.get(key);
    if (scheduled) {
      // Calculate next loop boundary
      const transport = Tone.getTransport();
      const bars = scheduled.loop.bars;
      const currentPosition = transport.position as string;
      // Stop at next loop boundary (Tone.js handles this)
      scheduled.part.stop(`+${bars}m`);
      // Schedule cleanup
      transport.scheduleOnce(() => {
        scheduled.part.dispose();
        this.scheduledLoops.delete(key);
      }, `+${bars}m`);
    }
  }

  queueLoop(trackId: string, loop: Loop): void {
    const key = this.getLoopKey(trackId);
    const existing = this.scheduledLoops.get(key);

    if (existing) {
      // Schedule new loop to start when current ends
      const bars = existing.loop.bars;
      const transport = Tone.getTransport();
      transport.scheduleOnce(() => {
        this.scheduleLoop(trackId, loop);
      }, `+${bars}m`);
    } else {
      // No current loop, schedule to start at next bar
      const transport = Tone.getTransport();
      transport.scheduleOnce(() => {
        this.scheduleLoop(trackId, loop);
      }, '@1m');
    }
  }

  isPlaying(trackId: string): boolean {
    return this.scheduledLoops.has(this.getLoopKey(trackId));
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
