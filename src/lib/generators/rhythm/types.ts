// src/lib/generators/rhythm/types.ts
import type { GenrePreset, InstrumentType } from '../../types/music';

export type EnergyLevel = 'low' | 'mid' | 'high';
export type Feel = 'straight' | 'swung' | 'syncopated';
export type TransformationType =
  | 'shift' | 'subdivide' | 'consolidate' | 'ghost'
  | 'accent' | 'omit' | 'fill' | 'euclidean';

export interface TemplateStep {
  position: number;      // 0-15 for 16th note grid
  velocity: number;      // 0-1
  duration: string;      // Tone.js duration
  accent?: boolean;
  ghost?: boolean;
}

export interface RhythmTemplate {
  id: string;
  name: string;
  genre: GenrePreset;
  instrument: InstrumentType | 'any';
  energyLevel: EnergyLevel;
  feel: Feel;
  steps: TemplateStep[];
  variationPoints: number[];  // positions where transformation encouraged
}

export interface GrooveProfile {
  genre: GenrePreset;
  swingAmount: number;           // 0-1
  swingTarget: 'eighths' | 'sixteenths';
  pocket: 'ahead' | 'center' | 'behind';
  tightness: number;             // 0-1
  pushPull: Record<number, number>;  // beat -> ms offset
}

export interface ArticulationProfile {
  genre: GenrePreset;
  velocityRange: [number, number];
  velocityCurve: 'flat' | 'dynamic' | 'compressed';
  accentStrength: number;        // 0-1
  ghostStrength: number;         // 0-1
  defaultNoteLengthRatio: number; // 0.5=staccato, 1.0=legato
  attackSharpness: 'soft' | 'medium' | 'sharp';
}

export interface TransformationRule {
  type: TransformationType;
  probability: number;
  targets: ('downbeat' | 'upbeat' | 'offbeat' | 'any')[];
  preserveDownbeats: boolean;
  maxApplications: number;
  densityRange: [number, number];
  complexityRange: [number, number];
}

export type PhraseContour = 'flat' | 'swell' | 'decay' | 'arc';

export interface DynamicRules {
  downbeatBoost: number;
  backbeatBoost: number;
  phraseContour: PhraseContour;
  accentPositions: number[];
  ghostPositions: number[];
}
