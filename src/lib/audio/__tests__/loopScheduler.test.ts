import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Tone.js with all required exports as classes
vi.mock('tone', () => {
  class MockLimiter {
    toDestination() { return this; }
    connect() { return this; }
    dispose() {}
  }

  class MockChannel {
    connect() { return this; }
    toDestination() { return this; }
    dispose() {}
  }

  class MockSampler {
    connect() { return this; }
    toDestination() { return this; }
    dispose() {}
    loaded = true;
    triggerAttackRelease() {}
  }

  class MockPolySynth {
    connect() { return this; }
    set() { return this; }
    dispose() {}
    triggerAttackRelease() {}
  }

  class MockSynth {
    connect() { return this; }
    set() { return this; }
    dispose() {}
    triggerAttackRelease() {}
  }

  class MockMembraneSynth {
    connect() { return this; }
    dispose() {}
    triggerAttackRelease() {}
  }

  class MockMetalSynth {
    connect() { return this; }
    set() { return this; }
    dispose() {}
    triggerAttackRelease() {}
  }

  class MockNoiseSynth {
    connect() { return this; }
    set() { return this; }
    dispose() {}
    triggerAttackRelease() {}
  }

  class MockFMSynth {
    connect() { return this; }
    set() { return this; }
    dispose() {}
    triggerAttackRelease() {}
  }

  class MockPart {
    start() {}
    stop() {}
    dispose() {}
    loop = false;
    loopEnd = '2m';
  }

  return {
    Part: MockPart,
    getTransport: vi.fn().mockReturnValue({
      bpm: { value: 120 },
      seconds: 0,
      scheduleOnce: vi.fn(),
    }),
    Limiter: MockLimiter,
    Channel: MockChannel,
    Sampler: MockSampler,
    PolySynth: MockPolySynth,
    Synth: MockSynth,
    MembraneSynth: MockMembraneSynth,
    MetalSynth: MockMetalSynth,
    NoiseSynth: MockNoiseSynth,
    FMSynth: MockFMSynth,
  };
});

import { ProgressionClock } from '../loopScheduler';

describe('ProgressionClock', () => {
  it('calculates correct chord index for position', () => {
    const clock = new ProgressionClock({
      progressionId: 'pop-classic',
      progressionLength: 4,
      barsPerChord: 1,
      bpm: 120,
    });

    // At bar 0, should be chord 0
    expect(clock.getChordIndexAtBar(0)).toBe(0);
    // At bar 1, should be chord 1
    expect(clock.getChordIndexAtBar(1)).toBe(1);
    // At bar 4, should wrap to chord 0
    expect(clock.getChordIndexAtBar(4)).toBe(0);
  });

  it('supports multi-bar chords', () => {
    const clock = new ProgressionClock({
      progressionId: 'pop-classic',
      progressionLength: 4,
      barsPerChord: 2,
      bpm: 120,
    });

    // Bars 0-1 = chord 0
    expect(clock.getChordIndexAtBar(0)).toBe(0);
    expect(clock.getChordIndexAtBar(1)).toBe(0);
    // Bars 2-3 = chord 1
    expect(clock.getChordIndexAtBar(2)).toBe(1);
  });
});
