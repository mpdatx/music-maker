import * as Tone from 'tone';

export interface DrumKit {
  kick: Tone.MembraneSynth;
  snare: Tone.NoiseSynth;
  hihat: Tone.MetalSynth;
  openhat: Tone.MetalSynth;
  tom: Tone.MembraneSynth;
  clap: Tone.NoiseSynth;
}

export function createDrumKit(): DrumKit {
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.01,
      release: 0.4,
    },
  });

  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.1,
    },
  });

  const hihat = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.05,
      release: 0.01,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  });
  hihat.frequency.value = 400;

  const openhat = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.3,
      release: 0.1,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  });
  openhat.frequency.value = 400;

  const tom = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0.01,
      release: 0.3,
    },
  });

  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
    },
  });

  return { kick, snare, hihat, openhat, tom, clap };
}

export function connectDrumKit(kit: DrumKit, destination: Tone.InputNode): void {
  Object.values(kit).forEach(synth => synth.connect(destination));
}

export function disposeDrumKit(kit: DrumKit): void {
  Object.values(kit).forEach(synth => synth.dispose());
}
