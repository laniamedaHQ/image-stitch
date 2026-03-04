import { GeneratedDesignSystem } from './designSystem';
import {
  PromptConstraint,
  PromptDepth,
  PromptTarget,
  getPromptTemplate,
  PROMPT_CONSTRAINT_INSTRUCTIONS,
  PROMPT_DEPTH_INSTRUCTIONS,
} from './promptTemplates';

export type PromptEmphasisRole =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'background'
  | 'surface'
  | 'border'
  | 'textPrimary'
  | 'textSecondary'
  | 'buttonBackground'
  | 'buttonText'
  | 'link'
  | 'typography'
  | 'contrast';

export interface PromptComposeInput {
  target: PromptTarget;
  depth: PromptDepth;
  constraints: PromptConstraint[];
  designSystem: GeneratedDesignSystem;
  userIntent: string;
  emphasisRoles?: PromptEmphasisRole[];
  mustIncludeInstructions?: string[];
}

export interface PromptComposeResult {
  target: PromptTarget;
  depth: PromptDepth;
  title: string;
  body: string;
  sections: string[];
}

const TOKEN_ORDER: Array<keyof GeneratedDesignSystem['palette']> = [
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

const uniqueSorted = <T extends string>(items: T[]): T[] => Array.from(new Set(items)).sort();

const stringifyList = (items: string[]): string => (items.length === 0 ? '- none' : items.map((item) => `- ${item}`).join('\n'));

const formatPalette = (designSystem: GeneratedDesignSystem): string =>
  TOKEN_ORDER.map((token) => `- ${token}: ${designSystem.palette[token]}`).join('\n');

const formatTypography = (designSystem: GeneratedDesignSystem): string =>
  [
    `- pairing: ${designSystem.typography.name}`,
    `- headline: ${designSystem.typography.headlineFamily}`,
    `- body: ${designSystem.typography.bodyFamily}`,
    `- mono: ${designSystem.typography.monoFamily}`,
    `- rationale: ${designSystem.typography.rationale}`,
  ].join('\n');

const formatContrast = (designSystem: GeneratedDesignSystem): string =>
  designSystem.contrast
    .map(
      (item) =>
        `- ${item.role} (${item.label}): ${item.ratio.toFixed(2)}:1 vs target ${item.target.toFixed(1)}:1 (${item.passes ? 'pass' : 'needs attention'})`,
    )
    .join('\n');

const formatWarnings = (designSystem: GeneratedDesignSystem): string =>
  designSystem.warnings.length === 0
    ? '- none'
    : designSystem.warnings.map((warning) => `- ${warning.code}: ${warning.message}`).join('\n');

export const composeAgentPrompt = (input: PromptComposeInput): PromptComposeResult => {
  const template = getPromptTemplate(input.target);
  const constraints = uniqueSorted(input.constraints);
  const emphasisRoles = uniqueSorted(input.emphasisRoles ?? []);
  const customInstructions = (input.mustIncludeInstructions ?? []).map((item) => item.trim()).filter(Boolean);
  const userIntent = input.userIntent.trim() || 'No additional user intent provided.';

  const sectionTask = [
    '# Task',
    'You are a senior design copilot. Use the provided design system exactly and produce output for the requested target.',
    `Target: ${template.label}`,
    `Depth: ${input.depth}`,
    `Intent: ${userIntent}`,
  ].join('\n');

  const sectionSystem = [
    '# Design System Context',
    `Direction: ${input.designSystem.direction}`,
    `Input seeds: ${input.designSystem.inputSeeds.join(', ')}`,
    '',
    '## Palette',
    formatPalette(input.designSystem),
    '',
    '## Typography',
    formatTypography(input.designSystem),
    '',
    '## Contrast report',
    formatContrast(input.designSystem),
    '',
    '## Generator warnings',
    formatWarnings(input.designSystem),
  ].join('\n');

  const sectionConstraints = [
    '# Constraints',
    `- depth guidance: ${PROMPT_DEPTH_INSTRUCTIONS[input.depth]}`,
    ...constraints.map((constraint) => `- ${constraint}: ${PROMPT_CONSTRAINT_INSTRUCTIONS[constraint]}`),
  ].join('\n');

  const sectionFocus = [
    '# Emphasis Priorities',
    stringifyList(emphasisRoles.map((role) => `emphasize ${role}`)),
  ].join('\n');

  const sectionDeliverables = [
    '# Deliverables',
    `- objective: ${template.summary}`,
    ...template.deliverables.map((item) => `- ${item}`),
  ].join('\n');

  const sectionOutput = [
    '# Output Format',
    ...template.outputFormat.map((item) => `- ${item}`),
    '- Keep language concise and implementation-ready.',
  ].join('\n');

  const sectionCustom = ['# Must Include Instructions', stringifyList(customInstructions)].join('\n');

  const sectionChecklist = [
    '# Acceptance Checklist',
    '- Uses provided palette and typography tokens directly.',
    '- Preserves contrast safety and readability expectations.',
    '- Stays on-brand and avoids generic style drift.',
    '- Produces content directly usable by an engineering/design agent.',
  ].join('\n');

  const sections = [
    sectionTask,
    sectionSystem,
    sectionConstraints,
    sectionFocus,
    sectionDeliverables,
    sectionOutput,
    sectionCustom,
    sectionChecklist,
  ];

  return {
    target: input.target,
    depth: input.depth,
    title: `AI Prompt Pack — ${template.label}`,
    body: sections.join('\n\n'),
    sections: [
      'Task',
      'Design System Context',
      'Constraints',
      'Emphasis Priorities',
      'Deliverables',
      'Output Format',
      'Must Include Instructions',
      'Acceptance Checklist',
    ],
  };
};
