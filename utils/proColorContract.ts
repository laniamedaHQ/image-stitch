import {
  DesignDirection,
  FontPairing,
  GeneratedDesignSystem,
  SemanticPalette,
  contrastRatio,
} from './designSystem';

export type ProFailureType = 'schema_invalid' | 'low_contrast_output' | 'timeout' | 'unknown_error';

export interface ProVariant {
  id: string;
  name: string;
  palette: SemanticPalette;
  typography: {
    headlineFamily: string;
    bodyFamily: string;
    monoFamily: string;
  };
  rationale: string;
  usageNotes: string[];
}

export interface ProVariantRequest {
  seeds: string[];
  direction: DesignDirection;
  currentPalette: SemanticPalette;
  currentTypography: FontPairing;
  currentContrast: Array<{
    role: string;
    ratio: number;
    target: number;
    passes: boolean;
  }>;
  intent: string;
  requestedVariants: number;
}

export interface ProVariantResponse {
  model: string;
  generatedAt: string;
  variants: ProVariant[];
}

interface ValidationFailure {
  ok: false;
  errorType: ProFailureType;
  message: string;
}

interface ValidationSuccess {
  ok: true;
  data: ProVariantResponse;
}

export type ProVariantValidationResult = ValidationFailure | ValidationSuccess;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);

const isHexColor = (value: string): boolean => /^#[0-9A-F]{6}$/i.test(value);

const isIsoDateString = (value: string): boolean => {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
};

const isPalette = (value: unknown): value is SemanticPalette => {
  if (!isRecord(value)) return false;

  const requiredKeys: Array<keyof SemanticPalette> = [
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

  return requiredKeys.every((key) => isString(value[key]) && isHexColor(value[key]));
};

const hasValidContrastInVariant = (variant: ProVariant): boolean => {
  const checks = [
    contrastRatio(variant.palette.textPrimary, variant.palette.background),
    contrastRatio(variant.palette.textSecondary, variant.palette.background),
    contrastRatio(variant.palette.buttonText, variant.palette.buttonBackground),
    contrastRatio(variant.palette.link, variant.palette.background),
  ];

  return checks.every((ratio) => ratio >= 4.5);
};

const parseVariant = (payload: unknown): ProVariant | null => {
  if (!isRecord(payload)) return null;

  if (!isString(payload.id)) return null;
  if (!isString(payload.name)) return null;
  if (!isPalette(payload.palette)) return null;
  if (!isString(payload.rationale)) return null;
  const usageNotesSource =
    payload.usageNotes ??
    (isRecord(payload) && 'usage_notes' in payload ? payload.usage_notes : undefined);
  if (!isStringArray(usageNotesSource)) return null;

  const typography = payload.typography;
  if (!isRecord(typography)) return null;
  if (!isString(typography.headlineFamily)) return null;
  if (!isString(typography.bodyFamily)) return null;
  if (!isString(typography.monoFamily)) return null;

  return {
    id: payload.id,
    name: payload.name,
    palette: payload.palette,
    rationale: payload.rationale,
    usageNotes: usageNotesSource,
    typography: {
      headlineFamily: typography.headlineFamily,
      bodyFamily: typography.bodyFamily,
      monoFamily: typography.monoFamily,
    },
  };
};

export const validateProVariantResponse = (payload: unknown): ProVariantValidationResult => {
  if (!isRecord(payload)) {
    return {
      ok: false,
      errorType: 'schema_invalid',
      message: 'Response must be a JSON object.',
    };
  }

  if (!isString(payload.model)) {
    return {
      ok: false,
      errorType: 'schema_invalid',
      message: 'Missing or invalid `model` field.',
    };
  }

  if (!isString(payload.generatedAt)) {
    return {
      ok: false,
      errorType: 'schema_invalid',
      message: 'Missing or invalid `generatedAt` field.',
    };
  }
  if (!isIsoDateString(payload.generatedAt)) {
    return {
      ok: false,
      errorType: 'schema_invalid',
      message: '`generatedAt` must be a valid ISO date string.',
    };
  }

  if (!Array.isArray(payload.variants) || payload.variants.length === 0) {
    return {
      ok: false,
      errorType: 'schema_invalid',
      message: '`variants` must be a non-empty array.',
    };
  }

  const parsedVariants = payload.variants.map(parseVariant);
  if (parsedVariants.some((variant) => variant === null)) {
    return {
      ok: false,
      errorType: 'schema_invalid',
      message: 'At least one variant is malformed.',
    };
  }

  const variants = parsedVariants as ProVariant[];
  if (variants.some((variant) => !hasValidContrastInVariant(variant))) {
    return {
      ok: false,
      errorType: 'low_contrast_output',
      message: 'One or more variants do not satisfy AA contrast for key text roles.',
    };
  }

  return {
    ok: true,
    data: {
      model: payload.model,
      generatedAt: payload.generatedAt,
      variants,
    },
  };
};

export const buildProRequestPreview = (
  generated: GeneratedDesignSystem,
  intent: string,
  requestedVariants = 3,
): ProVariantRequest => ({
  seeds: generated.inputSeeds,
  direction: generated.direction,
  currentPalette: generated.palette,
  currentTypography: generated.typography,
  currentContrast: generated.contrast.map((item) => ({
    role: item.role,
    ratio: item.ratio,
    target: item.target,
    passes: item.passes,
  })),
  intent: intent.trim() || 'No explicit user intent provided.',
  requestedVariants,
});
