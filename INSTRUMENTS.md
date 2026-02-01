# Instrument Samples Report

## Source

The instrument samples appear to be from the **tonejs-instruments** library:
- **Repository**: https://github.com/nbillbro/tonejs-instruments
- **Original Source**: Samples derived from the [Salamander Grand Piano](https://sfzinstruments.github.io/pianos/salamander/) and various free sample libraries
- **License**: Believed to be CC-BY or similar permissive license (verify at source)

## Sample Statistics

| Instrument | Files | Size | Notes Available |
|------------|-------|------|-----------------|
| bass-electric | 53 | ~2MB | Good chromatic coverage |
| bassoon | 32 | ~1MB | Limited range |
| cello | ~30 | ~1MB | Sparse sampling |
| clarinet | 33 | ~1MB | Sparse - 4 pitch classes |
| contrabass | 39 | ~1MB | Good coverage (10/12 pitch classes) |
| flute | 30 | ~1MB | Sparse - 3 pitch classes (C, E, A) |
| french-horn | 30 | ~1MB | Sparse + 14-semitone gap |
| guitar-acoustic | ~40 | ~2MB | Good chromatic coverage |
| guitar-electric | ~20 | ~1MB | Reduced sampling |
| guitar-nylon | - | - | Not currently used |
| harmonium | ~40 | ~2MB | Good coverage |
| harp | 57 | ~2MB | Good coverage (7/12 pitch classes) |
| organ | ~60 | ~2MB | Good chromatic coverage |
| piano | 85+ | ~10MB | Full chromatic coverage |
| saxophone | ~30 | ~1MB | Limited range |
| trombone | ~30 | ~1MB | Limited range |
| trumpet | 33 | ~1MB | Good coverage (7/12 pitch classes) |
| tuba | 27 | ~1MB | Sparse - 4 pitch classes |
| violin | 45 | ~2MB | Sparse - 4 pitch classes |
| xylophone | 24 | ~1MB | **Very sparse - 2 pitch classes (C, G only)** |

**Total**: ~459MB, ~1348 files

## Sparse Instrument Analysis

Instruments with significant pitch class limitations that affect loop generation:

### Critical (< 5 pitch classes)
| Instrument | Pitch Classes | Available Notes |
|------------|---------------|-----------------|
| xylophone | 2/12 | C, G only (octaves/fifths) |
| flute | 3/12 | C, E, A (Am chord tones) |
| clarinet | 4/12 | D, F, A#, F# |
| violin | 4/12 | G, A, C, E |
| tuba | 4/12 | Limited bass notes |

### Moderate (5-6 pitch classes)
| Instrument | Pitch Classes | Issues |
|------------|---------------|--------|
| french-horn | 6/12 | 14-semitone gap in middle register |

### Acceptable (7+ pitch classes)
- trumpet (7/12)
- harp (7/12)
- contrabass (10/12)
- piano, guitar-acoustic, organ, harmonium (full chromatic)

## Impact on Loop Generation

When the generator creates melodies, notes are quantized to available samples. For sparse instruments:

1. **xylophone**: Melodies collapse to octaves and fifths only
2. **flute**: Limited to Am/C6 type harmonies regardless of key
3. **violin**: Constrained to C major/A minor tonality
4. **clarinet**: Awkward intervals, doesn't fit most keys

## Recommendations

### Option 1: Download More Samples
Supplement sparse instruments with additional samples from:
- [Freesound.org](https://freesound.org) (CC0/CC-BY)
- [Philharmonia Orchestra Sound Samples](https://philharmonia.co.uk/resources/sound-samples/) (free for non-commercial)
- [Virtual Playing Orchestra](https://virtualplaying.com/virtual-playing-orchestra/) (CC-BY)

### Option 2: Use Synthesis for Sparse Instruments
Replace sampled instruments that have < 7 pitch classes with Tone.js synthesis:
- xylophone -> FMSynth with metallic settings
- flute -> Synth with sine oscillator + filter
- violin -> PolySynth with string-like envelope

### Option 3: Restrict Usage
Limit sparse instruments to:
- Drone/pedal tones (root notes only)
- Pad layers (sustained notes, less melodic)
- Remove from melodic track types entirely

## File Format

Samples are provided in three formats:
- `.mp3` - Used by default (good compression)
- `.ogg` - Fallback for browsers without MP3 support
- `.wav` - Original quality (larger files)

## Code Integration

Sample paths are configured in:
- `src/lib/audio/instruments/samplers.ts` - Sample URL mappings
- `src/lib/generators/theory.ts` - Sparse instrument note lists for quantization
- `src/lib/generators/index.ts` - Instrument range constraints
