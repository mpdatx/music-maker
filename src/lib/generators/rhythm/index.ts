// src/lib/generators/rhythm/index.ts
export * from './types';
export * from './grooveProfiles';
export * from './articulationProfiles';
export * from './transformations';
export * from './dynamics';
export * from './groove';
export * from './pipeline';
export { getDrumTemplates, getDrumTemplatesByEnergy } from './templates/drums';
export { getBassTemplates, getBassTemplatesByEnergy } from './templates/bass';
export { getFillTemplates, getFillTemplatesByEnergy, generateFill } from './templates/fills';
