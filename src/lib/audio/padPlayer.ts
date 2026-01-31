import * as Tone from 'tone';
import type { InstrumentType, GenrePreset, ScaleType } from '../types';
import { createMelodicSynth, type MelodicSynth } from './instruments/melodic';

const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic: [0, 2, 4, 7, 9],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

class PadPlayer {
  private synth: MelodicSynth | null = null;
  private channel: Tone.Channel;
  private limiter: Tone.Limiter;
  private currentInstrument: Exclude<InstrumentType, 'drums' | 'percussion'> = 'keys';
  private currentGenre: GenrePreset = 'lofi-hiphop';
  private activeNotes: Set<string> = new Set();

  constructor() {
    this.limiter = new Tone.Limiter(-1).toDestination();
    this.channel = new Tone.Channel().connect(this.limiter);
  }

  private createSynth() {
    if (this.synth) {
      this.synth.dispose();
    }
    this.synth = createMelodicSynth(this.currentInstrument, this.currentGenre);
    this.synth.connect(this.channel);
  }

  setInstrument(instrument: Exclude<InstrumentType, 'drums' | 'percussion'>) {
    if (instrument === this.currentInstrument && this.synth) return;
    this.currentInstrument = instrument;
    this.createSynth();
  }

  setGenre(genre: GenrePreset) {
    if (genre === this.currentGenre && this.synth) return;
    this.currentGenre = genre;
    this.createSynth();
  }

  setVolume(volume: number) {
    this.channel.volume.value = Tone.gainToDb(volume);
  }

  getNoteForPosition(
    row: number,
    col: number,
    key: string,
    scale: ScaleType,
    baseOctave: number,
    rows: number
  ): string {
    const intervals = SCALE_INTERVALS[scale];
    const keyIndex = NOTE_NAMES.indexOf(key);

    // Each row is an octave (row 0 = highest octave)
    // Columns are notes within the scale
    const octave = baseOctave + (rows - 1 - row);
    const scaleDegree = col % intervals.length;

    const semitones = intervals[scaleDegree];
    const noteIndex = (keyIndex + semitones) % 12;

    return `${NOTE_NAMES[noteIndex]}${octave}`;
  }

  getScaleLength(scale: ScaleType): number {
    return SCALE_INTERVALS[scale].length;
  }

  playNote(note: string, velocity: number = 0.8) {
    if (!this.synth) {
      this.createSynth();
    }

    if (this.activeNotes.has(note)) return;

    this.activeNotes.add(note);

    if ('triggerAttack' in this.synth!) {
      this.synth!.triggerAttack(note, Tone.now(), velocity);
    }
  }

  releaseNote(note: string) {
    if (!this.synth || !this.activeNotes.has(note)) return;

    this.activeNotes.delete(note);

    if ('triggerRelease' in this.synth!) {
      // PolySynth needs the note, MonoSynth just releases
      if (this.synth instanceof Tone.PolySynth) {
        this.synth.triggerRelease(note, Tone.now());
      } else {
        (this.synth as Tone.MonoSynth).triggerRelease(Tone.now());
      }
    }
  }

  releaseAll() {
    if (!this.synth) return;

    for (const note of this.activeNotes) {
      if (this.synth instanceof Tone.PolySynth) {
        this.synth.triggerRelease(note, Tone.now());
      }
    }

    if (!(this.synth instanceof Tone.PolySynth)) {
      (this.synth as Tone.MonoSynth).triggerRelease(Tone.now());
    }

    this.activeNotes.clear();
  }

  dispose() {
    this.releaseAll();
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    this.channel.dispose();
    this.limiter.dispose();
  }
}

export const padPlayer = new PadPlayer();
