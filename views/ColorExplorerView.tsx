import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight, Sparkles, Palette, Type, Layout, Loader2, Check, Copy, Download, Wand2, Bot, Lightbulb } from 'lucide-react';
import { GeneratedBrand, BrandGenerationRequest } from '../types/brand';
import { generateBrand, generateBrandVariations } from '../services/brandAgent';

// --- 21st.dev Style Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  icon: Icon
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: React.ComponentType<{ size?: number }>;
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent/90 shadow-sm hover:shadow-md active:scale-[0.98]',
    secondary: 'bg-surface text-primary border border-border hover:bg-accent/5 hover:border-accent/30 active:scale-[0.98]',
    ghost: 'bg-transparent text-secondary hover:text-primary hover:bg-surface',
    outline: 'bg-transparent text-primary border border-border hover:bg-surface hover:border-accent/30'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  );
};

const Card = ({ 
  children, 
  className = '',
  hover = false,
  padding = 'normal',
  onClick,
  style
}: { 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'normal' | 'large';
  onClick?: () => void;
  style?: React.CSSProperties;
}) => {
  const paddings = {
    none: '',
    normal: 'p-5',
    large: 'p-8'
  };
  
  return (
    <div 
      onClick={onClick}
      style={style}
      className={`bg-background border border-border rounded-xl transition-all duration-200 ${paddings[padding]} ${hover ? 'hover:border-accent/30 hover:shadow-sm cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

const Input = ({
  value,
  onChange,
  placeholder,
  label,
  type = 'text',
  className = ''
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  type?: 'text' | 'textarea';
  className?: string;
}) => {
  const inputStyles = 'w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 transition-all';
  
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-secondary">{label}</label>
      )}
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputStyles} min-h-[80px] resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputStyles}
        />
      )}
    </div>
  );
};

const ColorInput = ({
  value,
  onChange,
  label
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-secondary">{label}</label>}
      <div className="flex border border-border rounded-lg overflow-hidden h-11 focus-within:ring-2 focus-within:ring-accent/30 transition-all bg-surface">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-full cursor-pointer border-r border-border p-0 bg-surface"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="flex-1 px-3 font-mono text-sm uppercase bg-surface outline-none text-primary font-medium"
        />
      </div>
    </div>
  );
};

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'accent' | 'outline' }) => {
  const variants = {
    default: 'bg-surface text-secondary border-border',
    accent: 'bg-accent/10 text-accent border-accent/20',
    outline: 'bg-transparent text-secondary border-border'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
};

// --- Google Fonts Loading ---

const loadGoogleFont = (family: string, weights: number[]) => {
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, '+')}:wght@${weights.join(';')}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

const STYLE_OPTIONS = [
  { id: 'modern', label: 'Modern', description: 'Clean, contemporary' },
  { id: 'bold', label: 'Bold', description: 'High contrast' },
  { id: 'elegant', label: 'Elegant', description: 'Sophisticated' },
  { id: 'playful', label: 'Playful', description: 'Fun, energetic' },
  { id: 'minimal', label: 'Minimal', description: 'Ultra-clean' },
  { id: 'classic', label: 'Classic', description: 'Timeless' },
] as const;

export default function ColorExplorerView() {
  // --- ORIGINAL COLOR EXPLORER STATE ---
  const [baseColor, setBaseColor] = useState('#FF552E');
  const [palette, setPalette] = useState({
    primary: '#FF552E',
    secondary: '#3B82F6',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    text: '#09090B',
    textMuted: '#71717A',
    accent: '#F59E0B',
    border: '#E4E4E7',
  });
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // --- AI BRAND AGENT STATE ---
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
  const [industry, setIndustry] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBrands, setGeneratedBrands] = useState<GeneratedBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<GeneratedBrand | null>(null);
  const [agentTab, setAgentTab] = useState<'colors' | 'typography' | 'preview'>('colors');

  // Load fonts when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      const fonts = [selectedBrand.typography.heading, selectedBrand.typography.body];
      if (selectedBrand.typography.accent) fonts.push(selectedBrand.typography.accent);
      if (selectedBrand.typography.mono) fonts.push(selectedBrand.typography.mono);
      
      fonts.forEach(font => {
        if (!font.family.includes('Helvetica') && !font.family.includes('SF Mono') && !font.family.includes('Arial')) {
          loadGoogleFont(font.family, font.weights);
        }
      });
    }
  }, [selectedBrand]);

  // --- ORIGINAL COLOR EXPLORER FUNCTIONS ---
  const generateRandomPalette = () => {
    const randomHex = () =>
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase();
    
    const primary = randomHex();
    const secondary = randomHex();
    
    setPalette({
      primary,
      secondary,
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#09090B',
      textMuted: '#71717A',
      accent: randomHex(),
      border: '#E4E4E7',
    });
    setBaseColor(primary);
  };

  const handleBaseColorChange = (newColor: string) => {
    setBaseColor(newColor);
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      setPalette(p => ({ ...p, primary: newColor.toUpperCase() }));
    }
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  // --- AI AGENT FUNCTIONS ---
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const request: BrandGenerationRequest = {
        prompt: prompt,
        style: selectedStyle as any,
        industry: industry || undefined
      };
      
      const brands = await generateBrandVariations(request, 3);
      setGeneratedBrands(brands);
      setSelectedBrand(brands[0]);
    } catch (error) {
      console.error('Failed to generate brand:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportBrand = () => {
    if (!selectedBrand) return;
    const dataStr = JSON.stringify(selectedBrand, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedBrand.name.toLowerCase().replace(/\s+/g, '-')}-brand.json`;
    link.click();
  };

  return (
    <div className="w-full h-full overflow-auto relative animate-fade-in">
      <div className="absolute inset-0 grid-bg pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-10">
        
        {/* --- HEADER --- */}
        <div className="mb-10">
          <span className="font-mono text-[10px] text-accent font-bold tracking-widest uppercase">Tool</span>
          <h2 className="font-serif text-4xl text-primary mt-1 transition-colors duration-300">
            Color Explorer & Brand Studio
          </h2>
          <p className="text-sm text-secondary mt-2 max-w-2xl">
            Explore colors manually or let AI generate complete brand systems with structured design tokens.
          </p>
        </div>

        {/* --- SECTION 1: ORIGINAL COLOR EXPLORER --- */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="text-accent" size={20} />
            <h3 className="font-serif text-xl text-primary">Color Palette Explorer</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Controls */}
            <div className="space-y-4">
              <Card>
                <div className="space-y-4">
                  <ColorInput
                    label="Base Color"
                    value={baseColor}
                    onChange={handleBaseColorChange}
                  />
                  
                  <Button 
                    onClick={generateRandomPalette}
                    variant="secondary"
                    className="w-full"
                    icon={RefreshCw}
                  >
                    Randomize Palette
                  </Button>
                </div>
              </Card>

              {/* Palette Swatches */}
              <Card padding="normal">
                <h4 className="text-xs font-medium text-secondary mb-4 uppercase tracking-wider">Current Palette</h4>
                <div className="space-y-2">
                  {Object.entries(palette).map(([name, hex]) => (
                    <div
                      key={name}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface cursor-pointer group transition-colors"
                      onClick={() => copyColor(hex)}
                    >
                      <div
                        className="w-10 h-10 rounded-lg border border-border/50 flex-shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-primary capitalize flex items-center gap-2">
                          {name}
                          {copiedColor === hex && <Check size={12} className="text-green-500" />}
                        </div>
                        <div className="font-mono text-xs text-secondary">{hex}</div>
                      </div>
                      <Copy size={14} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: Live Preview */}
            <div className="lg:col-span-2">
              <Card padding="large" className="h-full" style={{ backgroundColor: palette.background, color: palette.text }}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                      Live Preview
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {['Features', 'Pricing', 'About'].map((item) => (
                      <span
                        key={item}
                        className="text-sm cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ color: palette.textMuted }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="max-w-xl">
                  <h1
                    className="text-5xl font-serif leading-tight mb-4"
                    style={{ color: palette.primary }}
                  >
                    The Authenticity{' '}
                    <span style={{ color: palette.secondary }}>Premium.</span>
                  </h1>
                  
                  <p 
                    className="text-base leading-relaxed mb-6"
                    style={{ color: palette.textMuted }}
                  >
                    High contrast is essential for readability and accessibility. Test your palette against real
                    content to ensure it works at every scale.
                  </p>

                  <div className="flex gap-3">
                    <button
                      className="px-5 py-2.5 rounded-lg font-medium text-sm transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                      style={{
                        backgroundColor: palette.accent,
                        color: palette.text,
                      }}
                    >
                      Explore Now
                      <ArrowRight size={16} />
                    </button>
                    <button
                      className="px-5 py-2.5 rounded-lg font-medium text-sm transition-transform hover:-translate-y-0.5"
                      style={{
                        backgroundColor: palette.surface,
                        color: palette.text,
                        border: `1px solid ${palette.border}`,
                      }}
                    >
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-3 gap-4 mt-12">
                  {[
                    { title: 'Design', desc: 'Craft with care' },
                    { title: 'Develop', desc: 'Build with speed' },
                    { title: 'Deploy', desc: 'Ship with confidence' },
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg"
                      style={{ 
                        backgroundColor: palette.surface,
                        border: `1px solid ${palette.border}`
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg mb-3"
                        style={{ backgroundColor: i === 0 ? palette.primary : i === 1 ? palette.secondary : palette.accent }}
                      />
                      <h3 className="font-semibold text-sm mb-1" style={{ color: palette.text }}>
                        {feature.title}
                      </h3>
                      <p className="text-xs" style={{ color: palette.textMuted }}>
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-border my-12"></div>

        {/* --- SECTION 2: AI BRAND AGENT --- */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Bot className="text-accent" size={20} />
            <h3 className="font-serif text-xl text-primary">AI Brand Generator</h3>
            <Badge variant="accent">Powered by an-sdk</Badge>
          </div>

          {/* AI Generation Panel */}
          <Card className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prompt Input */}
              <div>
                <Input
                  label="Describe your brand vision"
                  type="textarea"
                  value={prompt}
                  onChange={setPrompt}
                  placeholder="e.g., A tech startup for sustainable energy, modern and trustworthy..."
                />
              </div>
              
              {/* Style & Industry */}
              <div className="space-y-4">
                <Input
                  label="Industry (optional)"
                  value={industry}
                  onChange={setIndustry}
                  placeholder="e.g., Healthcare, Finance, E-commerce..."
                />
                
                <div>
                  <label className="text-xs font-medium text-secondary block mb-2">Style Direction</label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          selectedStyle === style.id
                            ? 'bg-accent text-white border-accent'
                            : 'bg-surface text-secondary border-border hover:border-accent/30 hover:text-primary'
                        }`}
                        title={style.description}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                size="lg"
                className="w-full sm:w-auto"
                icon={isGenerating ? Loader2 : Sparkles}
              >
                {isGenerating ? 'Generating Brand System...' : 'Generate Brand with AI'}
              </Button>
            </div>
          </Card>

          {/* Generated Brands Grid */}
          {generatedBrands.length > 0 && (
            <div className="mb-8">
              <h4 className="text-xs font-medium text-secondary mb-4 uppercase tracking-wider">
                Generated Brand Systems
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedBrands.map((brand, index) => (
                  <Card
                    key={index}
                    hover
                    onClick={() => setSelectedBrand(brand)}
                    className={`${selectedBrand?.name === brand.name ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}`}
                    style={{ backgroundColor: brand.colors.background.hex }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 
                          className="font-semibold text-base mb-1"
                          style={{ color: brand.colors.text.hex, fontFamily: brand.typography.heading.family }}
                        >
                          {brand.name}
                        </h4>
                        <p className="text-xs opacity-70" style={{ color: brand.colors.textMuted.hex }}>
                          {brand.mood.slice(0, 3).join(' · ')}
                        </p>
                      </div>
                      <div 
                        className="w-8 h-8 rounded-full border-2"
                        style={{ backgroundColor: brand.colors.primary.hex, borderColor: brand.colors.border.hex }}
                      />
                    </div>
                    <div className="flex gap-1.5">
                      {[brand.colors.primary, brand.colors.secondary, brand.colors.accent, brand.colors.background].map((color, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-md border"
                          style={{ backgroundColor: color.hex, borderColor: brand.colors.border.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Selected Brand Preview */}
          {selectedBrand && (
            <div className="space-y-6">
              {/* Brand Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 
                    className="text-2xl font-semibold mb-1"
                    style={{ fontFamily: selectedBrand.typography.heading.family }}
                  >
                    {selectedBrand.name}
                  </h4>
                  <p className="text-sm text-secondary">{selectedBrand.description}</p>
                </div>
                <Button onClick={exportBrand} variant="secondary" icon={Download}>
                  Export JSON
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-surface rounded-lg w-fit border border-border">
                {[
                  { id: 'colors', icon: Palette, label: 'Colors' },
                  { id: 'typography', icon: Type, label: 'Typography' },
                  { id: 'preview', icon: Layout, label: 'Preview' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAgentTab(tab.id as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                      agentTab === tab.id
                        ? 'bg-background text-primary shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Tokens */}
                <div className="lg:col-span-1 space-y-4">
                  {agentTab === 'colors' && (
                    <Card>
                      <h4 className="text-xs font-medium text-secondary mb-4 uppercase tracking-wider">
                        Color Tokens
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(selectedBrand.colors).map(([key, color]) => (
                          <div
                            key={key}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface cursor-pointer group transition-colors"
                            onClick={() => copyColor(color.hex)}
                          >
                            <div
                              className="w-10 h-10 rounded-lg border border-border/50 flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-primary capitalize flex items-center gap-2">
                                {key}
                                {copiedColor === color.hex && <Check size={12} className="text-green-500" />}
                              </div>
                              <div className="font-mono text-xs text-secondary">{color.hex}</div>
                            </div>
                            <Copy size={14} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {agentTab === 'typography' && (
                    <Card className="space-y-4">
                      <h4 className="text-xs font-medium text-secondary uppercase tracking-wider">
                        Typography
                      </h4>
                      
                      <div className="p-3 bg-surface rounded-lg">
                        <div className="text-xs text-secondary mb-1">Heading</div>
                        <div 
                          className="text-lg font-semibold text-primary"
                          style={{ fontFamily: selectedBrand.typography.heading.family }}
                        >
                          {selectedBrand.typography.heading.family}
                        </div>
                        <div className="text-xs text-secondary mt-1">
                          Weights: {selectedBrand.typography.heading.weights.join(', ')}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-surface rounded-lg">
                        <div className="text-xs text-secondary mb-1">Body</div>
                        <div 
                          className="text-base text-primary"
                          style={{ fontFamily: selectedBrand.typography.body.family }}
                        >
                          {selectedBrand.typography.body.family}
                        </div>
                        <div className="text-xs text-secondary mt-1">
                          Weights: {selectedBrand.typography.body.weights.join(', ')}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <h5 className="text-xs font-medium text-secondary mb-3 uppercase tracking-wider">
                          Design Tokens
                        </h5>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-secondary">Border Radius (md)</span>
                            <span className="font-mono text-primary">{selectedBrand.radii.md}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary">Base Spacing</span>
                            <span className="font-mono text-primary">{selectedBrand.spacing.unit}px</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {agentTab === 'preview' && (
                    <Card>
                      <h4 className="text-xs font-medium text-secondary mb-4 uppercase tracking-wider">
                        Mood & Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedBrand.mood.map((mood, i) => (
                          <Badge key={i} variant="outline">{mood}</Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Right Panel - Live Preview */}
                <div className="lg:col-span-2">
                  <Card 
                    padding="large" 
                    className="h-full"
                    style={{ 
                      backgroundColor: selectedBrand.colors.background.hex,
                      borderColor: selectedBrand.colors.border.hex
                    }}
                  >
                    {/* Mock Landing Page */}
                    <nav className="flex items-center justify-between mb-10">
                      <div 
                        className="text-xl font-bold"
                        style={{ 
                          color: selectedBrand.colors.text.hex,
                          fontFamily: selectedBrand.typography.heading.family
                        }}
                      >
                        {selectedBrand.name.split(' ')[0]}
                      </div>
                      <div className="flex gap-6">
                        {['Features', 'Pricing', 'About'].map((item) => (
                          <span
                            key={item}
                            className="text-sm cursor-pointer hover:opacity-70 transition-opacity"
                            style={{ color: selectedBrand.colors.textMuted.hex }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                      <button
                        className="px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5"
                        style={{ 
                          backgroundColor: selectedBrand.colors.primary.hex,
                          color: '#FFFFFF',
                          borderRadius: selectedBrand.radii.md
                        }}
                      >
                        Get Started
                      </button>
                    </nav>

                    <div className="max-w-xl">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-6"
                        style={{ 
                          backgroundColor: selectedBrand.colors.accent.hex,
                          color: selectedBrand.colors.text.hex
                        }}
                      >
                        <span 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: selectedBrand.colors.text.hex }}
                        ></span>
                        New Release
                      </div>
                      
                      <h1
                        className="text-5xl font-bold leading-tight mb-6"
                        style={{ 
                          color: selectedBrand.colors.text.hex,
                          fontFamily: selectedBrand.typography.heading.family
                        }}
                      >
                        Build something{' '}
                        <span style={{ color: selectedBrand.colors.primary.hex }}>amazing.</span>
                      </h1>
                      
                      <p
                        className="text-lg leading-relaxed mb-8"
                        style={{ 
                          color: selectedBrand.colors.textMuted.hex,
                          fontFamily: selectedBrand.typography.body.family
                        }}
                      >
                        Create stunning digital experiences with our comprehensive design system. 
                        Beautiful colors, typography, and components that work together perfectly.
                      </p>

                      <div className="flex gap-4">
                        <button
                          className="px-6 py-3 font-medium transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                          style={{ 
                            backgroundColor: selectedBrand.colors.primary.hex,
                            color: '#FFFFFF',
                            borderRadius: selectedBrand.radii.md,
                            fontFamily: selectedBrand.typography.body.family
                          }}
                        >
                          Start Building
                          <ArrowRight size={18} />
                        </button>
                        <button
                          className="px-6 py-3 font-medium transition-transform hover:-translate-y-0.5"
                          style={{ 
                            backgroundColor: selectedBrand.colors.surface.hex,
                            color: selectedBrand.colors.text.hex,
                            border: `1px solid ${selectedBrand.colors.border.hex}`,
                            borderRadius: selectedBrand.radii.md,
                            fontFamily: selectedBrand.typography.body.family
                          }}
                        >
                          Learn More
                        </button>
                      </div>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-3 gap-4 mt-12">
                      {[
                        { title: 'Fast', desc: 'Lightning quick' },
                        { title: 'Secure', desc: 'Enterprise grade' },
                        { title: 'Scalable', desc: 'Grow with you' },
                      ].map((feature, i) => (
                        <div
                          key={i}
                          className="p-4 transition-transform hover:-translate-y-1"
                          style={{ 
                            backgroundColor: selectedBrand.colors.surface.hex,
                            border: `1px solid ${selectedBrand.colors.border.hex}`,
                            borderRadius: selectedBrand.radii.lg,
                            boxShadow: selectedBrand.shadows.sm
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg mb-3"
                            style={{ backgroundColor: selectedBrand.colors.secondary.hex }}
                          />
                          <h3
                            className="font-semibold mb-1"
                            style={{ 
                              color: selectedBrand.colors.text.hex,
                              fontFamily: selectedBrand.typography.heading.family
                            }}
                          >
                            {feature.title}
                          </h3>
                          <p
                            className="text-sm"
                            style={{ color: selectedBrand.colors.textMuted.hex }}
                          >
                            {feature.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
