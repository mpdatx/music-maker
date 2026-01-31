// src/lib/generators/rhythm/transformations.ts
import type { TemplateStep, TransformationType, TransformationRule } from './types';
import type { SeededRandom } from '../theory';

const ALL_RULES: TransformationRule[] = [
  { type: 'shift', probability: 0.3, targets: ['upbeat', 'offbeat'], preserveDownbeats: true, maxApplications: 4, densityRange: [0, 1], complexityRange: [0.3, 1] },
  { type: 'subdivide', probability: 0.4, targets: ['upbeat'], preserveDownbeats: true, maxApplications: 2, densityRange: [0.6, 1], complexityRange: [0.4, 1] },
  { type: 'ghost', probability: 0.5, targets: ['offbeat'], preserveDownbeats: true, maxApplications: 4, densityRange: [0.3, 1], complexityRange: [0.4, 1] },
  { type: 'accent', probability: 0.4, targets: ['any'], preserveDownbeats: false, maxApplications: 3, densityRange: [0, 1], complexityRange: [0.2, 1] },
  { type: 'omit', probability: 0.3, targets: ['upbeat', 'offbeat'], preserveDownbeats: true, maxApplications: 3, densityRange: [0, 0.5], complexityRange: [0, 0.6] },
  { type: 'consolidate', probability: 0.2, targets: ['any'], preserveDownbeats: true, maxApplications: 2, densityRange: [0, 0.4], complexityRange: [0, 0.5] },
];

export function getTransformationRules(density: number, complexity: number): TransformationRule[] {
  return ALL_RULES.filter(rule =>
    density >= rule.densityRange[0] && density <= rule.densityRange[1] &&
    complexity >= rule.complexityRange[0] && complexity <= rule.complexityRange[1]
  );
}

function isDownbeat(position: number): boolean {
  return position % 4 === 0;
}

function isOffbeat(position: number): boolean {
  return position % 2 === 1;
}

interface TransformOptions {
  preserveDownbeats?: boolean;
  maxApplications?: number;
}

export function applyTransformation(
  steps: TemplateStep[],
  type: TransformationType,
  rng: SeededRandom,
  options: TransformOptions
): TemplateStep[] {
  const result = [...steps.map(s => ({ ...s }))];
  const { preserveDownbeats = true, maxApplications = 4 } = options;

  switch (type) {
    case 'shift': {
      let applications = 0;
      for (const step of result) {
        if (applications >= maxApplications) break;
        if (preserveDownbeats && isDownbeat(step.position)) continue;
        if (rng.chance(0.4)) {
          const offset = rng.pick([-1, 1]);
          step.position = Math.max(0, Math.min(15, step.position + offset));
          applications++;
        }
      }
      break;
    }

    case 'subdivide': {
      const toAdd: TemplateStep[] = [];
      let applications = 0;
      for (const step of result) {
        if (applications >= maxApplications) break;
        if (rng.chance(0.5) && !isDownbeat(step.position)) {
          toAdd.push({
            position: Math.min(15, step.position + 1),
            velocity: step.velocity * 0.7,
            duration: '16n',
          });
          applications++;
        }
      }
      result.push(...toAdd);
      break;
    }

    case 'ghost': {
      const toAdd: TemplateStep[] = [];
      let applications = 0;
      for (let pos = 0; pos < 16; pos++) {
        if (applications >= maxApplications) break;
        if (isOffbeat(pos) && !result.some(s => s.position === pos) && rng.chance(0.3)) {
          toAdd.push({
            position: pos,
            velocity: 0.3 + rng.next() * 0.15,
            duration: '32n',
            ghost: true,
          });
          applications++;
        }
      }
      result.push(...toAdd);
      break;
    }

    case 'accent': {
      let applications = 0;
      for (const step of result) {
        if (applications >= maxApplications) break;
        if (rng.chance(0.3)) {
          step.accent = true;
          step.velocity = Math.min(1, step.velocity * 1.15);
          applications++;
        }
      }
      break;
    }

    case 'omit': {
      const toRemove: number[] = [];
      let applications = 0;
      for (let i = 0; i < result.length; i++) {
        if (applications >= maxApplications) break;
        const step = result[i];
        if (preserveDownbeats && isDownbeat(step.position)) continue;
        if (rng.chance(0.3)) {
          toRemove.push(i);
          applications++;
        }
      }
      for (let i = toRemove.length - 1; i >= 0; i--) {
        result.splice(toRemove[i], 1);
      }
      break;
    }

    case 'consolidate': {
      result.sort((a, b) => a.position - b.position);
      const toRemove: number[] = [];
      for (let i = 0; i < result.length - 1; i++) {
        if (result[i + 1].position - result[i].position <= 2) {
          if (preserveDownbeats && isDownbeat(result[i + 1].position)) continue;
          result[i].duration = '4n';
          toRemove.push(i + 1);
        }
      }
      for (let i = toRemove.length - 1; i >= 0; i--) {
        result.splice(toRemove[i], 1);
      }
      break;
    }
  }

  return result.sort((a, b) => a.position - b.position);
}

export function applyTransformationChain(
  steps: TemplateStep[],
  rules: TransformationRule[],
  rng: SeededRandom
): TemplateStep[] {
  let result = steps;
  for (const rule of rules) {
    if (rng.chance(rule.probability)) {
      result = applyTransformation(result, rule.type, rng, {
        preserveDownbeats: rule.preserveDownbeats,
        maxApplications: rule.maxApplications,
      });
    }
  }
  return result;
}
