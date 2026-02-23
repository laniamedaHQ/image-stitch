import React, { useState } from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';

export default function ColorExplorerView() {
  const [baseColor, setBaseColor] = useState('#FF552E');
  const [palette, setPalette] = useState({
    primary: '#FF552E',
    secondary: '#3B82F6',
    background: '#FFFFFF',
    text: '#09090B',
    accent: '#F59E0B',
  });

  const generatePalette = () => {
    const randomHex = () =>
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase();
    setPalette({
      primary: randomHex(),
      secondary: randomHex(),
      background: '#FFFFFF',
      text: '#09090B',
      accent: randomHex(),
    });
  };

  return (
    <div className="w-full h-full overflow-auto relative animate-fade-in">
      <div className="absolute inset-0 grid-bg pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto p-8 md:p-16">
        {/* Header */}
        <div className="mb-10">
          <span className="font-mono text-[10px] text-accent font-bold tracking-widest uppercase">Tool</span>
          <h2 className="font-serif text-4xl text-primary mt-1 transition-colors duration-300">
            Color Explorer
          </h2>
          <p className="text-sm text-secondary mt-2 max-w-lg">
            Generate palettes, input a base hex, or randomize to discover new combinations.
          </p>
        </div>

        {/* Base Color Input */}
        <div className="bg-background border border-border rounded-xl p-6 mb-8 transition-colors duration-300">
          <div className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-2 flex-1 min-w-[250px]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary">Base Hex</span>
              <div className="flex border border-border rounded-lg overflow-hidden h-12 focus-within:ring-2 focus-within:ring-accent/30 transition-all bg-surface">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => {
                    setBaseColor(e.target.value);
                    setPalette((p) => ({ ...p, primary: e.target.value.toUpperCase() }));
                  }}
                  className="w-14 h-full cursor-pointer border-r border-border p-0 bg-surface"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => {
                    setBaseColor(e.target.value);
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                      setPalette((p) => ({ ...p, primary: e.target.value.toUpperCase() }));
                    }
                  }}
                  className="flex-1 px-4 font-mono text-sm uppercase bg-surface outline-none text-primary font-medium"
                />
              </div>
            </label>
            <button
              onClick={generatePalette}
              className="px-6 h-12 bg-inverse text-inverseText rounded-xl hover:bg-accent hover:text-white transition-colors flex items-center gap-2 font-medium text-sm"
            >
              <RefreshCw size={16} />
              Randomize
            </button>
          </div>
        </div>

        {/* Palette Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Swatches */}
          <div className="bg-background border border-border rounded-xl p-6 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-mono text-[10px] text-accent font-bold tracking-widest uppercase">Palette</span>
            </div>
            <div className="flex flex-col gap-3">
              {Object.entries(palette).map(([name, hex]) => (
                <div
                  key={name}
                  className="flex items-center gap-4 p-3 bg-surface border border-border rounded-lg hover:-translate-y-0.5 transition-transform"
                >
                  <div
                    className="w-12 h-12 rounded-lg border border-border flex-shrink-0"
                    style={{ backgroundColor: hex }}
                  ></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-primary capitalize">{name}</div>
                    <div className="font-mono text-xs text-secondary">{hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div
            className="border border-border rounded-xl p-6 flex flex-col justify-between min-h-[400px]"
            style={{ backgroundColor: palette.background, color: palette.text }}
          >
            <div>
              <div
                className="inline-flex items-center gap-2 border px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase mb-6"
                style={{ borderColor: palette.text + '30', backgroundColor: palette.accent, color: palette.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.text }}></span>
                Live Preview
              </div>
              <h3
                className="text-4xl font-serif leading-tight mb-4"
                style={{ color: palette.primary }}
              >
                The Authenticity{' '}
                <span style={{ color: palette.secondary }}>Premium.</span>
              </h3>
              <p className="text-base leading-relaxed mb-6" style={{ color: palette.text + 'CC' }}>
                High contrast is essential for readability and accessibility. Test your palette against real
                content to ensure it works at every scale.
              </p>
            </div>
            <button
              className="w-full py-3 rounded-xl font-medium text-base border transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{
                backgroundColor: palette.accent,
                color: palette.text,
                borderColor: palette.text + '20',
              }}
            >
              Explore Now
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
