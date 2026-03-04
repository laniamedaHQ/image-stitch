export type DesignDirection = 'editorial' | 'product' | 'luxury' | 'playful' | 'brutalist';

export interface FontPairing {
  name: string;
  headlineFamily: string;
  bodyFamily: string;
  monoFamily: string;
  rationale: string;
}

export interface SemanticPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  buttonBackground: string;
  buttonText: string;
  link: string;
}

export type SeedParseIssueReason = 'invalid_hex' | 'duplicate';

export interface SeedParseIssue {
  token: string;
  reason: SeedParseIssueReason;
  message: string;
}

export interface SeedParseResult {
  raw: string;
  tokens: string[];
  validSeeds: string[];
  issues: SeedParseIssue[];
  invalidTokens: string[];
  duplicateTokens: string[];
  normalizedInput: string;
  hasErrors: boolean;
}

export interface ContrastRoleSpec {
  role: 'body' | 'secondary' | 'cta' | 'link' | 'headline';
  label: string;
  textSizePx: number;
  fontWeight: number;
  isLargeText: boolean;
  target: number;
}

export interface ContrastCheckResult extends ContrastRoleSpec {
  foreground: string;
  background: string;
  ratio: number;
  passes: boolean;
  autoCorrected: boolean;
  note?: string;
}

export interface GenerationWarning {
  code: 'near_gray_boost' | 'neon_damped' | 'extreme_seed_balance' | 'contrast_fallback';
  message: string;
}

export interface GeneratedDesignSystem {
  inputSeeds: string[];
  inputParse: SeedParseResult;
  direction: DesignDirection;
  palette: SemanticPalette;
  scales: {
    primary: string[];
    secondary: string[];
    accent: string[];
  };
  typography: FontPairing;
  contrast: ContrastCheckResult[];
  warnings: GenerationWarning[];
  cssVariables: string;
  exportPayloads: {
    cssVariables: string;
    tokensJson: string;
    tailwindSnippet: string;
  };
}

const BLACK = '#09090B';
const WHITE = '#FAFAFA';
const DEFAULT_SEEDS = ['#FF552E', '#1D4ED8', '#F59E0B'];

const CONTRAST_ROLE_SPECS: ContrastRoleSpec[] = [
  {
    role: 'body',
    label: 'Body text',
    textSizePx: 16,
    fontWeight: 400,
    isLargeText: false,
    target: 4.5,
  },
  {
    role: 'secondary',
    label: 'Secondary text',
    textSizePx: 14,
    fontWeight: 400,
    isLargeText: false,
    target: 4.5,
  },
  {
    role: 'cta',
    label: 'CTA button text',
    textSizePx: 16,
    fontWeight: 600,
    isLargeText: false,
    target: 4.5,
  },
  {
    role: 'link',
    label: 'Link text',
    textSizePx: 16,
    fontWeight: 500,
    isLargeText: false,
    target: 4.5,
  },
  {
    role: 'headline',
    label: 'Headline color',
    textSizePx: 38,
    fontWeight: 600,
    isLargeText: true,
    target: 3,
  },
];

const DIRECTION_SETTINGS: Record<
  DesignDirection,
  {
    secondaryShift: number;
    accentShift: number;
    satDelta: number;
    accentSatBoost: number;
    lightnessDelta: number;
    fontMood: 'classic' | 'clean' | 'expressive' | 'technical';
  }
> = {
  editorial: {
    secondaryShift: 32,
    accentShift: 202,
    satDelta: -8,
    accentSatBoost: 12,
    lightnessDelta: -4,
    fontMood: 'classic',
  },
  product: {
    secondaryShift: 20,
    accentShift: 150,
    satDelta: -4,
    accentSatBoost: 8,
    lightnessDelta: -2,
    fontMood: 'clean',
  },
  luxury: {
    secondaryShift: 44,
    accentShift: 178,
    satDelta: -12,
    accentSatBoost: 6,
    lightnessDelta: -10,
    fontMood: 'classic',
  },
  playful: {
    secondaryShift: 58,
    accentShift: 138,
    satDelta: 8,
    accentSatBoost: 16,
    lightnessDelta: 4,
    fontMood: 'expressive',
  },
  brutalist: {
    secondaryShift: 14,
    accentShift: 220,
    satDelta: 0,
    accentSatBoost: 20,
    lightnessDelta: -8,
    fontMood: 'technical',
  },
};

const FONT_PAIRINGS: Record<'classic' | 'clean' | 'expressive' | 'technical', FontPairing[]> = {
  classic: [
    {
      name: 'Editorial Contrast',
      headlineFamily: '"Fraunces", "DM Serif Display", serif',
      bodyFamily: '"Newsreader", serif',
      monoFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      rationale: 'Literary serif voice with high readability for long-form hero and body copy.',
    },
    {
      name: 'Quiet Luxury',
      headlineFamily: '"Instrument Serif", "DM Serif Display", serif',
      bodyFamily: '"Manrope", sans-serif',
      monoFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      rationale: 'Refined serif tone balanced by modern geometric body text.',
    },
  ],
  clean: [
    {
      name: 'Product Clarity',
      headlineFamily: '"Sora", sans-serif',
      bodyFamily: '"Manrope", sans-serif',
      monoFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      rationale: 'High-legibility sans stack for dashboards, SaaS, and marketing pages.',
    },
    {
      name: 'Modern System',
      headlineFamily: '"Outfit", sans-serif',
      bodyFamily: '"IBM Plex Sans", sans-serif',
      monoFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      rationale: 'Neutral, scalable typography for product UI and content-heavy flows.',
    },
  ],
  expressive: [
    {
      name: 'Creative Punch',
      headlineFamily: '"Bricolage Grotesque", "Sora", sans-serif',
      bodyFamily: '"Manrope", sans-serif',
      monoFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      rationale: 'Energetic headline rhythm with grounded body readability.',
    },
    {
      name: 'Playful Editorial',
      headlineFamily: '"Fraunces", "DM Serif Display", serif',
      bodyFamily: '"Outfit", sans-serif',
      monoFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      rationale: 'High personality display style with balanced UI text for playful brands.',
    },
  ],
  technical: [
    {
      name: 'Sharp Utility',
      headlineFamily: '"IBM Plex Sans", sans-serif',
      bodyFamily: '"Manrope", sans-serif',
      monoFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      rationale: 'Straight, utilitarian hierarchy suitable for dense product surfaces.',
    },
    {
      name: 'Code First',
      headlineFamily: '"Sora", sans-serif',
      bodyFamily: '"IBM Plex Sans", sans-serif',
      monoFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
      rationale: 'Developer-forward stack with precise spacing and clear structure.',
    },
  ],
};

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}

interface SeedTraits {
  isNearGray: boolean;
  isNeon: boolean;
  isVeryDark: boolean;
  isVeryLight: boolean;
}

interface ContrastAdjustment {
  color: string;
  autoCorrected: boolean;
  note?: string;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const normalizeHex = (value: string): string | null => {
  const trimmed = value.trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(trimmed)) return trimmed;
  if (/^[0-9A-F]{6}$/.test(trimmed)) return `#${trimmed}`;
  return null;
};

const hexToRgb = (hex: string): Rgb => {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};

const rgbToHex = ({ r, g, b }: Rgb): string =>
  `#${[r, g, b]
    .map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;

const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
  }
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return {
    h: (h * 60 + 360) % 360,
    s: s * 100,
    l: l * 100,
  };
};

const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
  const hn = ((h % 360) + 360) % 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;
  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;
  if (hn < 60) {
    rPrime = c;
    gPrime = x;
  } else if (hn < 120) {
    rPrime = x;
    gPrime = c;
  } else if (hn < 180) {
    gPrime = c;
    bPrime = x;
  } else if (hn < 240) {
    gPrime = x;
    bPrime = c;
  } else if (hn < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return {
    r: (rPrime + m) * 255,
    g: (gPrime + m) * 255,
    b: (bPrime + m) * 255,
  };
};

const shiftHue = (hex: string, shift: number, satDelta = 0, lightnessDelta = 0): string => {
  const hsl = rgbToHsl(hexToRgb(hex));
  return rgbToHex(
    hslToRgb({
      h: (hsl.h + shift + 360) % 360,
      s: clamp(hsl.s + satDelta, 8, 95),
      l: clamp(hsl.l + lightnessDelta, 12, 86),
    }),
  );
};

const mixHex = (colorA: string, colorB: string, amount: number): string => {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  const t = clamp(amount, 0, 1);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
};

const relativeLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const linearize = (value: number): number => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const rs = linearize(r);
  const gs = linearize(g);
  const bs = linearize(b);
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

export const contrastRatio = (foreground: string, background: string): number => {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

const bestTextForBackground = (background: string): string =>
  contrastRatio(BLACK, background) >= contrastRatio(WHITE, background) ? BLACK : WHITE;

const classifySeed = (hex: string): SeedTraits => {
  const hsl = rgbToHsl(hexToRgb(hex));
  return {
    isNearGray: hsl.s < 10,
    isNeon: hsl.s >= 75 && hsl.l >= 50,
    isVeryDark: hsl.l <= 16,
    isVeryLight: hsl.l >= 90,
  };
};

const toSortedLightnessCandidates = (start: number): number[] => {
  const rounded = Math.round(start);
  const values: number[] = [];
  for (let distance = 0; distance <= 100; distance += 1) {
    const down = rounded - distance;
    const up = rounded + distance;
    if (down >= 0) values.push(down);
    if (up <= 100 && up !== down) values.push(up);
  }
  return Array.from(new Set(values));
};

const adjustForContrast = (
  foreground: string,
  background: string,
  target: number,
  warningSink?: GenerationWarning[],
): ContrastAdjustment => {
  const initialRatio = contrastRatio(foreground, background);
  if (initialRatio >= target) {
    return { color: foreground, autoCorrected: false };
  }

  const source = rgbToHsl(hexToRgb(foreground));
  const satCandidates = Array.from(
    new Set([
      clamp(source.s, 4, 96),
      clamp(source.s - 14, 4, 96),
      clamp(source.s - 28, 4, 96),
      clamp(source.s + 10, 4, 96),
    ]),
  );
  const lightnessCandidates = toSortedLightnessCandidates(source.l);

  let bestColor = foreground;
  let bestRatio = initialRatio;

  for (const s of satCandidates) {
    for (const l of lightnessCandidates) {
      const candidate = rgbToHex(hslToRgb({ h: source.h, s, l }));
      const ratio = contrastRatio(candidate, background);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestColor = candidate;
      }
      if (ratio >= target) {
        return {
          color: candidate,
          autoCorrected: true,
          note: `Adjusted token tone to meet ${target.toFixed(1)}:1 contrast.`,
        };
      }
    }
  }

  const blackRatio = contrastRatio(BLACK, background);
  const whiteRatio = contrastRatio(WHITE, background);
  const fallback = blackRatio >= whiteRatio ? BLACK : WHITE;
  const fallbackRatio = Math.max(blackRatio, whiteRatio);

  if (fallbackRatio >= target) {
    warningSink?.push({
      code: 'contrast_fallback',
      message: 'One role required a fallback text color to satisfy contrast requirements.',
    });
    return {
      color: fallback,
      autoCorrected: true,
      note: 'Fallback text color was applied to satisfy contrast target.',
    };
  }

  warningSink?.push({
    code: 'contrast_fallback',
    message: 'One role could not fully satisfy contrast requirements and needs manual review.',
  });

  return {
    color: bestColor,
    autoCorrected: true,
    note: `Best achievable contrast was ${bestRatio.toFixed(2)}:1; manual adjustment is recommended.`,
  };
};

const makeScale = (hex: string): string[] => {
  const tones = [94, 82, 68, 52, 38, 24];
  const hsl = rgbToHsl(hexToRgb(hex));
  return tones.map((tone) =>
    rgbToHex(hslToRgb({ h: hsl.h, s: clamp(hsl.s < 16 ? 22 : hsl.s, 20, 92), l: tone })),
  );
};

const pickFontPairing = (direction: DesignDirection, seedHex: string): FontPairing => {
  const mood = DIRECTION_SETTINGS[direction].fontMood;
  const familyPool = FONT_PAIRINGS[mood];
  const hash = hexToRgb(seedHex);
  const index = (hash.r + hash.g + hash.b) % familyPool.length;
  return familyPool[index];
};

export const parseSeedHexInputDetailed = (raw: string): SeedParseResult => {
  const tokens = raw
    .split(/[,;\s]+/g)
    .map((token) => token.trim())
    .filter(Boolean);

  const issues: SeedParseIssue[] = [];
  const validSeeds: string[] = [];
  const invalidTokens: string[] = [];
  const duplicateTokens: string[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const normalized = normalizeHex(token);
    if (!normalized) {
      invalidTokens.push(token);
      issues.push({
        token,
        reason: 'invalid_hex',
        message: 'Use a 6-digit HEX value, for example #FF552E.',
      });
      continue;
    }

    if (seen.has(normalized)) {
      duplicateTokens.push(normalized);
      issues.push({
        token: normalized,
        reason: 'duplicate',
        message: 'Duplicate values are ignored to keep seeds unique.',
      });
      continue;
    }

    seen.add(normalized);
    validSeeds.push(normalized);
  }

  return {
    raw,
    tokens,
    validSeeds,
    issues,
    invalidTokens,
    duplicateTokens,
    normalizedInput: validSeeds.join(', '),
    hasErrors: invalidTokens.length > 0,
  };
};

export const parseSeedHexInput = (raw: string): string[] => parseSeedHexInputDetailed(raw).validSeeds;

export const randomSeedHexes = (count = 3): string[] =>
  Array.from({ length: count }, () =>
    `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')
      .toUpperCase()}`,
  );

const buildCssVariables = (palette: SemanticPalette, typography: FontPairing): string =>
  [
    ':root {',
    `  --color-primary: ${palette.primary};`,
    `  --color-secondary: ${palette.secondary};`,
    `  --color-accent: ${palette.accent};`,
    `  --color-background: ${palette.background};`,
    `  --color-surface: ${palette.surface};`,
    `  --color-border: ${palette.border};`,
    `  --color-text-primary: ${palette.textPrimary};`,
    `  --color-text-secondary: ${palette.textSecondary};`,
    `  --color-link: ${palette.link};`,
    `  --font-heading: ${typography.headlineFamily};`,
    `  --font-body: ${typography.bodyFamily};`,
    `  --font-mono: ${typography.monoFamily};`,
    '}',
  ].join('\n');

const buildTokenJson = (palette: SemanticPalette, typography: FontPairing): string =>
  JSON.stringify(
    {
      color: palette,
      typography: {
        pairing: typography.name,
        heading: typography.headlineFamily,
        body: typography.bodyFamily,
        mono: typography.monoFamily,
      },
    },
    null,
    2,
  );

const toTailwindFontArrayLiteral = (fontStack: string): string => {
  const parts = fontStack
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^['"]|['"]$/g, ''));

  const quoted = parts.map((part) => `'${part.replace(/'/g, "\\'")}'`);
  return `[${quoted.join(', ')}]`;
};

const buildTailwindSnippet = (palette: SemanticPalette, typography: FontPairing): string =>
  [
    'export default {',
    '  theme: {',
    '    extend: {',
    '      colors: {',
    `        primary: '${palette.primary}',`,
    `        secondary: '${palette.secondary}',`,
    `        accent: '${palette.accent}',`,
    `        background: '${palette.background}',`,
    `        surface: '${palette.surface}',`,
    `        border: '${palette.border}',`,
    `        textPrimary: '${palette.textPrimary}',`,
    `        textSecondary: '${palette.textSecondary}',`,
    `        link: '${palette.link}',`,
    '      },',
    '      fontFamily: {',
    `        heading: ${toTailwindFontArrayLiteral(typography.headlineFamily)},`,
    `        body: ${toTailwindFontArrayLiteral(typography.bodyFamily)},`,
    `        mono: ${toTailwindFontArrayLiteral(typography.monoFamily)},`,
    '      },',
    '    },',
    '  },',
    '};',
  ].join('\n');

const uniqueWarnings = (warnings: GenerationWarning[]): GenerationWarning[] => {
  const seen = new Set<string>();
  return warnings.filter((warning) => {
    const key = `${warning.code}:${warning.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const generateDesignSystem = (
  seedHexes: string[],
  direction: DesignDirection,
): GeneratedDesignSystem => {
  const seeds = seedHexes.length > 0 ? seedHexes : DEFAULT_SEEDS;
  const warnings: GenerationWarning[] = [];
  const [primarySeed, secondarySeed, accentSeed] = [seeds[0], seeds[1], seeds[2]];
  const settings = DIRECTION_SETTINGS[direction];

  const primary = primarySeed ?? DEFAULT_SEEDS[0];
  const primaryTraits = classifySeed(primary);
  const primaryHsl = rgbToHsl(hexToRgb(primary));

  const neutralSatFloor = primaryTraits.isNearGray ? 26 : 12;
  if (primaryTraits.isNearGray) {
    warnings.push({
      code: 'near_gray_boost',
      message: 'Low-chroma seed detected. Accent saturation was lifted for clearer hierarchy.',
    });
  }

  if (primaryTraits.isNeon) {
    warnings.push({
      code: 'neon_damped',
      message: 'Neon seed detected. Accent intensity was damped to preserve readability.',
    });
  }

  if (primaryTraits.isVeryDark || primaryTraits.isVeryLight) {
    warnings.push({
      code: 'extreme_seed_balance',
      message: 'Extreme lightness seed detected. Surface ladder was rebalanced for UI stability.',
    });
  }

  const secondaryRaw =
    secondarySeed ??
    shiftHue(
      primary,
      settings.secondaryShift,
      settings.satDelta,
      settings.lightnessDelta + (primaryTraits.isVeryDark ? 4 : primaryTraits.isVeryLight ? -4 : 0),
    );
  const accentRaw =
    accentSeed ??
    shiftHue(
      primary,
      settings.accentShift,
      settings.accentSatBoost,
      settings.lightnessDelta + (primaryTraits.isVeryDark ? 8 : primaryTraits.isVeryLight ? -6 : 0),
    );

  const normalizeToken = (hex: string, role: 'secondary' | 'accent'): string => {
    const hsl = rgbToHsl(hexToRgb(hex));
    const minSat = role === 'accent' ? Math.max(34, neutralSatFloor) : Math.max(24, neutralSatFloor - 2);
    const cappedSat = primaryTraits.isNeon && role === 'accent' ? clamp(hsl.s, minSat, 70) : clamp(hsl.s, minSat, 90);
    const correctedLightness =
      primaryTraits.isNeon && role === 'accent' ? clamp(hsl.l, 28, 58) : clamp(hsl.l, 18, 78);

    return rgbToHex(
      hslToRgb({
        h: hsl.h,
        s: cappedSat,
        l: correctedLightness,
      }),
    );
  };

  const secondary = normalizeToken(secondaryRaw, 'secondary');
  const accent = normalizeToken(accentRaw, 'accent');

  const background = rgbToHex(
    hslToRgb({
      h: primaryHsl.h,
      s: clamp(primaryTraits.isNearGray ? 7 : primaryHsl.s * 0.14, 5, 14),
      l: primaryTraits.isVeryDark ? 97 : primaryTraits.isVeryLight ? 99 : 98,
    }),
  );
  const surface = rgbToHex(
    hslToRgb({
      h: primaryHsl.h,
      s: clamp(primaryTraits.isNearGray ? 9 : primaryHsl.s * 0.2, 5, 18),
      l: primaryTraits.isVeryDark ? 93 : primaryTraits.isVeryLight ? 96 : 95,
    }),
  );
  const border = rgbToHex(
    hslToRgb({
      h: primaryHsl.h,
      s: clamp(primaryTraits.isNearGray ? 12 : primaryHsl.s * 0.32, 8, 24),
      l: primaryTraits.isVeryDark ? 78 : primaryTraits.isVeryLight ? 84 : 82,
    }),
  );

  const bodyAdjusted = adjustForContrast(bestTextForBackground(background), background, 4.5, warnings);
  const secondaryAdjusted = adjustForContrast(mixHex(bodyAdjusted.color, background, 0.45), background, 4.5, warnings);
  const ctaBackgroundAdjusted = adjustForContrast(accent, background, 2.2, warnings);
  const ctaTextAdjusted = adjustForContrast(
    bestTextForBackground(ctaBackgroundAdjusted.color),
    ctaBackgroundAdjusted.color,
    4.5,
    warnings,
  );
  const linkAdjusted = adjustForContrast(secondary, background, 4.5, warnings);
  const headlineAdjusted = adjustForContrast(primary, background, 3, warnings);

  const palette: SemanticPalette = {
    primary: headlineAdjusted.color,
    secondary,
    accent: ctaBackgroundAdjusted.color,
    background,
    surface,
    border,
    textPrimary: bodyAdjusted.color,
    textSecondary: secondaryAdjusted.color,
    buttonBackground: ctaBackgroundAdjusted.color,
    buttonText: ctaTextAdjusted.color,
    link: linkAdjusted.color,
  };

  const contrast: ContrastCheckResult[] = CONTRAST_ROLE_SPECS.map((spec) => {
    const mapping = {
      body: { foreground: palette.textPrimary, background: palette.background, adjusted: bodyAdjusted },
      secondary: { foreground: palette.textSecondary, background: palette.background, adjusted: secondaryAdjusted },
      cta: { foreground: palette.buttonText, background: palette.buttonBackground, adjusted: ctaTextAdjusted },
      link: { foreground: palette.link, background: palette.background, adjusted: linkAdjusted },
      headline: { foreground: palette.primary, background: palette.background, adjusted: headlineAdjusted },
    }[spec.role];

    const ratio = contrastRatio(mapping.foreground, mapping.background);
    const passes = ratio >= spec.target;

    return {
      ...spec,
      foreground: mapping.foreground,
      background: mapping.background,
      ratio,
      passes,
      autoCorrected: mapping.adjusted.autoCorrected,
      note: !passes
        ? mapping.adjusted.note ?? `Could not fully satisfy ${spec.target.toFixed(1)}:1 contrast target.`
        : mapping.adjusted.note,
    };
  });

  const typography = pickFontPairing(direction, primary);
  const cssVariables = buildCssVariables(palette, typography);
  const exportPayloads = {
    cssVariables,
    tokensJson: buildTokenJson(palette, typography),
    tailwindSnippet: buildTailwindSnippet(palette, typography),
  };

  return {
    inputSeeds: seeds,
    inputParse: {
      raw: seeds.join(', '),
      tokens: seeds,
      validSeeds: seeds,
      issues: [],
      invalidTokens: [],
      duplicateTokens: [],
      normalizedInput: seeds.join(', '),
      hasErrors: false,
    },
    direction,
    palette,
    scales: {
      primary: makeScale(palette.primary),
      secondary: makeScale(palette.secondary),
      accent: makeScale(palette.accent),
    },
    typography,
    contrast,
    warnings: uniqueWarnings(warnings),
    cssVariables,
    exportPayloads,
  };
};

export const buildAiPalettePrompt = (data: GeneratedDesignSystem, userIntent: string): string => {
  const baseContext = [
    'You are a senior web brand designer.',
    'Given this generated design system, create one refined variant with stronger storytelling and production-safe accessibility.',
    'Respect the user intent, but keep all body text pairs at WCAG AA minimum 4.5:1.',
    'Return strict JSON with keys: palette, typography, rationale, usage_notes.',
    `Direction: ${data.direction}`,
    `Input seed colors: ${data.inputSeeds.join(', ')}`,
    `Current palette: ${JSON.stringify(data.palette)}`,
    `Current typography: ${JSON.stringify(data.typography)}`,
    `User intent: ${userIntent || 'No extra intent provided.'}`,
  ];
  return baseContext.join('\n');
};
