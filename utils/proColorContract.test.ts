import { describe, expect, it } from 'vitest';
import { generateDesignSystem } from './designSystem';
import {
  buildProRequestPreview,
  validateProVariantResponse,
} from './proColorContract';

describe('proColorContract', () => {
  it('builds request preview from generated system + intent', () => {
    const generated = generateDesignSystem(['#FF552E', '#1D4ED8', '#F59E0B'], 'product');
    const preview = buildProRequestPreview(generated, 'Make it cleaner for dashboard UI', 3);

    expect(preview.seeds).toEqual(generated.inputSeeds);
    expect(preview.direction).toBe('product');
    expect(preview.currentPalette).toEqual(generated.palette);
    expect(preview.currentTypography).toEqual(generated.typography);
    expect(preview.requestedVariants).toBe(3);
    expect(preview.currentContrast.length).toBeGreaterThan(0);
  });

  it('accepts a valid ProVariantResponse payload', () => {
    const generated = generateDesignSystem(['#FF552E', '#1D4ED8', '#F59E0B'], 'editorial');

    const payload = {
      model: 'gemini-pro-mock',
      generatedAt: '2026-03-04T09:00:00.000Z',
      variants: [
        {
          id: 'variant-1',
          name: 'Safe Variant',
          palette: generated.palette,
          typography: {
            headlineFamily: generated.typography.headlineFamily,
            bodyFamily: generated.typography.bodyFamily,
            monoFamily: generated.typography.monoFamily,
          },
          rationale: 'Uses the local palette to guarantee readable output.',
          usage_notes: ['Use for marketing pages', 'Keep accent for primary CTA'],
        },
      ],
    };

    const result = validateProVariantResponse(payload);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.variants).toHaveLength(1);
      expect(result.data.model).toBe('gemini-pro-mock');
    }
  });

  it('rejects malformed payloads with schema_invalid', () => {
    const result = validateProVariantResponse({ model: 'gemini-only' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe('schema_invalid');
    }
  });

  it('rejects invalid generatedAt values', () => {
    const generated = generateDesignSystem(['#FF552E', '#1D4ED8', '#F59E0B'], 'editorial');
    const result = validateProVariantResponse({
      model: 'gemini-pro-mock',
      generatedAt: 'not-a-date',
      variants: [
        {
          id: 'variant-date-invalid',
          name: 'Bad Date',
          palette: generated.palette,
          typography: {
            headlineFamily: generated.typography.headlineFamily,
            bodyFamily: generated.typography.bodyFamily,
            monoFamily: generated.typography.monoFamily,
          },
          rationale: 'Date should fail.',
          usage_notes: ['Invalid generatedAt'],
        },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe('schema_invalid');
    }
  });

  it('rejects low contrast payloads with low_contrast_output', () => {
    const result = validateProVariantResponse({
      model: 'gemini-pro-mock',
      generatedAt: '2026-03-04T09:00:00.000Z',
      variants: [
        {
          id: 'variant-bad',
          name: 'Low Contrast',
          palette: {
            primary: '#D8D8D8',
            secondary: '#D8D8D8',
            accent: '#D8D8D8',
            background: '#FAFAFA',
            surface: '#F5F5F5',
            border: '#ECECEC',
            textPrimary: '#D8D8D8',
            textSecondary: '#D8D8D8',
            buttonBackground: '#D8D8D8',
            buttonText: '#D8D8D8',
            link: '#D8D8D8',
          },
          typography: {
            headlineFamily: '"Sora", sans-serif',
            bodyFamily: '"Manrope", sans-serif',
            monoFamily: '"IBM Plex Mono", monospace',
          },
          rationale: 'Should fail.',
          usageNotes: ['Invalid contrast intentionally'],
        },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe('low_contrast_output');
    }
  });

  it('rejects malformed variant fields', () => {
    const result = validateProVariantResponse({
      model: 'gemini-pro-mock',
      generatedAt: '2026-03-04T09:00:00.000Z',
      variants: [
        {
          id: 'variant-bad',
          palette: {},
        },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe('schema_invalid');
    }
  });

  it('rejects non-hex palette values as schema_invalid', () => {
    const result = validateProVariantResponse({
      model: 'gemini-pro-mock',
      generatedAt: '2026-03-04T09:00:00.000Z',
      variants: [
        {
          id: 'variant-not-hex',
          name: 'Bad Hex',
          palette: {
            primary: 'red',
            secondary: '#D8D8D8',
            accent: '#D8D8D8',
            background: '#FAFAFA',
            surface: '#F5F5F5',
            border: '#ECECEC',
            textPrimary: '#1F2937',
            textSecondary: '#374151',
            buttonBackground: '#111827',
            buttonText: '#FFFFFF',
            link: '#1D4ED8',
          },
          typography: {
            headlineFamily: '"Sora", sans-serif',
            bodyFamily: '"Manrope", sans-serif',
            monoFamily: '"IBM Plex Mono", monospace',
          },
          rationale: 'Invalid color format.',
          usage_notes: ['primary should fail'],
        },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe('schema_invalid');
    }
  });
});
