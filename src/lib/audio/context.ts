import * as Tone from 'tone';

let initialized = false;
let masterVolume: Tone.Volume | null = null;

export async function initAudio(): Promise<void> {
  if (initialized) return;

  // Increase lookahead for more stable playback, especially in background
  Tone.getContext().lookAhead = 0.2;

  await Tone.start();

  // Create master volume control
  masterVolume = new Tone.Volume(0).toDestination();
  Tone.getDestination().volume.value = 0;

  initialized = true;

  // Handle tab visibility changes to prevent audio glitches
  document.addEventListener('visibilitychange', handleVisibilityChange);

  console.log('Audio context started');
}

function handleVisibilityChange(): void {
  if (!initialized) return;

  const ctx = Tone.getContext();
  if (document.hidden) {
    // Tab is hidden - context may be throttled but we keep it running
    // The increased lookAhead helps maintain smooth playback
  } else {
    // Tab is visible again - resume if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }
}

export function setMasterVolume(db: number): void {
  if (masterVolume) {
    masterVolume.volume.value = db;
  }
  Tone.getDestination().volume.value = db;
}

export function getMasterVolume(): number {
  return Tone.getDestination().volume.value;
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
