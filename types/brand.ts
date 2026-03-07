// Brand Schema Types for AI Agent Structured Output

export interface BrandColor {
  name: string;
  hex: string;
  usage: string;
}

export interface BrandColors {
  primary: BrandColor;
  secondary: BrandColor;
  accent: BrandColor;
  background: BrandColor;
  surface: BrandColor;
  text: BrandColor;
  textMuted: BrandColor;
  border: BrandColor;
  [key: string]: BrandColor;
}

export interface BrandFont {
  family: string;
  weights: number[];
  usage: 'heading' | 'body' | 'accent' | 'mono';
  fallback: string;
}

export interface BrandTypography {
  heading: BrandFont;
  body: BrandFont;
  accent?: BrandFont;
  mono?: BrandFont;
}

export interface BrandSpacing {
  unit: number;
  scale: number[];
}

export interface BrandRadii {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface BrandShadow {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface GeneratedBrand {
  name: string;
  description: string;
  mood: string[];
  colors: BrandColors;
  typography: BrandTypography;
  spacing: BrandSpacing;
  radii: BrandRadii;
  shadows: BrandShadow;
}

// JSON Schema for the agent output
export const brandOutputSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'A creative name for this brand theme'
    },
    description: {
      type: 'string',
      description: 'Brief description of the brand aesthetic'
    },
    mood: {
      type: 'array',
      items: { type: 'string' },
      description: '3-5 keywords describing the brand mood'
    },
    colors: {
      type: 'object',
      properties: {
        primary: { $ref: '#/$defs/brandColor' },
        secondary: { $ref: '#/$defs/brandColor' },
        accent: { $ref: '#/$defs/brandColor' },
        background: { $ref: '#/$defs/brandColor' },
        surface: { $ref: '#/$defs/brandColor' },
        text: { $ref: '#/$defs/brandColor' },
        textMuted: { $ref: '#/$defs/brandColor' },
        border: { $ref: '#/$defs/brandColor' }
      },
      required: ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'textMuted', 'border']
    },
    typography: {
      type: 'object',
      properties: {
        heading: { $ref: '#/$defs/brandFont' },
        body: { $ref: '#/$defs/brandFont' },
        accent: { $ref: '#/$defs/brandFont' },
        mono: { $ref: '#/$defs/brandFont' }
      },
      required: ['heading', 'body']
    },
    spacing: {
      type: 'object',
      properties: {
        unit: { type: 'number', description: 'Base spacing unit in pixels' },
        scale: { 
          type: 'array', 
          items: { type: 'number' },
          description: 'Spacing scale multipliers'
        }
      },
      required: ['unit', 'scale']
    },
    radii: {
      type: 'object',
      properties: {
        sm: { type: 'string' },
        md: { type: 'string' },
        lg: { type: 'string' },
        xl: { type: 'string' },
        full: { type: 'string' }
      },
      required: ['sm', 'md', 'lg', 'xl', 'full']
    },
    shadows: {
      type: 'object',
      properties: {
        sm: { type: 'string' },
        md: { type: 'string' },
        lg: { type: 'string' },
        xl: { type: 'string' }
      },
      required: ['sm', 'md', 'lg', 'xl']
    }
  },
  required: ['name', 'description', 'mood', 'colors', 'typography', 'spacing', 'radii', 'shadows'],
  $defs: {
    brandColor: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Color name (e.g., "Coral Orange")' },
        hex: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', description: 'Hex color code' },
        usage: { type: 'string', description: 'When to use this color' }
      },
      required: ['name', 'hex', 'usage']
    },
    brandFont: {
      type: 'object',
      properties: {
        family: { type: 'string', description: 'Google Font or system font family name' },
        weights: { 
          type: 'array', 
          items: { type: 'number' },
          description: 'Font weights available (e.g., [400, 500, 700])'
        },
        usage: { 
          type: 'string', 
          enum: ['heading', 'body', 'accent', 'mono'],
          description: 'How this font is used'
        },
        fallback: { type: 'string', description: 'Fallback font stack' }
      },
      required: ['family', 'weights', 'usage', 'fallback']
    }
  }
} as const;

// Agent request type
export interface BrandGenerationRequest {
  prompt: string;
  baseColor?: string;
  style?: 'modern' | 'classic' | 'playful' | 'minimal' | 'bold' | 'elegant';
  industry?: string;
}
