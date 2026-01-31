# iPad Rendering Assessment

Assessment of how the Music Maker app renders on iPad devices.

## iPad Screen Sizes Reference

| Device | Resolution | CSS Width (landscape) |
|--------|------------|----------------------|
| iPad Mini | 2266 × 1488 | ~744px |
| iPad (10th gen) | 2360 × 1640 | ~820px |
| iPad Pro 11" | 2388 × 1668 | ~834px |
| iPad Pro 12.9" | 2732 × 2048 | ~1024px |

## Current Strengths

| Aspect | Status |
|--------|--------|
| Viewport meta tag | Correct (`width=device-width, initial-scale=1.0`) |
| Flexbox layouts | Header and grids use flexible layouts |
| Touch events | PadCell uses pointer events with `touch-action: none` |
| CSS Grid | Pad grid scales with CSS variables |
| No hover-only features | Hover enhances but isn't required |

## Issues to Address

### 1. Touch Targets Too Small (Critical)

Apple recommends minimum 44×44pt touch targets. Current sizes:

| Element | Current Size | Recommended |
|---------|--------------|-------------|
| Mute/Solo buttons | 24×24px | 44×44px |
| Stop button | 32×32px | 44×44px |
| Genre buttons | ~32×40px | 44×44px |
| Volume slider thumb | 12×12px | 44×44px |
| BPM slider thumb | ~12px | 44×44px |
| Octave +/- buttons | 28×28px | 44×44px |

**Files affected:**
- `src/components/TrackRow.svelte` - mute/solo buttons
- `src/components/Header.svelte` - genre buttons, sliders, stop button
- `src/components/PadGrid.svelte` - octave buttons

### 2. Header Layout (Medium)

- 6 genre buttons in a row will get cramped on iPad Mini (744px)
- No responsive breakpoints - header may overflow or wrap awkwardly
- Music settings (Key/Scale/BPM) in one row with genres above - could stack better

**File affected:** `src/components/Header.svelte`

### 3. Fixed Widths (Medium)

| Element | Current | Issue |
|---------|---------|-------|
| `.header-spacer` | 120px | Wastes space on larger iPads |
| `.track-header` | 120px | Wastes space on larger iPads |
| `.pad-grid-container` | max-width: 600px | Too narrow for iPad landscape |

**Files affected:**
- `src/components/LoopGrid.svelte`
- `src/components/TrackRow.svelte`
- `src/components/PadGrid.svelte`

### 4. Grid Cells (Minor)

- 12 tracks × 8 columns with 80px max cells - horizontal scroll may be needed on some iPads in portrait
- No visible scrollbar styling for touch

**File affected:** `src/components/LoopGrid.svelte`

### 5. Font Sizes (Minor)

Many labels use small font sizes that may be hard to read:
- Track controls: 0.75rem
- Genre buttons: 0.8rem
- Labels: 0.75rem
- Octave labels: 0.7rem
- Note labels on pad cells: 0.7rem

### 6. Missing Responsive Breakpoints

No `@media` queries exist for:
- Portrait vs landscape orientation
- Different iPad sizes
- Adjusting grid columns/rows based on available space

## Recommended Fixes

### Priority 1: Touch Targets

Increase all interactive elements to minimum 44×44px:

```css
.mute-btn, .solo-btn {
  width: 44px;
  height: 44px;
}

.stop-btn {
  width: 44px;
  height: 44px;
}

.octave-control button {
  width: 44px;
  height: 44px;
}

/* Slider thumbs */
input[type="range"]::-webkit-slider-thumb {
  width: 44px;
  height: 44px;
}
```

### Priority 2: Responsive Header

Add media queries for smaller screens:

```css
@media (max-width: 834px) {
  .genre-picker {
    flex-wrap: wrap;
    justify-content: center;
  }

  .genre-btn {
    min-height: 44px;
  }

  .music-settings {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 744px) {
  header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .left, .center, .right {
    width: 100%;
    justify-content: center;
  }
}
```

### Priority 3: Flexible Widths

```css
/* Make pad grid use more space */
.pad-grid-container {
  max-width: min(600px, 90vw);
}

/* Or for iPad specifically */
@media (min-width: 744px) {
  .pad-grid-container {
    max-width: 80vw;
  }
}

/* Make track header responsive */
.track-header {
  width: clamp(80px, 15vw, 150px);
}
```

### Priority 4: Portrait Orientation

```css
@media (orientation: portrait) {
  .loop-grid {
    overflow-x: auto;
  }

  header {
    flex-direction: column;
  }

  .genre-picker {
    flex-wrap: wrap;
  }
}
```

## Testing Checklist

- [ ] Test on iPad Mini in portrait
- [ ] Test on iPad Mini in landscape
- [ ] Test on iPad Pro 12.9" in landscape
- [ ] Verify all touch targets are easily tappable
- [ ] Verify text is readable without zooming
- [ ] Test horizontal scrolling in loop grid
- [ ] Test pad mode with all scales (chromatic has most columns)
- [ ] Test with external keyboard connected
