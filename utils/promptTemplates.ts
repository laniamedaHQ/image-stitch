export type PromptTarget =
  | 'web_ui'
  | 'design_system'
  | 'typography'
  | 'color_grading'
  | 'general_design';

export type PromptDepth = 'quick' | 'production' | 'strict_spec';

export type PromptConstraint =
  | 'aa_required'
  | 'brand_strict'
  | 'no_random_colors'
  | 'token_naming_strict'
  | 'creative_range';

export interface PromptTemplate {
  target: PromptTarget;
  label: string;
  summary: string;
  deliverables: string[];
  outputFormat: string[];
}

export const PROMPT_TEMPLATE_MAP: Record<PromptTarget, PromptTemplate> = {
  web_ui: {
    target: 'web_ui',
    label: 'Web UI Implementation',
    summary: 'Turn the design system into production-ready page/component UI direction.',
    deliverables: [
      'Layout structure and hierarchy',
      'Component styling decisions using provided tokens',
      'Interaction and motion guidance',
      'Responsive behavior notes',
    ],
    outputFormat: [
      'Return implementation-oriented guidance with sectioned markdown.',
      'Include explicit token usage for major UI areas.',
      'List risks and accessibility checks.',
    ],
  },
  design_system: {
    target: 'design_system',
    label: 'Design System Specification',
    summary: 'Create a reusable token and component specification.',
    deliverables: [
      'Token taxonomy and semantic mapping',
      'Component usage rules',
      'Do and do-not style constraints',
      'Naming and adoption guidelines',
    ],
    outputFormat: [
      'Return a structured spec document.',
      'Use strict naming recommendations and token references.',
      'Include migration and adoption checklist.',
    ],
  },
  typography: {
    target: 'typography',
    label: 'Typography Direction',
    summary: 'Focus on font hierarchy, rhythm, readability, and expressive usage.',
    deliverables: [
      'Headline/body/mono role system',
      'Scale recommendations and rhythm',
      'Weight and contrast strategy',
      'Fallback stack usage rules',
    ],
    outputFormat: [
      'Return a typography playbook.',
      'Include practical examples for UI and marketing contexts.',
      'Flag readability and accessibility considerations.',
    ],
  },
  color_grading: {
    target: 'color_grading',
    label: 'Color Grading Guidance',
    summary: 'Apply color logic for visual treatments and creative outputs.',
    deliverables: [
      'Primary/secondary/accent grading logic',
      'Contrast-safe usage recommendations',
      'Mood variants by context',
      'Avoid-list for off-brand color use',
    ],
    outputFormat: [
      'Return concise grading rules with examples.',
      'Keep recommendations grounded in the provided token set.',
      'Explicitly preserve readability constraints.',
    ],
  },
  general_design: {
    target: 'general_design',
    label: 'General Design Direction',
    summary: 'Produce broad design guidance for mixed creative and product tasks.',
    deliverables: [
      'Visual language summary',
      'Token usage priorities',
      'Typography and spacing principles',
      'Quality checklist for final output',
    ],
    outputFormat: [
      'Return practical, implementation-friendly guidance.',
      'Keep language direct and actionable.',
      'Include acceptance checks.',
    ],
  },
};

export const PROMPT_DEPTH_INSTRUCTIONS: Record<PromptDepth, string> = {
  quick: 'Keep the response concise and practical, optimized for fast execution.',
  production: 'Provide production-grade detail with clear implementation constraints and checks.',
  strict_spec:
    'Provide a strict, decision-complete specification with explicit rules, assumptions, and acceptance criteria.',
};

export const PROMPT_CONSTRAINT_INSTRUCTIONS: Record<PromptConstraint, string> = {
  aa_required: 'Enforce WCAG AA contrast for key text roles and call out any required corrections.',
  brand_strict: 'Stay strictly within the provided brand voice and token palette.',
  no_random_colors: 'Do not introduce arbitrary colors outside the provided design system.',
  token_naming_strict: 'Use consistent semantic token names and avoid ad-hoc aliases.',
  creative_range: 'Include controlled creative alternatives while preserving core system consistency.',
};

export const getPromptTemplate = (target: PromptTarget): PromptTemplate => PROMPT_TEMPLATE_MAP[target];
