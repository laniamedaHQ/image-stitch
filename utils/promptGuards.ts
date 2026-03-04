import { PromptComposeInput, PromptComposeResult } from './promptComposer';

export interface PromptGuardResult {
  ok: boolean;
  score: number;
  errors: string[];
  warnings: string[];
}

const REQUIRED_HEADINGS = [
  '# Task',
  '# Design System Context',
  '# Constraints',
  '# Deliverables',
  '# Output Format',
  '# Acceptance Checklist',
];

const REQUIRED_TOKENS = [
  'primary',
  'secondary',
  'accent',
  'background',
  'surface',
  'border',
  'textPrimary',
  'textSecondary',
  'buttonBackground',
  'buttonText',
  'link',
];

const includesAll = (source: string, values: string[]): string[] =>
  values.filter((value) => !source.includes(value));

export const validatePromptCompleteness = (
  prompt: string | PromptComposeResult,
  input: PromptComposeInput,
): PromptGuardResult => {
  const body = typeof prompt === 'string' ? prompt : prompt.body;
  const errors: string[] = [];
  const warnings: string[] = [];

  const missingHeadings = includesAll(body, REQUIRED_HEADINGS);
  if (missingHeadings.length > 0) {
    errors.push(`Missing required sections: ${missingHeadings.join(', ')}`);
  }

  const missingTokens = REQUIRED_TOKENS.filter((token) => !body.includes(`${token}:`));
  if (missingTokens.length > 0) {
    errors.push(`Missing semantic token references: ${missingTokens.join(', ')}`);
  }

  if (input.constraints.includes('aa_required') && !/WCAG AA|4\.5:1|contrast/i.test(body)) {
    errors.push('AA-required constraint is enabled but WCAG AA contrast guidance is missing.');
  }

  if (input.constraints.includes('brand_strict') && !/brand|token|palette/i.test(body)) {
    warnings.push('Brand strict mode is enabled but explicit brand guardrail language appears weak.');
  }

  if (input.mustIncludeInstructions && input.mustIncludeInstructions.length > 0) {
    const missingCustom = input.mustIncludeInstructions.filter(
      (instruction) => instruction.trim().length > 0 && !body.includes(instruction.trim()),
    );
    if (missingCustom.length > 0) {
      errors.push(`Missing must-include instructions: ${missingCustom.join(' | ')}`);
    }
  }

  const scoreBase = 100;
  const score = Math.max(0, scoreBase - errors.length * 20 - warnings.length * 5);

  return {
    ok: errors.length === 0,
    score,
    errors,
    warnings,
  };
};
