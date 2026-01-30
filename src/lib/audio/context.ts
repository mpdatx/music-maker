import * as Tone from 'tone';

let initialized = false;

export async function initAudio(): Promise<void> {
  if (initialized) return;

  await Tone.start();
  initialized = true;
  console.log('Audio context started');
}

export function isAudioReady(): boolean {
  return initialized;
}

export function getTransport() {
  return Tone.getTransport();
}

export function setBpm(bpm: number): void {
  Tone.getTransport().bpm.value = bpm;
}

export function getBpm(): number {
  return Tone.getTransport().bpm.value;
}
