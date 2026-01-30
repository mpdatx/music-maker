import * as Tone from 'tone';
import { loopScheduler } from './loopScheduler';
import type { TransportState } from '../types';

class TransportController {
  start(): void {
    Tone.getTransport().start();
  }

  stop(): void {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    loopScheduler.stopAll();
  }

  pause(): void {
    Tone.getTransport().pause();
  }

  toggle(): void {
    const transport = Tone.getTransport();
    if (transport.state === 'started') {
      this.pause();
    } else {
      this.start();
    }
  }

  getState(): TransportState {
    return Tone.getTransport().state as TransportState;
  }

  setBpm(bpm: number): void {
    Tone.getTransport().bpm.value = bpm;
  }

  getBpm(): number {
    return Tone.getTransport().bpm.value;
  }

  getPosition(): string {
    return Tone.getTransport().position as string;
  }

  getProgress(): number {
    return Tone.getTransport().progress;
  }

  setSwing(amount: number): void {
    Tone.getTransport().swing = amount;
  }
}

export const transport = new TransportController();
