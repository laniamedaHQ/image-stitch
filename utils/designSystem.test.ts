import { describe, expect, it } from 'vitest';
import {
  DesignDirection,
  generateDesignSystem,
  parseSeedHexInput,
  parseSeedHexInputDetailed,
} from './designSystem';

describe('parseSeedHexInput', () => {
  it('accepts # and non-# values with mixed separators', () => {
    const result = parseSeedHexInput('#FF552E, 1d4ed8; F59E0B');
    expect(result).toEqual(['#FF552E', '#1D4ED8', '#F59E0B']);
  });

  it('deduplicates while preserving first-seen order', () => {
    const result = parseSeedHexInput('#112233 #112233 445566 #112233 445566');
    expect(result).toEqual(['#112233', '#445566']);
  });
});

describe('parseSeedHexInputDetailed', () => {
  it('returns actionable invalid-token metadata', () => {
    const parsed = parseSeedHexInputDetailed('GGGGGG #123 #ABCDEF');

    expect(parsed.validSeeds).toEqual(['#ABCDEF']);
    expect(parsed.invalidTokens).toEqual(['GGGGGG', '#123']);
    expect(parsed.issues.map((item) => item.reason)).toContain('invalid_hex');
    expect(parsed.hasErrors).toBe(true);
  });

  it('reports duplicate tokens in issues', () => {
    const parsed = parseSeedHexInputDetailed('#AA11CC #AA11CC');
    expect(parsed.duplicateTokens).toEqual(['#AA11CC']);
    expect(parsed.issues.some((item) => item.reason === 'duplicate')).toBe(true);
  });
});

describe('generateDesignSystem', () => {
  it('is deterministic for identical input', () => {
    const seeds = ['#FF552E', '#1D4ED8', '#F59E0B'];
    const direction: DesignDirection = 'editorial';
    const first = JSON.stringify(generateDesignSystem(seeds, direction));

    for (let i = 0; i < 100; i += 1) {
      const candidate = JSON.stringify(generateDesignSystem(seeds, direction));
      expect(candidate).toBe(first);
    }
  });

  it('meets contrast target or provides explicit note across 25+ seed sets and all directions', () => {
    const seedMatrix: string[][] = [
      ['#000000'],
      ['#FFFFFF'],
      ['#FF0000'],
      ['#00FF00'],
      ['#0000FF'],
      ['#FF00FF'],
      ['#00FFFF'],
      ['#FFFF00'],
      ['#808080'],
      ['#121212'],
      ['#F9FAFB'],
      ['#F97316'],
      ['#10B981'],
      ['#3B82F6'],
      ['#EC4899'],
      ['#A3A3A3', '#BDBDBD'],
      ['#0EA5E9', '#22C55E', '#EAB308'],
      ['#1D4ED8', '#FF552E', '#F59E0B'],
      ['#7F00FF', '#00FF7F'],
      ['#39FF14', '#FF3131'],
      ['#111827', '#374151', '#9CA3AF'],
      ['#C0C0C0', '#E0E0E0', '#FFFFFF'],
      ['#2E1065', '#4C1D95', '#7E22CE'],
      ['#0B3D2E', '#1F7A8C', '#BFDBF7'],
      ['#B91C1C', '#7F1D1D', '#FCA5A5'],
    ];

    const directions: DesignDirection[] = ['editorial', 'product', 'luxury', 'playful', 'brutalist'];

    for (const seeds of seedMatrix) {
      for (const direction of directions) {
        const generated = generateDesignSystem(seeds, direction);

        for (const score of generated.contrast) {
          const passOrExplained = score.passes || Boolean(score.note);
          expect(passOrExplained).toBe(true);

          if (score.role !== 'headline') {
            expect(score.target).toBe(4.5);
          }
        }
      }
    }
  });

  it('adds warnings for edge-case seed classes', () => {
    const nearGray = generateDesignSystem(['#A3A3A3'], 'product');
    const neon = generateDesignSystem(['#39FF14'], 'playful');
    const veryDark = generateDesignSystem(['#080808'], 'editorial');

    expect(nearGray.warnings.some((warning) => warning.code === 'near_gray_boost')).toBe(true);
    expect(neon.warnings.some((warning) => warning.code === 'neon_damped')).toBe(true);
    expect(veryDark.warnings.some((warning) => warning.code === 'extreme_seed_balance')).toBe(true);
  });

  it('generates JSON and CSS exports that are parseable/usable', () => {
    const generated = generateDesignSystem(['#FF552E', '#1D4ED8', '#F59E0B'], 'editorial');

    expect(() => JSON.parse(generated.exportPayloads.tokensJson)).not.toThrow();
    expect(generated.exportPayloads.cssVariables).toContain('--color-primary');
    expect(generated.exportPayloads.cssVariables).toContain('--font-body');
    expect(generated.exportPayloads.tailwindSnippet).toContain('fontFamily');
    expect(generated.exportPayloads.tailwindSnippet).toContain('colors');
    expect(/'(serif|sans-serif)'/.test(generated.exportPayloads.tailwindSnippet)).toBe(true);
  });
});
