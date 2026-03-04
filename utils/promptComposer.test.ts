import { describe, expect, it } from 'vitest';
import { generateDesignSystem } from './designSystem';
import { composeAgentPrompt } from './promptComposer';
import { PromptTarget } from './promptTemplates';

const baseSystem = generateDesignSystem(['#FF552E', '#1D4ED8', '#F59E0B'], 'editorial');

describe('composeAgentPrompt', () => {
  it('creates deterministic output for same input', () => {
    const input = {
      target: 'web_ui' as const,
      depth: 'production' as const,
      constraints: ['aa_required', 'brand_strict'] as const,
      designSystem: baseSystem,
      userIntent: 'Create a creator-facing landing experience.',
      emphasisRoles: ['primary', 'accent', 'typography'] as const,
      mustIncludeInstructions: ['Use concise section headers.'],
    };

    const first = composeAgentPrompt(input);
    const second = composeAgentPrompt(input);

    expect(first.body).toBe(second.body);
    expect(first.title).toBe(second.title);
  });

  it('includes required structural sections', () => {
    const result = composeAgentPrompt({
      target: 'design_system',
      depth: 'strict_spec',
      constraints: ['aa_required', 'token_naming_strict'],
      designSystem: baseSystem,
      userIntent: 'Build a reusable spec for multiple surfaces.',
    });

    expect(result.body).toContain('# Task');
    expect(result.body).toContain('# Design System Context');
    expect(result.body).toContain('# Constraints');
    expect(result.body).toContain('# Deliverables');
    expect(result.body).toContain('# Output Format');
    expect(result.body).toContain('# Acceptance Checklist');
  });

  it('injects semantic token and typography context', () => {
    const result = composeAgentPrompt({
      target: 'typography',
      depth: 'production',
      constraints: ['brand_strict'],
      designSystem: baseSystem,
      userIntent: 'Focus on hierarchy and readability.',
    });

    expect(result.body).toContain('primary:');
    expect(result.body).toContain('buttonText:');
    expect(result.body).toContain('headline:');
    expect(result.body).toContain('body:');
    expect(result.body).toContain('contrast');
  });

  it('supports every prompt target variant', () => {
    const targets: PromptTarget[] = ['web_ui', 'design_system', 'typography', 'color_grading', 'general_design'];

    for (const target of targets) {
      const result = composeAgentPrompt({
        target,
        depth: 'quick',
        constraints: [],
        designSystem: baseSystem,
        userIntent: `Target ${target}`,
      });

      expect(result.body.length).toBeGreaterThan(300);
      expect(result.target).toBe(target);
    }
  });
});
