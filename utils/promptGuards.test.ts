import { describe, expect, it } from 'vitest';
import { generateDesignSystem } from './designSystem';
import { composeAgentPrompt } from './promptComposer';
import { validatePromptCompleteness } from './promptGuards';

const designSystem = generateDesignSystem(['#FF552E', '#1D4ED8', '#F59E0B'], 'product');

describe('validatePromptCompleteness', () => {
  it('passes for a valid composed prompt', () => {
    const input = {
      target: 'web_ui' as const,
      depth: 'production' as const,
      constraints: ['aa_required', 'brand_strict'],
      designSystem,
      userIntent: 'Create a production-ready prompt.',
      mustIncludeInstructions: ['Use concise section headers.'],
    };

    const prompt = composeAgentPrompt(input);
    const result = validatePromptCompleteness(prompt, input);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.score).toBeGreaterThan(80);
  });

  it('fails when required headings are removed', () => {
    const input = {
      target: 'design_system' as const,
      depth: 'strict_spec' as const,
      constraints: ['aa_required'],
      designSystem,
      userIntent: 'Spec quality.',
    };

    const prompt = composeAgentPrompt(input);
    const broken = prompt.body.replace('# Deliverables', '# Removed Deliverables');
    const result = validatePromptCompleteness(broken, input);

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('Missing required sections'))).toBe(true);
  });

  it('fails when semantic token references are missing', () => {
    const input = {
      target: 'general_design' as const,
      depth: 'quick' as const,
      constraints: [],
      designSystem,
      userIntent: 'General guidance.',
    };

    const prompt = composeAgentPrompt(input);
    const broken = prompt.body.replace(/primary:/g, 'primary_token:');
    const result = validatePromptCompleteness(broken, input);

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('Missing semantic token references'))).toBe(true);
  });

  it('fails when must-include instructions are absent', () => {
    const input = {
      target: 'web_ui' as const,
      depth: 'production' as const,
      constraints: ['aa_required'],
      designSystem,
      userIntent: 'Prompt with strict instructions.',
      mustIncludeInstructions: ['Include mobile-first guidance.'],
    };

    const prompt = composeAgentPrompt({
      ...input,
      mustIncludeInstructions: [],
    });
    const result = validatePromptCompleteness(prompt.body, input);

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('Missing must-include instructions'))).toBe(true);
  });
});
