// src/lib/generators/rhythm/pipeline.ts
import type { GenrePreset, GenerationParams, Note, InstrumentType } from '../../types/music';
import type { TemplateStep, EnergyLevel } from './types';
import { SeededRandom } from '../theory';
import { getDrumTemplates } from './templates/drums';
import { getBassTemplates } from './templates/bass';
import { getGrooveProfile } from './grooveProfiles';
import { getArticulationProfile } from './articulationProfiles';
import { getTransformationRules, applyTransformationChain } from './transformations';
import { getDynamicRules, applyDynamics, applyHumanization } from './dynamics';
import { applyGroove } from './groove';

function densityToEnergy(density: number): EnergyLevel {
  if (density < 0.35) return 'low';
  if (density < 0.7) return 'mid';
  return 'high';
}

function stepsToNotes(
  steps: TemplateStep[],
  instrument: 'drums',
  bar: number
): Note[] {
  const notes: Note[] = [];
  const sorted = [...steps].sort((a, b) => a.position - b.position);

  for (const step of sorted) {
    const time = `${bar}:0:${step.position * 0.25}`;
    let pitch: string;

    if (step.accent && step.velocity > 0.8) {
      pitch = step.position % 8 === 0 ? 'kick' : 'snare';
    } else if (step.velocity > 0.7) {
      pitch = step.position % 4 === 0 ? 'kick' : 'snare';
    } else if (step.ghost) {
      pitch = 'snare';
    } else {
      pitch = 'hihat';
    }

    notes.push({
      pitch,
      time,
      duration: step.duration,
      velocity: step.velocity,
    });
  }

  return notes;
}

/**
 * Get processed rhythm steps with all transformations applied.
 * Returns TemplateSteps that can be used by generators to apply their own pitch logic.
 */
export function getRhythmSteps(
  instrument: InstrumentType,
  genre: GenrePreset,
  params: GenerationParams,
  seed: number
): TemplateStep[] {
  const rng = new SeededRandom(seed);
  const energy = densityToEnergy(params.density);

  // Get templates based on instrument type
  let templates;
  if (instrument === 'drums' || instrument === 'percussion') {
    templates = getDrumTemplates(genre).filter(t => t.energyLevel === energy);
  } else if (instrument === 'bass' || instrument === 'bass-electric' || instrument === 'contrabass' || instrument === 'tuba') {
    templates = getBassTemplates(genre).filter(t => t.energyLevel === energy);
  } else {
    // For other instruments, use bass templates as a melodic base
    templates = getBassTemplates(genre).filter(t => t.energyLevel === energy);
  }

  if (templates.length === 0) {
    templates = instrument === 'drums' ? getDrumTemplates(genre) : getBassTemplates(genre);
  }

  // Select template
  const template = rng.pick(templates);
  let steps = [...template.steps];

  // Apply transformations
  const transformRules = getTransformationRules(params.density, params.complexity);
  steps = applyTransformationChain(steps, transformRules, rng);

  // Apply dynamics
  const articulationProfile = getArticulationProfile(genre);
  const dynamicRules = getDynamicRules(genre);
  steps = applyDynamics(steps, dynamicRules, articulationProfile);

  // Apply humanization
  steps = applyHumanization(steps, articulationProfile, rng);

  return steps;
}

export function processRhythm(
  instrument: InstrumentType,
  genre: GenrePreset,
  params: GenerationParams,
  seed: number,
  bars: number
): Note[] {
  const steps = getRhythmSteps(instrument, genre, params, seed);

  // Convert steps to notes for each bar
  const allNotes: Note[] = [];
  for (let bar = 0; bar < bars; bar++) {
    if (instrument === 'drums' || instrument === 'percussion') {
      allNotes.push(...stepsToNotes(steps, 'drums', bar));
    } else {
      for (const step of steps) {
        allNotes.push({
          pitch: 'C3',
          time: `${bar}:0:${step.position * 0.25}`,
          duration: step.duration,
          velocity: step.velocity,
        });
      }
    }
  }

  // Apply groove
  const grooveProfile = getGrooveProfile(genre);
  return applyGroove(allNotes, grooveProfile);
}
