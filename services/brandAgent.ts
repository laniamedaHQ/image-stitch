// Brand Agent Service - Simulates an-sdk agent with structured JSON output
// In production, this would call the actual an-sdk/an.dev API

import { GeneratedBrand, BrandGenerationRequest, brandOutputSchema } from '../types/brand';

// Mock agent responses for demonstration
const mockBrandResponses: Record<string, GeneratedBrand> = {
  modern: {
    name: "Nordic Flow",
    description: "A clean, modern aesthetic inspired by Scandinavian design principles with emphasis on whitespace and subtle contrasts.",
    mood: ["minimal", "airy", "sophisticated", "calm", "professional"],
    colors: {
      primary: { name: "Deep Indigo", hex: "#4F46E5", usage: "Primary buttons, links, key actions" },
      secondary: { name: "Soft Teal", hex: "#14B8A6", usage: "Secondary actions, highlights" },
      accent: { name: "Coral Warmth", hex: "#F97316", usage: "CTAs, badges, important highlights" },
      background: { name: "Pure White", hex: "#FAFAFA", usage: "Page background" },
      surface: { name: "Cloud White", hex: "#FFFFFF", usage: "Cards, elevated surfaces" },
      text: { name: "Charcoal", hex: "#18181B", usage: "Primary text, headings" },
      textMuted: { name: "Slate", hex: "#71717A", usage: "Secondary text, captions" },
      border: { name: "Mist", hex: "#E4E4E7", usage: "Borders, dividers" }
    },
    typography: {
      heading: { family: "Inter", weights: [400, 500, 600, 700], usage: "heading", fallback: "system-ui, sans-serif" },
      body: { family: "Inter", weights: [400, 500], usage: "body", fallback: "system-ui, sans-serif" },
      mono: { family: "JetBrains Mono", weights: [400, 500], usage: "mono", fallback: "monospace" }
    },
    spacing: { unit: 4, scale: [0, 0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64] },
    radii: { sm: "4px", md: "8px", lg: "12px", xl: "16px", full: "9999px" },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
    }
  },
  bold: {
    name: "Electric Edge",
    description: "A bold, high-contrast brand identity designed for impact and memorability.",
    mood: ["bold", "energetic", "confident", "dynamic", "powerful"],
    colors: {
      primary: { name: "Electric Violet", hex: "#7C3AED", usage: "Primary actions, brand moments" },
      secondary: { name: "Hot Pink", hex: "#EC4899", usage: "Secondary highlights, gradients" },
      accent: { name: "Neon Cyan", hex: "#06B6D4", usage: "Accents, interactive elements" },
      background: { name: "Midnight", hex: "#0F0F23", usage: "Dark mode background" },
      surface: { name: "Deep Space", hex: "#1A1A2E", usage: "Cards, surfaces" },
      text: { name: "Pure White", hex: "#FFFFFF", usage: "Primary text" },
      textMuted: { name: "Starlight", hex: "#A1A1AA", usage: "Secondary text" },
      border: { name: "Cosmic", hex: "#27273A", usage: "Borders on dark" }
    },
    typography: {
      heading: { family: "Space Grotesk", weights: [500, 600, 700], usage: "heading", fallback: "system-ui, sans-serif" },
      body: { family: "Inter", weights: [400, 500], usage: "body", fallback: "system-ui, sans-serif" },
      accent: { family: "Space Grotesk", weights: [600, 700], usage: "accent", fallback: "system-ui, sans-serif" }
    },
    spacing: { unit: 8, scale: [0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16] },
    radii: { sm: "6px", md: "12px", lg: "16px", xl: "24px", full: "9999px" },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
      lg: "0 10px 15px -3px rgb(124 58 237 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
      xl: "0 20px 40px -5px rgb(124 58 237 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.4)"
    }
  },
  elegant: {
    name: "Timeless Grace",
    description: "An elegant, refined aesthetic with warm neutrals and sophisticated typography.",
    mood: ["elegant", "warm", "refined", "luxurious", "timeless"],
    colors: {
      primary: { name: "Burgundy", hex: "#881337", usage: "Primary brand color" },
      secondary: { name: "Antique Gold", hex: "#D4A574", usage: "Accents, highlights" },
      accent: { name: "Sage", hex: "#84A98C", usage: "Soft accents, success states" },
      background: { name: "Cream", hex: "#FDF8F3", usage: "Page background" },
      surface: { name: "Pearl", hex: "#FFFFFF", usage: "Cards, surfaces" },
      text: { name: "Espresso", hex: "#2C1810", usage: "Primary text" },
      textMuted: { name: "Taupe", hex: "#8B7355", usage: "Secondary text" },
      border: { name: "Sand", hex: "#E8DFD5", usage: "Borders, dividers" }
    },
    typography: {
      heading: { family: "Playfair Display", weights: [400, 500, 600, 700], usage: "heading", fallback: "Georgia, serif" },
      body: { family: "Source Sans 3", weights: [400, 500, 600], usage: "body", fallback: "system-ui, sans-serif" },
      accent: { family: "Playfair Display", weights: [500, 600], usage: "accent", fallback: "Georgia, serif" }
    },
    spacing: { unit: 4, scale: [0, 0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32] },
    radii: { sm: "2px", md: "4px", lg: "8px", xl: "12px", full: "9999px" },
    shadows: {
      sm: "0 1px 2px 0 rgb(44 24 16 / 0.05)",
      md: "0 4px 6px -1px rgb(44 24 16 / 0.08), 0 2px 4px -2px rgb(44 24 16 / 0.05)",
      lg: "0 10px 15px -3px rgb(44 24 16 / 0.08), 0 4px 6px -4px rgb(44 24 16 / 0.05)",
      xl: "0 20px 25px -5px rgb(44 24 16 / 0.1), 0 8px 10px -6px rgb(44 24 16 / 0.05)"
    }
  },
  playful: {
    name: "Bubble Pop",
    description: "A fun, energetic brand with rounded shapes and vibrant colors that spark joy.",
    mood: ["playful", "fun", "energetic", "friendly", "approachable"],
    colors: {
      primary: { name: "Bubblegum", hex: "#F472B6", usage: "Primary actions" },
      secondary: { name: "Lemon", hex: "#FDE047", usage: "Highlights, warnings" },
      accent: { name: "Mint", hex: "#34D399", usage: "Success, accents" },
      background: { name: "Lavender Blush", hex: "#FFF0F5", usage: "Page background" },
      surface: { name: "White", hex: "#FFFFFF", usage: "Cards, surfaces" },
      text: { name: "Deep Purple", hex: "#581C87", usage: "Primary text" },
      textMuted: { name: "Wisteria", hex: "#8B5CF6", usage: "Secondary text" },
      border: { name: "Thistle", hex: "#D8B4FE", usage: "Borders" }
    },
    typography: {
      heading: { family: "Fredoka", weights: [400, 500, 600], usage: "heading", fallback: "system-ui, sans-serif" },
      body: { family: "Nunito", weights: [400, 500, 600], usage: "body", fallback: "system-ui, sans-serif" },
      accent: { family: "Fredoka", weights: [500, 600], usage: "accent", fallback: "system-ui, sans-serif" }
    },
    spacing: { unit: 8, scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] },
    radii: { sm: "8px", md: "16px", lg: "24px", xl: "32px", full: "9999px" },
    shadows: {
      sm: "0 2px 4px 0 rgb(88 28 135 / 0.1)",
      md: "0 4px 8px -2px rgb(88 28 135 / 0.15), 0 2px 4px -2px rgb(88 28 135 / 0.1)",
      lg: "0 8px 16px -4px rgb(88 28 135 / 0.15), 0 4px 8px -4px rgb(88 28 135 / 0.1)",
      xl: "0 16px 32px -8px rgb(88 28 135 / 0.2), 0 8px 16px -8px rgb(88 28 135 / 0.1)"
    }
  },
  minimal: {
    name: "Mono Focus",
    description: "Ultra-minimalist black and white aesthetic with careful attention to typography and space.",
    mood: ["minimal", "clean", "focused", "pure", "essential"],
    colors: {
      primary: { name: "True Black", hex: "#000000", usage: "Primary elements, buttons" },
      secondary: { name: "Dark Gray", hex: "#404040", usage: "Secondary elements" },
      accent: { name: "Light Gray", hex: "#A3A3A3", usage: "Subtle highlights" },
      background: { name: "White", hex: "#FFFFFF", usage: "Background" },
      surface: { name: "Off White", hex: "#FAFAFA", usage: "Cards, surfaces" },
      text: { name: "Black", hex: "#171717", usage: "Primary text" },
      textMuted: { name: "Gray", hex: "#737373", usage: "Secondary text" },
      border: { name: "Light Border", hex: "#E5E5E5", usage: "Borders" }
    },
    typography: {
      heading: { family: "Helvetica Neue", weights: [400, 500, 700], usage: "heading", fallback: "Arial, sans-serif" },
      body: { family: "Helvetica Neue", weights: [400, 500], usage: "body", fallback: "Arial, sans-serif" },
      mono: { family: "SF Mono", weights: [400, 500], usage: "mono", fallback: "Monaco, monospace" }
    },
    spacing: { unit: 4, scale: [0, 1, 2, 4, 6, 8, 12, 16, 24, 32, 48] },
    radii: { sm: "0px", md: "0px", lg: "0px", xl: "0px", full: "0px" },
    shadows: {
      sm: "none",
      md: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      lg: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      xl: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
    }
  },
  classic: {
    name: "Heritage",
    description: "Timeless classic design with traditional colors and elegant serif typography.",
    mood: ["classic", "traditional", "trustworthy", "established", "prestigious"],
    colors: {
      primary: { name: "Navy", hex: "#1E3A5F", usage: "Primary brand, trust" },
      secondary: { name: "Burgundy", hex: "#722F37", usage: "Accents, depth" },
      accent: { name: "Gold", hex: "#C9A227", usage: "Premium highlights" },
      background: { name: "Ivory", hex: "#FFFBF0", usage: "Background" },
      surface: { name: "White", hex: "#FFFFFF", usage: "Surfaces" },
      text: { name: "Charcoal", hex: "#2D3748", usage: "Primary text" },
      textMuted: { name: "Stone", hex: "#718096", usage: "Secondary text" },
      border: { name: "Parchment", hex: "#E2E0D5", usage: "Borders" }
    },
    typography: {
      heading: { family: "Crimson Text", weights: [400, 600, 700], usage: "heading", fallback: "Georgia, serif" },
      body: { family: "Libre Baskerville", weights: [400, 700], usage: "body", fallback: "Georgia, serif" },
      accent: { family: "Crimson Text", weights: [600], usage: "accent", fallback: "Georgia, serif" }
    },
    spacing: { unit: 6, scale: [0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12] },
    radii: { sm: "2px", md: "4px", lg: "6px", xl: "8px", full: "9999px" },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 2px 4px -1px rgb(0 0 0 / 0.08)",
      lg: "0 4px 8px -2px rgb(0 0 0 / 0.1)",
      xl: "0 8px 16px -4px rgb(0 0 0 / 0.1)"
    }
  }
};

// Generate a brand using the mock agent
export async function generateBrand(request: BrandGenerationRequest): Promise<GeneratedBrand> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
  
  // In production, this would call the an-sdk API:
  // const response = await an.agent.generate({
  //   prompt: buildPrompt(request),
  //   output: Output.object({ schema: brandOutputSchema })
  // });
  
  const style = request.style || 'modern';
  const baseBrand = mockBrandResponses[style] || mockBrandResponses.modern;
  
  // Customize based on prompt and baseColor
  const brand: GeneratedBrand = {
    ...baseBrand,
    name: customizeName(baseBrand.name, request.prompt),
    description: customizeDescription(baseBrand.description, request.prompt, request.industry),
  };
  
  // Apply baseColor if provided (adjust primary color)
  if (request.baseColor) {
    brand.colors.primary = {
      ...brand.colors.primary,
      hex: request.baseColor.toUpperCase(),
      name: `Custom Primary (${request.baseColor})`
    };
  }
  
  return brand;
}

// Generate multiple brand variations
export async function generateBrandVariations(request: BrandGenerationRequest, count: number = 3): Promise<GeneratedBrand[]> {
  const styles: Array<'modern' | 'bold' | 'elegant' | 'playful' | 'minimal' | 'classic'> = 
    ['modern', 'bold', 'elegant', 'playful', 'minimal', 'classic'];
  
  const selectedStyles = styles.slice(0, count);
  
  const promises = selectedStyles.map(style => 
    generateBrand({ ...request, style })
  );
  
  return Promise.all(promises);
}

// Helper functions
function customizeName(baseName: string, prompt: string): string {
  if (!prompt) return baseName;
  // Simple customization logic - in production this would use AI
  const words = prompt.toLowerCase().split(' ').slice(0, 2);
  if (words.length > 0 && words[0].length > 3) {
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' ' + baseName.split(' ').pop();
  }
  return baseName;
}

function customizeDescription(baseDesc: string, prompt: string, industry?: string): string {
  if (!prompt && !industry) return baseDesc;
  const context = industry ? `for ${industry}` : '';
  return `${baseDesc} Tailored to ${prompt || 'your requirements'} ${context}.`.trim();
}

// Export schema for reference
export { brandOutputSchema };
