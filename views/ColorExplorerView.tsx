import React, { useState, useCallback } from 'react';
import { RefreshCw, Copy, Check, Lock, Sparkles, ChevronRight } from 'lucide-react';

// --- Color Naming Engine ---

const COLOR_NAMES: Record<string, [number, number][]> = {
  // [hue_min, hue_max] ranges mapped to names by lightness/saturation
  red: [[350, 360], [0, 15]],
  orange: [[15, 45]],
  amber: [[40, 55]],
  yellow: [[50, 70]],
  lime: [[70, 90]],
  green: [[90, 150]],
  teal: [[150, 180]],
  cyan: [[180, 200]],
  blue: [[200, 250]],
  indigo: [[230, 260]],
  violet: [[260, 290]],
  purple: [[270, 300]],
  fuchsia: [[290, 320]],
  pink: [[320, 350]],
};

const LIGHT_PREFIXES = ['Soft', 'Pale', 'Misty', 'Pearl', 'Powder', 'Cotton', 'Cream', 'Cloud', 'Silk', 'Frost'];
const MID_PREFIXES = ['Warm', 'Deep', 'Rich', 'Royal', 'Bold', 'Vivid', 'True', 'Classic', 'Pure', 'Bright'];
const DARK_PREFIXES = ['Dark', 'Midnight', 'Deep', 'Shadow', 'Dusky', 'Charcoal', 'Storm', 'Ember', 'Steel', 'Iron'];
const NEUTRAL_NAMES_LIGHT = ['Snow White', 'Ivory', 'Alabaster', 'Bone', 'Vanilla', 'Cream', 'Pearl', 'Linen', 'Cotton', 'Ghost White'];
const NEUTRAL_NAMES_MID = ['Silver', 'Pewter', 'Dove', 'Ash', 'Fog', 'Slate', 'Stone', 'Cement', 'Smoke', 'Flint'];
const NEUTRAL_NAMES_DARK = ['Charcoal', 'Obsidian', 'Graphite', 'Onyx', 'Iron', 'Coal', 'Jet', 'Raven', 'Ink', 'Void'];

const HUE_NOUNS: Record<string, string[]> = {
  red: ['Coral', 'Ruby', 'Crimson', 'Scarlet', 'Vermillion', 'Cherry', 'Flame', 'Poppy'],
  orange: ['Tangerine', 'Copper', 'Apricot', 'Amber', 'Sienna', 'Peach', 'Rust', 'Terracotta'],
  amber: ['Honey', 'Gold', 'Marigold', 'Saffron', 'Mustard', 'Butterscotch', 'Topaz'],
  yellow: ['Lemon', 'Canary', 'Sunshine', 'Buttercup', 'Daffodil', 'Primrose', 'Citrus'],
  lime: ['Chartreuse', 'Apple', 'Spring', 'Pistachio', 'Kiwi', 'Pear', 'Lime'],
  green: ['Sage', 'Emerald', 'Forest', 'Moss', 'Olive', 'Jade', 'Fern', 'Clover'],
  teal: ['Teal', 'Aqua', 'Lagoon', 'Oasis', 'Sea Mist', 'Seafoam', 'Verdigris'],
  cyan: ['Cyan', 'Cerulean', 'Arctic', 'Ice', 'Pool', 'Glacier', 'Breeze'],
  blue: ['Azure', 'Cobalt', 'Ocean', 'Sapphire', 'Sky', 'Marine', 'Denim', 'Horizon'],
  indigo: ['Indigo', 'Navy', 'Dusk', 'Twilight', 'Bluebell', 'Baltic', 'Starlight'],
  violet: ['Violet', 'Amethyst', 'Heather', 'Wisteria', 'Iris', 'Periwinkle', 'Thistle'],
  purple: ['Plum', 'Grape', 'Mauve', 'Mulberry', 'Orchid', 'Boysenberry', 'Lavender'],
  fuchsia: ['Fuchsia', 'Magenta', 'Berry', 'Raspberry', 'Hibiscus', 'Peony', 'Carnation'],
  pink: ['Rose', 'Blush', 'Salmon', 'Flamingo', 'Petal', 'Bubblegum', 'Carnation'],
};

function hexToHSL(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? 'rgba(0,0,0,0.82)' : 'rgba(255,255,255,0.92)';
}

function getContrastColorSubtle(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.55)';
}

function generateColorName(hex: string, seed: number = 0): string {
  const [h, s, l] = hexToHSL(hex);

  // Neutrals (very low saturation)
  if (s < 12) {
    if (l > 85) return NEUTRAL_NAMES_LIGHT[seed % NEUTRAL_NAMES_LIGHT.length];
    if (l > 40) return NEUTRAL_NAMES_MID[seed % NEUTRAL_NAMES_MID.length];
    return NEUTRAL_NAMES_DARK[seed % NEUTRAL_NAMES_DARK.length];
  }

  // Find hue family
  let hueFamily = 'red';
  for (const [family, ranges] of Object.entries(COLOR_NAMES)) {
    for (const [min, max] of ranges) {
      if (h >= min && h < max) {
        hueFamily = family;
        break;
      }
    }
  }

  const nouns = HUE_NOUNS[hueFamily] || HUE_NOUNS.blue;
  const noun = nouns[(seed + Math.floor(h / 30)) % nouns.length];

  // Pick prefix by lightness
  if (l > 70) {
    const prefix = LIGHT_PREFIXES[(seed + Math.floor(s / 10)) % LIGHT_PREFIXES.length];
    return `${prefix} ${noun}`;
  }
  if (l > 35) {
    const prefix = MID_PREFIXES[(seed + Math.floor(s / 10)) % MID_PREFIXES.length];
    return `${prefix} ${noun}`;
  }
  const prefix = DARK_PREFIXES[(seed + Math.floor(s / 10)) % DARK_PREFIXES.length];
  return `${prefix} ${noun}`;
}

// --- Palette Generation ---

interface PaletteColor {
  key: string;
  hex: string;
  name: string;
  role: string;
}

function generateHarmoniousPalette(): PaletteColor[] {
  const baseHue = Math.random() * 360;

  // Pick a harmony strategy
  const strategies = ['complementary', 'analogous', 'triadic', 'split'] as const;
  const strategy = strategies[Math.floor(Math.random() * strategies.length)];

  let hues: number[];
  switch (strategy) {
    case 'complementary':
      hues = [baseHue, (baseHue + 180) % 360, (baseHue + 30) % 360, (baseHue + 210) % 360];
      break;
    case 'analogous':
      hues = [baseHue, (baseHue + 30) % 360, (baseHue + 60) % 360, (baseHue + 330) % 360];
      break;
    case 'triadic':
      hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360, (baseHue + 60) % 360];
      break;
    case 'split':
      hues = [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360, (baseHue + 330) % 360];
      break;
  }

  // Generate saturations and lightnesses with variety
  const configs = [
    { s: 50 + Math.random() * 35, l: 45 + Math.random() * 20 },
    { s: 40 + Math.random() * 40, l: 40 + Math.random() * 25 },
    { s: 55 + Math.random() * 30, l: 50 + Math.random() * 20 },
    { s: 35 + Math.random() * 45, l: 35 + Math.random() * 35 },
  ];

  const roles = ['Primary', 'Secondary', 'Accent', 'Highlight'];

  return hues.map((hue, i) => {
    const { s, l } = configs[i];
    const hex = hslToHex(hue, s, l);
    return {
      key: roles[i].toLowerCase(),
      hex,
      name: generateColorName(hex, i),
      role: roles[i],
    };
  });
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// --- Prompt Template ---

function buildDesignPrompt(colors: PaletteColor[]): string {
  const colorTokens = colors.map(c =>
    `  --color-${c.key}: ${c.hex}; /* ${c.name} — use for ${c.role.toLowerCase()} elements */`
  ).join('\n');

  const colorDescriptions = colors.map(c =>
    `- **${c.name}** (\`${c.hex}\`) → ${c.role}: Use this as the ${c.key} color throughout the design.`
  ).join('\n');

  return `## Design System — Color Palette

Use the following curated color palette to create a cohesive, visually striking interface.

### CSS Custom Properties
\`\`\`css
:root {
${colorTokens}
}
\`\`\`

### Color Roles
${colorDescriptions}

### Usage Guidelines
- Use the **Primary** color for main CTAs, active states, and key UI elements
- Use the **Secondary** color for supporting elements, secondary buttons, and visual variety
- Use the **Accent** color for highlights, badges, notifications, and emphasis
- Use the **Highlight** color for hover states, selected items, and decorative elements
- Ensure sufficient contrast ratios (WCAG AA minimum) for text on colored backgrounds
- Pair bold colors with neutral backgrounds for readability

### Suggested Neutral Companions
- Background: #FFFFFF or #FAFAFA (light) / #0A0A0B or #111113 (dark)
- Text: #1A1A2E (light mode) / #E8E8ED (dark mode)
- Border: #E2E2E7 (light) / #2A2A2E (dark)
`;
}

// --- Main Component ---

export default function ColorExplorerView() {
  const [colors, setColors] = useState<PaletteColor[]>(() => generateHarmoniousPalette());
  const [copied, setCopied] = useState<string | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const handleRandomize = useCallback(() => {
    setIsShuffling(true);
    // Quick shuffle animation
    setTimeout(() => {
      setColors(generateHarmoniousPalette());
      setIsShuffling(false);
    }, 150);
  }, []);

  const handleCopyHex = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const handleCopyPrompt = useCallback(() => {
    const prompt = buildDesignPrompt(colors);
    navigator.clipboard.writeText(prompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2500);
  }, [colors]);

  return (
    <div className="w-full h-full overflow-auto relative animate-fade-in">
      <div className="absolute inset-0 grid-bg pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">

        {/* Header */}
        <div className="mb-10">
          <span className="font-mono text-[10px] text-accent font-bold tracking-widest uppercase">Tool</span>
          <h2 className="font-serif text-4xl text-primary mt-1">Color Palette Explorer</h2>
          <p className="text-sm text-secondary mt-2 max-w-xl">
            Discover harmonious color combinations. Copy the full design prompt for your AI design agent.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={handleRandomize}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-200"
          >
            <RefreshCw size={16} className={isShuffling ? 'animate-spin' : ''} />
            Randomize
          </button>

          <button
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-surface text-primary border border-border text-sm font-medium rounded-lg hover:bg-accent/5 hover:border-accent/30 active:scale-[0.97] transition-all duration-200"
          >
            {promptCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {promptCopied ? 'Copied Prompt!' : 'Copy AI Prompt'}
          </button>
        </div>

        {/* === COLOR SWATCHES — The Hero === */}
        <div
          className="grid gap-3 mb-8"
          style={{
            gridTemplateColumns: `repeat(${colors.length}, 1fr)`,
          }}
        >
          {colors.map((color, i) => {
            const textColor = getContrastColor(color.hex);
            const subtleColor = getContrastColorSubtle(color.hex);

            return (
              <div
                key={`${color.hex}-${i}`}
                onClick={() => handleCopyHex(color.hex)}
                className="relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated active:scale-[0.99]"
                style={{
                  backgroundColor: color.hex,
                  aspectRatio: '3 / 5',
                  minHeight: '320px',
                  opacity: isShuffling ? 0.4 : 1,
                  transform: isShuffling ? 'scale(0.96)' : undefined,
                  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >
                {/* Color Name — centered */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                  <h3
                    className="font-serif italic text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-center uppercase leading-tight"
                    style={{ color: textColor }}
                  >
                    {color.name}
                  </h3>

                  {/* Hex Badge */}
                  <div
                    className="mt-4 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-wider border transition-all duration-200"
                    style={{
                      color: textColor,
                      borderColor: subtleColor,
                      backgroundColor: `${textColor === 'rgba(0,0,0,0.82)' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {color.hex}
                  </div>
                </div>

                {/* Copy indicator */}
                <div
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: subtleColor }}
                >
                  {copied === color.hex ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </div>

                {/* Role label */}
                <div
                  className="absolute bottom-4 left-4 text-[10px] font-mono font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: subtleColor }}
                >
                  {color.role}
                </div>
              </div>
            );
          })}
        </div>

        {/* Palette Summary Bar */}
        <div className="bg-background border border-border rounded-xl p-5 mb-16">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-medium text-secondary uppercase tracking-wider">Palette Tokens</h4>
            <button
              onClick={handleCopyPrompt}
              className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1 transition-colors"
            >
              {promptCopied ? 'Copied!' : 'Copy full prompt'}
              <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, i) => (
              <button
                key={i}
                onClick={() => handleCopyHex(color.hex)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface border border-border/50 hover:border-accent/30 transition-all group"
              >
                <div
                  className="w-5 h-5 rounded-md flex-shrink-0 border border-border/30"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="text-left">
                  <div className="text-xs font-medium text-primary capitalize">{color.key}</div>
                  <div className="font-mono text-[10px] text-secondary">{color.hex}</div>
                </div>
                {copied === color.hex ? (
                  <Check size={12} className="text-green-500 ml-1" />
                ) : (
                  <Copy size={12} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-12"></div>

        {/* === AI BRAND GENERATOR — Coming Soon === */}
        <section className="mb-12">
          <div
            className="relative bg-background border border-border rounded-2xl p-8 md:p-12 overflow-hidden"
          >
            {/* Decorative gradient blur */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), #8B5CF6)' }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg, #3B82F6, var(--color-accent))' }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Sparkles size={24} className="text-accent" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-serif text-2xl text-primary">AI Brand Generator</h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                    <Lock size={10} />
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm text-secondary max-w-xl leading-relaxed">
                  Generate complete brand systems with AI — colors, typography, spacing, and design tokens,
                  all structured and ready to export. Describe your vision and get a full design system in seconds.
                </p>
              </div>
            </div>

            {/* Teaser feature pills */}
            <div className="relative z-10 flex flex-wrap gap-2 mt-6 md:ml-20">
              {['Color Tokens', 'Typography Pairs', 'Spacing Scale', 'Border Radii', 'Shadow System', 'JSON Export'].map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface text-secondary border border-border"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
