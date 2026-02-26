import React, { useEffect, useRef, useState } from 'react';
import {
  Layers, Lock, Palette, LayoutGrid, BoxSelect,
  ArrowRight, Crop, Image, FolderOpen, ExternalLink,
  Check, X, Star, Upload, Download, Scissors, Zap,
  ChevronDown, AlertTriangle, Hexagon, Moon, Settings2, Plus
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

/* ── Noise grain SVG overlay ── */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E")`;

/* ── Fade-in on scroll ── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '-30px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function FadeSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: 'translateY(24px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Animated canvas noise ── */
function NoiseCanvas({ alpha = 25, intensity = 0.3 }: { alpha?: number; intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sz = 100;
    const pCanvas = document.createElement('canvas');
    pCanvas.width = sz;
    pCanvas.height = sz;
    const pCtx = pCanvas.getContext('2d')!;
    const pData = pCtx.createImageData(sz, sz);
    const len = sz * sz * 4;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const p = canvas.parentElement;
      if (!p) return;
      const { width, height } = p.getBoundingClientRect();
      dimsRef.current = { w: width, h: height };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let frame = 0;
    let raf: number;
    const loop = () => {
      if (frame % 2 === 0) {
        const { w, h } = dimsRef.current;
        if (w > 0 && h > 0) {
          for (let i = 0; i < len; i += 4) {
            const v = Math.random() * 255 * intensity;
            pData.data[i] = v;
            pData.data[i + 1] = v;
            pData.data[i + 2] = v;
            pData.data[i + 3] = alpha;
          }
          pCtx.putImageData(pData, 0, 0);
          ctx.clearRect(0, 0, w, h);
          const pat = ctx.createPattern(pCanvas, 'repeat');
          if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h); }
        }
      }
      frame++;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('resize', resize);
    resize();
    loop();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, [alpha, intensity]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ── Hero gradient background with noise ── */
function HeroGradient({ opacity }: { opacity: number }) {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      style={{ opacity, transition: 'opacity 0.05s linear' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 100% at 50% 101%, rgba(255,85,46,0.55) 0%, rgba(200,50,20,0.25) 20%, rgba(60,20,10,0.12) 40%, rgba(9,9,11,0) 65%)`,
        }}
      />
      <NoiseCanvas alpha={20} intensity={0.25} />
    </div>
  );
}

/* ── Scroll-based fade for hero gradient ── */
function useScrollFade(ref: React.RefObject<HTMLElement | null>) {
  const [opacity, setOpacity] = useState(1);
  useEffect(() => {
    const handle = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = -rect.top;
      if (scrolled <= 0) setOpacity(1);
      else if (scrolled >= rect.height * 0.6) setOpacity(0);
      else setOpacity(1 - scrolled / (rect.height * 0.6));
    };
    window.addEventListener('scroll', handle, { passive: true });
    handle();
    return () => window.removeEventListener('scroll', handle);
  }, [ref]);
  return opacity;
}

/* ════════════════════════════════════════════════════════
   INTERACTIVE APP MOCKUP — 4 clickable views
   ════════════════════════════════════════════════════════ */

type MockupView = 'editor' | 'stitch' | 'smartStitch' | 'colors';

const MOCKUP_TABS: { id: MockupView; icon: typeof BoxSelect; label: string; header: string; title: string }[] = [
  { id: 'editor', icon: BoxSelect, label: 'Editor', header: '01 — EDITOR', title: 'The Workstation' },
  { id: 'stitch', icon: LayoutGrid, label: 'Stitch', header: '02 — STITCH', title: 'Midjourney Prep' },
  { id: 'smartStitch', icon: Layers, label: 'Smart', header: '03 — SMART STITCH', title: 'Auto Layout' },
  { id: 'colors', icon: Palette, label: 'Colors', header: '04 — COLORS', title: 'Palette Explorer' },
];

/* ── Editor view canvas ── */
function EditorCanvas() {
  return (
    <div className="relative h-full p-3">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundSize: '40px 40px',
        backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
      }} />
      <div className="relative flex gap-2 flex-wrap">
        {/* Image with crop */}
        <div className="relative w-[48%] aspect-[4/3] bg-gradient-to-br from-[#2a1f1a] to-[#1a1510] border border-[#333] overflow-hidden">
          <div className="absolute top-[15%] left-[10%] w-[60%] h-[50%] border-2 border-[#FF552E] bg-[#FF552E]/5">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#FF552E]" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF552E]" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#FF552E]" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#FF552E]" />
          </div>
          <div className="absolute bottom-1 left-1.5">
            <span className="font-mono text-[7px] text-[#888]">landscape_02.jpg</span>
          </div>
        </div>
        {/* Portrait with lock */}
        <div className="relative w-[30%] aspect-[3/4] bg-gradient-to-br from-[#1a2029] to-[#101520] border border-[#333] overflow-hidden">
          <div className="absolute top-[20%] left-[15%] w-[70%] h-[40%] border-2 border-[#FF552E]/60 bg-[#FF552E]/5">
            <Lock size={7} className="text-[#FF552E] absolute top-0.5 right-0.5" />
          </div>
          <div className="absolute bottom-1 left-1.5">
            <span className="font-mono text-[7px] text-[#888]">portrait_01.jpg</span>
          </div>
        </div>
        {/* Wide image with multi-crop */}
        <div className="relative w-[75%] aspect-[16/6] bg-gradient-to-br from-[#1f1a2a] to-[#151020] border border-[#333] overflow-hidden">
          <div className="absolute top-[12%] left-[5%] w-[35%] h-[65%] border-2 border-[#FF552E] bg-[#FF552E]/5">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#FF552E]" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#FF552E]" />
          </div>
          <div className="absolute top-[18%] right-[8%] w-[28%] h-[55%] border border-[#FF552E]/40 border-dashed bg-[#FF552E]/3" />
        </div>
      </div>
    </div>
  );
}

/* ── Stitch view canvas (Midjourney prep) ── */
function StitchCanvas() {
  return (
    <div className="relative h-full p-3 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2">
          {/* Cropped pieces */}
          {[
            { w: 'w-16', h: 'h-20', from: '#2a1f1a', to: '#1a1510' },
            { w: 'w-14', h: 'h-20', from: '#1a2029', to: '#101520' },
            { w: 'w-20', h: 'h-20', from: '#1f1a2a', to: '#151020' },
            { w: 'w-12', h: 'h-20', from: '#2a2a1a', to: '#1a1a10' },
          ].map((p, i) => (
            <div key={i} className={`${p.w} ${p.h} border border-[#FF552E]/40 bg-gradient-to-br overflow-hidden relative`} style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}>
              <div className="absolute inset-0 border border-[#FF552E]/20" />
              <div className="absolute bottom-0.5 left-0.5 right-0.5">
                <div className="h-0.5 bg-[#FF552E]/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Arrow + output */}
      <div className="flex items-center justify-center gap-3 py-3 border-t border-[#1a1a1a]">
        <span className="font-mono text-[9px] text-[#888]">4 REGIONS</span>
        <ArrowRight size={12} className="text-[#FF552E]" />
        <div className="flex items-center gap-2 px-3 py-1.5 border border-[#FF552E]/30 bg-[#FF552E]/5">
          <div className="w-20 h-5 bg-gradient-to-r from-[#2a1f1a] via-[#1a2029] to-[#1f1a2a] border border-[#333]" />
          <span className="font-mono text-[8px] text-[#FF552E]">STITCHED</span>
        </div>
        <button className="font-mono text-[8px] text-[#09090b] bg-[#FF552E] px-2 py-1 uppercase tracking-wider">
          Download
        </button>
      </div>
    </div>
  );
}

/* ── Smart Stitch view canvas ── */
function SmartStitchCanvas() {
  return (
    <div className="relative h-full p-3 flex gap-3">
      {/* Justified grid */}
      <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
        {/* Row 1 */}
        <div className="flex gap-1.5 h-[35%]">
          <div className="flex-[3] bg-gradient-to-br from-[#2a1f1a] to-[#1a1510] border border-[#333]" />
          <div className="flex-[2] bg-gradient-to-br from-[#1a2029] to-[#101520] border border-[#333]" />
          <div className="flex-[2] bg-gradient-to-br from-[#2a2a1a] to-[#1a1a10] border border-[#333]" />
        </div>
        {/* Row 2 */}
        <div className="flex gap-1.5 h-[30%]">
          <div className="flex-[2] bg-gradient-to-br from-[#1f1a2a] to-[#151020] border border-[#333]" />
          <div className="flex-[4] bg-gradient-to-br from-[#2a1f1a] to-[#1d150f] border border-[#333]" />
        </div>
        {/* Row 3 */}
        <div className="flex gap-1.5 h-[30%]">
          <div className="flex-[2] bg-gradient-to-br from-[#1a2029] to-[#182030] border border-[#333]" />
          <div className="flex-[1] bg-gradient-to-br from-[#2a2a1a] to-[#252515] border border-[#333]" />
          <div className="flex-[3] bg-gradient-to-br from-[#251d35] to-[#15101e] border border-[#333]" />
        </div>
      </div>
      {/* Config panel */}
      <div className="hidden sm:flex flex-col w-28 border-l border-[#1a1a1a] pl-3 gap-3 pt-1">
        <div>
          <span className="font-mono text-[8px] text-[#888] tracking-wider block mb-1">WIDTH</span>
          <div className="h-1 bg-[#1a1a1a] relative"><div className="h-1 bg-[#FF552E]/60 w-[75%]" /></div>
          <span className="font-mono text-[8px] text-[#999] mt-0.5 block">1200px</span>
        </div>
        <div>
          <span className="font-mono text-[8px] text-[#888] tracking-wider block mb-1">ROW HEIGHT</span>
          <div className="h-1 bg-[#1a1a1a] relative"><div className="h-1 bg-[#FF552E]/60 w-[50%]" /></div>
          <span className="font-mono text-[8px] text-[#999] mt-0.5 block">300px</span>
        </div>
        <div>
          <span className="font-mono text-[8px] text-[#888] tracking-wider block mb-1">SPACING</span>
          <div className="h-1 bg-[#1a1a1a] relative"><div className="h-1 bg-[#FF552E]/60 w-[25%]" /></div>
          <span className="font-mono text-[8px] text-[#999] mt-0.5 block">12px</span>
        </div>
        <div className="mt-auto border-t border-[#1a1a1a] pt-2">
          <button className="font-mono text-[8px] text-[#09090b] bg-[#FF552E] px-2 py-1 uppercase tracking-wider w-full text-center">
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Colors view canvas ── */
function ColorsCanvas() {
  const swatches = [
    { hex: '#FF552E', name: 'Accent' },
    { hex: '#FF8A6C', name: 'Light' },
    { hex: '#CC4425', name: 'Dark' },
    { hex: '#FFF0EC', name: 'Dim' },
    { hex: '#1a1210', name: 'Deep' },
    { hex: '#FFB8A3', name: 'Pastel' },
  ];
  return (
    <div className="relative h-full p-3 flex gap-3">
      {/* Swatches grid */}
      <div className="flex-1">
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {swatches.map((s) => (
            <div key={s.hex} className="flex flex-col">
              <div className="h-10 border border-[#333]" style={{ backgroundColor: s.hex }} />
              <span className="font-mono text-[7px] text-[#999] mt-0.5">{s.hex}</span>
              <span className="font-mono text-[7px] text-[#888]">{s.name}</span>
            </div>
          ))}
        </div>
        {/* Preview card */}
        <div className="border border-[#333] p-3 bg-[#0e0e0e]">
          <div className="h-1 w-8 bg-[#FF552E] mb-2" />
          <div className="font-serif text-sm text-[#f4f4f5] mb-1" style={{ letterSpacing: '-0.02em' }}>Typography Preview</div>
          <div className="text-[9px] text-[#a1a1a1] leading-relaxed">
            Body text in your palette. Colors adapt across the entire workspace in real time.
          </div>
        </div>
      </div>
      {/* Picker */}
      <div className="hidden sm:flex flex-col w-24 border-l border-[#1a1a1a] pl-3 gap-2 pt-1">
        <span className="font-mono text-[8px] text-[#888] tracking-wider">BASE COLOR</span>
        <div className="w-full aspect-square border border-[#333] bg-[#FF552E]" />
        <span className="font-mono text-[9px] text-[#f4f4f5]">#FF552E</span>
        <button className="font-mono text-[8px] text-[#999] border border-[#333] px-2 py-1 mt-1 hover:text-[#f4f4f5] hover:border-[#555] transition-colors">
          Randomize
        </button>
      </div>
    </div>
  );
}

/* ── Right panel — mirrors App.tsx: w-80, LIBRARY header, serif Assets, System Status footer ── */
function MockupRightPanel({ view }: { view: MockupView }) {
  if (view === 'smartStitch' || view === 'colors') return null;
  return (
    <aside className="hidden lg:flex flex-col w-52 bg-[#0a0a0a] border-l border-[#262626] shadow-xl z-20">
      {/* Header — matches App.tsx: h-20, LIBRARY mono, serif Assets */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div>
          <span className="font-mono text-[8px] text-[#FF552E] tracking-widest uppercase block mb-0.5">LIBRARY</span>
          <span className="font-serif text-sm text-[#f4f4f5]">
            Assets <span className="font-sans text-[9px] text-[#666] font-normal">(4)</span>
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-6 h-6 rounded-full bg-[#131313] border border-[#2a2a2a] flex items-center justify-center">
            <Plus size={10} className="text-[#555]" />
          </div>
        </div>
      </div>

      {/* Library list */}
      <div className="flex-1 overflow-hidden py-1">
        {/* Group row — active, with accent border */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-[#1a1a1a]/50" style={{ background: 'rgba(255,85,46,0.06)', borderLeft: '2px solid #FF552E' }}>
          <FolderOpen size={10} className="text-[#FF552E] flex-shrink-0" />
          <span className="text-[#f4f4f5] text-[10px] truncate flex-1">Photo Set A</span>
          <span className="text-[8px] text-[#666] font-mono">3</span>
        </div>
        {/* Layer rows indented */}
        {[
          { name: 'landscape_02.jpg', dim: '2400×1600' },
          { name: 'portrait_01.jpg', dim: '1200×1600' },
        ].map((f) => (
          <div key={f.name} className="flex items-center gap-1.5 pl-5 pr-2 py-1.5 border-b border-[#1a1a1a]/40 text-[#666] hover:text-[#999] hover:bg-[#111] transition-all duration-200">
            <div className="w-5 h-5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm flex-shrink-0 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#2a1f1a] to-[#1a1510]" />
            </div>
            <span className="text-[9px] truncate flex-1">{f.name}</span>
            <span className="text-[7px] font-mono text-[#444] flex-shrink-0">{f.dim}</span>
          </div>
        ))}
        {/* Root asset */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-[#1a1a1a]/40 text-[#555]">
          <div className="w-5 h-5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm flex-shrink-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#1f1a2a] to-[#151020]" />
          </div>
          <span className="text-[9px] truncate">texture_pack.png</span>
        </div>
        {view === 'stitch' && (
          <>
            <div className="h-px bg-[#1a1a1a] mx-2 my-1.5" />
            <div className="px-2 py-1">
              <span className="font-mono text-[7px] text-[#555] tracking-wider uppercase">STITCH QUEUE</span>
              <div className="mt-1.5 flex gap-1">
                <div className="w-7 h-5 bg-[#161616] border border-[#2a2a2a]" />
                <div className="w-7 h-5 bg-[#161616] border border-[#2a2a2a]" />
                <div className="w-7 h-5 bg-[#1a0e0b] border border-[#FF552E]/30" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer — matches App.tsx: "System Status" + "Live Sync Active" */}
      <div className="px-3 py-3 bg-[#0d0d0d] border-t border-[#262626]">
        <span className="font-mono text-[7px] uppercase tracking-widest text-[#444] block mb-1.5">System Status</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 5px #10b981' }} />
          <span className="text-[9px] font-medium text-[#888]">Live Sync Active</span>
        </div>
      </div>
    </aside>
  );
}

/* ── Full interactive mockup — mirrors real App.tsx chrome ── */
function AppMockup() {
  const [view, setView] = useState<MockupView>('editor');
  const activeTab = MOCKUP_TABS.find(t => t.id === view)!;

  return (
    <div className="border border-[#262626] bg-[#0a0a0a] overflow-hidden w-full shadow-2xl transition-all duration-500 hover:border-[#333] hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#0d0d0d] border-b border-[#262626]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27C840]" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-0.5 text-[10px] font-mono text-[#666] max-w-[200px] mx-auto text-center rounded-sm">
            laniameda.app
          </div>
        </div>
      </div>

      {/* App layout — matches App.tsx: sidebar + main + right panel */}
      <div className="flex h-[330px] sm:h-[370px] md:h-[410px]">

        {/* ── LEFT SIDEBAR ── matches: w-[72px], py-8, items-center, gap-4 */}
        <aside className="flex flex-col items-center py-5 bg-[#0a0a0a] border-r border-[#262626] w-[44px] sm:w-[56px] z-10">
          {/* Hexagon logo — matches App.tsx: mb-12, text-accent, Hexagon fill-accent/10 */}
          <div className="mb-6 text-[#FF552E]">
            <Hexagon size={18} strokeWidth={2} style={{ fill: 'rgba(255,85,46,0.1)' }} />
          </div>

          {/* Nav buttons — matches NavButton: w-12 h-12 rounded-xl, active=bg-accentDim text-accent */}
          <nav className="flex flex-col gap-2 w-full items-center px-1.5">
            {MOCKUP_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = view === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  title={tab.label}
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-all duration-200 rounded-lg cursor-pointer ${
                    isActive
                      ? 'text-[#FF552E] bg-[#FF552E]/10'
                      : 'text-[#555] hover:text-[#aaa] hover:bg-[#161616]'
                  }`}
                >
                  <Icon size={13} strokeWidth={1.5} />
                </button>
              );
            })}
          </nav>

          {/* Bottom icons — matches App.tsx: Moon/Sun + Settings2, rounded-full */}
          <div className="mt-auto flex flex-col gap-2 items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[#3a3a3a]">
              <Moon size={11} strokeWidth={1.5} />
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[#3a3a3a]">
              <Settings2 size={11} strokeWidth={1.5} />
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ── matches App.tsx: flex-1, relative, grid-bg on editor/stitch */}
        <main className="flex-1 relative bg-[#0a0a0a] overflow-hidden flex flex-col">
          {/* Header — matches App.tsx: absolute top-0, px-10, h-20, mono label + serif title */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] text-[#FF552E] tracking-widest uppercase font-bold">{activeTab.header}</span>
                <div className="h-px w-4 bg-[#FF552E]" />
              </div>
              <span className="font-serif text-sm text-[#f4f4f5] mt-0.5" style={{ letterSpacing: '-0.02em' }}>
                {activeTab.title}
              </span>
            </div>
            {(view === 'editor' || view === 'stitch') && (
              <div className="bg-[#111111] border border-[#262626] px-2 py-1 flex items-center gap-2">
                <span className="font-mono text-[7px] text-[#555] tracking-wider">ACTIVE ASSET</span>
                <span className="w-px h-3 bg-[#2a2a2a]" />
                <span className="font-mono text-[7px] text-[#888]">SOURCE IMAGE</span>
              </div>
            )}
          </div>

          {/* Canvas area with grid-bg for editor/stitch views */}
          <div className="flex-1 relative overflow-hidden">
            {(view === 'editor' || view === 'stitch') && (
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundSize: '40px 40px',
                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
              }} />
            )}
            <div key={view} className="absolute inset-0" style={{ animation: 'fadeIn 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
              {view === 'editor' && <EditorCanvas />}
              {view === 'stitch' && <StitchCanvas />}
              {view === 'smartStitch' && <SmartStitchCanvas />}
              {view === 'colors' && <ColorsCanvas />}
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL (LIBRARY) ── */}
        <MockupRightPanel view={view} />
      </div>
    </div>
  );
}

/* ── Data ── */
const TOOLS = [
  {
    num: '01',
    icon: Crop,
    label: 'PRECISION EDITOR',
    color: '#FF552E',
    tagline: 'Surgical control over Midjourney edits.',
    pain: {
      headline: 'The drift problem',
      desc: 'You want to edit one region in Midjourney. But the model processes your entire image. Surrounding context \u2014 sky, background, other faces \u2014 bleeds into the result. Your edit drifts every time.',
    },
    solution: {
      headline: 'Isolate. Edit. Stitch back.',
      desc: 'Crop the exact region you want. Export it. Edit in isolation in Midjourney. Import the result \u2014 it snaps back into the locked position. Perfect alignment, every time.',
    },
    benefits: [
      'Pixel-precise crop regions',
      'Locked positions across editing rounds',
      'Zero alignment hassle on re-import',
    ],
    steps: ['Draw crop region', 'Export & edit in isolation', 'Auto-stitch back'],
  },
  {
    num: '02',
    icon: Layers,
    label: 'IMAGE STITCHING',
    color: '#06B6D4',
    tagline: 'Reference sheets in seconds, not minutes.',
    pain: {
      headline: 'The Figma tax',
      desc: 'You need to combine 4 images into a reference sheet. That means opening Figma, creating artboards, aligning everything, exporting. Every single time. For every project.',
    },
    solution: {
      headline: 'Drag. Auto-layout. Export.',
      desc: 'Drag images in. Smart Stitch auto-arranges them into a justified grid. Set width, spacing, row height. One-click PNG export \u2014 ready for any AI tool.',
    },
    benefits: [
      'Justified auto-layout engine',
      'Configurable grid dimensions & spacing',
      'Instant PNG export for any AI tool',
    ],
    steps: ['Drop images', 'Auto-arrange grid', 'Export PNG'],
  },
  {
    num: '03',
    icon: Palette,
    label: 'COLOR EXPLORER',
    color: '#8B5CF6',
    tagline: 'Palette brainstorming without leaving your flow.',
    pain: {
      headline: 'The context-switch tax',
      desc: 'Every AI project needs a color palette. You open Coolors, pick colors, screenshot, paste back. The constant tab-switching between tools murders your creative flow.',
    },
    solution: {
      headline: 'Colors live in your workspace.',
      desc: 'Generate full palettes from a base color right inside your workspace. Preview them in real typography and UI. Iterate instantly without switching a single tab.',
    },
    benefits: [
      'One-click palette generation',
      'Live typography & UI preview',
      'Stays inside your creative flow',
    ],
    steps: ['Pick base color', 'Generate palette', 'Preview in real UI'],
  },
];

/* ── Animated feature carousel for affiliate section ── */
const PROMPT_FEATURES = [
  { label: 'Save', desc: 'Send prompts, images, or references to a Telegram bot. It organizes everything automatically.' },
  { label: 'Browse', desc: 'Search your personal library. Find prompts that worked. Copy them in one click.' },
  { label: 'Remix', desc: 'Transfer styles between generations. Replace characters across variations. Reuse what works.' },
  { label: 'Share', desc: 'Keep your library private or share prompts with the creator community. Your rules.' },
];

function PromptFeatures() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive(prev => (prev + 1) % PROMPT_FEATURES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex border border-[#262626]">
        {PROMPT_FEATURES.map((f, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex-1 relative py-3.5 cursor-pointer overflow-hidden transition-all duration-300 ${
              i === active ? 'bg-[#0f0f0f]' : 'bg-[#09090b] hover:bg-[#0c0c0e]'
            }`}
          >
            <span className={`relative z-10 font-mono text-[10px] tracking-[0.15em] uppercase transition-all duration-300 ${
              i === active ? 'text-[#FF552E]' : 'text-[#888] group-hover:text-[#aaa]'
            }`}>
              {f.label}
            </span>
            {i === active && (
              <div
                key={`bar-${active}`}
                className="absolute bottom-0 left-0 h-[2px] bg-[#FF552E]"
                style={{ animation: 'fillWidth 4s linear forwards' }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="py-8 text-center min-h-[72px] flex items-center justify-center">
        <p key={active} className="text-[#a1a1a1] text-sm leading-relaxed max-w-md" style={{ animation: 'fadeIn 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
          {PROMPT_FEATURES[active].desc}
        </p>
      </div>
    </div>
  );
}

/* ── How It Works Section ── */
function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Import', desc: 'Drag your AI-generated images into the browser. No uploads, no servers \u2014 everything stays on your machine.', icon: Upload, color: '#FF552E' },
    { num: '02', title: 'Augment', desc: 'Crop regions, lock edit positions, auto-stitch reference sheets, explore palettes. One workspace for your entire AI pipeline.', icon: Scissors, color: '#F59E0B' },
    { num: '03', title: 'Export', desc: 'One-click PNG export. Paste directly back into Midjourney, DALL-E, Flux, or any diffusion model.', icon: Download, color: '#06B6D4' },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ borderBottom: '1px solid #262626' }}>
      {/* Decorative gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse, rgba(255,85,46,0.06) 0%, rgba(245,158,11,0.03) 40%, transparent 70%)',
        animation: 'float2 25s ease-in-out infinite',
      }} />

      <div className="relative max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
        <FadeSection>
          <div className="text-center mb-16 md:mb-20">
            <p className="font-mono text-xs tracking-[0.2em] uppercase mb-4" style={{
              background: 'linear-gradient(135deg, #FF552E, #F59E0B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Your AI Workflow, Augmented</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Import. Augment.{' '}
              <span style={{
                background: 'linear-gradient(135deg, #FF552E, #F59E0B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Export back to the model.</span>
            </h2>
          </div>
        </FadeSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num}>
                <FadeSection>
                  <div className="relative flex flex-col items-center text-center px-6 md:px-8">
                    {/* Gradient connector line */}
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-[calc(50%+48px)] w-[calc(100%-96px)] h-px" style={{
                        background: `linear-gradient(90deg, ${step.color}50, ${steps[i + 1].color}50)`,
                      }}>
                        <ArrowRight size={12} style={{ color: steps[i + 1].color }} className="absolute -right-1.5 -top-[6px]" />
                      </div>
                    )}

                    <div className="relative mb-6">
                      <div className="w-20 h-20 flex items-center justify-center icon-hover" style={{
                        background: `linear-gradient(135deg, ${step.color}15, ${step.color}05)`,
                        border: `1px solid ${step.color}30`,
                        boxShadow: `0 0 40px ${step.color}12`,
                      }}>
                        <Icon size={28} strokeWidth={1.5} style={{ color: step.color }} />
                      </div>
                      <span className="absolute -top-2 -right-3 font-mono text-[10px] text-white px-2 py-0.5 leading-none font-semibold" style={{
                        background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)`,
                        boxShadow: `0 0 14px ${step.color}40`,
                      }}>
                        {step.num}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl mb-3" style={{ letterSpacing: '-0.02em', color: step.color }}>{step.title}</h3>
                    <p className="text-sm text-[#a1a1a1] leading-relaxed max-w-[260px]">{step.desc}</p>
                  </div>
                </FadeSection>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Redesigned Features Section ── */
function FeaturesSection() {
  return (
    <section id="tools" className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[15%] right-0 w-[500px] h-[500px] pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)',
        animation: 'float1 22s ease-in-out infinite',
      }} />
      <div className="absolute bottom-[20%] left-0 w-[400px] h-[400px] pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 60%)',
        animation: 'float3 28s ease-in-out infinite',
      }} />

      <div className="relative max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
        <FadeSection>
          <p className="font-mono text-xs text-[#a1a1a1] tracking-[0.2em] uppercase mb-4">Purpose-Built for AI Creators</p>
          <h2
            className="font-serif text-3xl md:text-4xl lg:text-5xl mb-20 md:mb-28"
            style={{ letterSpacing: '-0.04em', lineHeight: 1.1 }}
          >
            The workflow gaps<br />
            <span style={{
              background: 'linear-gradient(135deg, #FF552E, #F59E0B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>your AI tools don&rsquo;t fill.</span>
          </h2>
        </FadeSection>

        <div className="space-y-20 lg:space-y-28">
          {TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            const c = tool.color;
            return (
              <div key={tool.label}>
                <FadeSection>
                <div className={idx > 0 ? 'pt-20 lg:pt-28' : ''}>
                  {/* Gradient separator */}
                  {idx > 0 && (
                    <div className="w-full h-px mb-20 lg:mb-28" style={{
                      background: `linear-gradient(90deg, ${c}40, ${c}10, transparent)`,
                    }} />
                  )}

                  {/* Feature header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[10px] text-white px-2 py-0.5 tracking-wider font-semibold" style={{
                      background: `linear-gradient(135deg, ${c}, ${c}BB)`,
                      boxShadow: `0 0 12px ${c}30`,
                    }}>{tool.num}</span>
                    <Icon size={16} strokeWidth={1.5} style={{ color: c }} />
                    <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: c }}>{tool.label}</span>
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl mb-10" style={{ letterSpacing: '-0.03em' }}>
                    {tool.tagline}
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Pain card */}
                    <div className="relative overflow-hidden p-6 md:p-8 card-hover-subtle group/pain" style={{
                      border: `1px solid ${c}20`,
                      background: `linear-gradient(135deg, ${c}08, transparent)`,
                    }}>
                      <div className="absolute top-0 left-0 w-1 h-full transition-all duration-500 group-hover/pain:w-1.5" style={{
                        background: `linear-gradient(180deg, ${c}80, ${c}20)`,
                      }} />
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={14} style={{ color: `${c}BB` }} />
                        <span className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: `${c}BB` }}>The Problem</span>
                      </div>
                      <h4 className="text-lg font-semibold text-[#f4f4f5] mb-3">{tool.pain.headline}</h4>
                      <p className="text-[#a1a1a1] text-sm leading-relaxed">{tool.pain.desc}</p>
                    </div>

                    {/* Solution + benefits + workflow */}
                    <div className="flex flex-col">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Zap size={14} style={{ color: c }} />
                          <span className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: c }}>The Fix</span>
                        </div>
                        <h4 className="text-lg font-semibold text-[#f4f4f5] mb-3">{tool.solution.headline}</h4>
                        <p className="text-[#a1a1a1] text-sm leading-relaxed">{tool.solution.desc}</p>
                      </div>

                      {/* Benefits */}
                      <div className="space-y-2.5 mb-8">
                        {tool.benefits.map((b, j) => (
                          <div key={j} className="flex items-center gap-2.5 group/benefit cursor-default"
                            style={{ transition: 'transform 0.2s ease' }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}
                          >
                            <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-all duration-300 group-hover/benefit:scale-110" style={{
                              border: `1px solid ${c}40`,
                              background: `${c}15`,
                            }}>
                              <Check size={10} strokeWidth={2.5} style={{ color: c }} />
                            </div>
                            <span className="text-sm text-[#f4f4f5] transition-colors duration-300 group-hover/benefit:text-white">{b}</span>
                          </div>
                        ))}
                      </div>

                      {/* Step flow */}
                      <div className="pt-6" style={{ borderTop: `1px solid ${c}15` }}>
                        <span className="font-mono text-[9px] tracking-[0.15em] uppercase block mb-4" style={{ color: `${c}88` }}>Workflow</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {tool.steps.map((step, j) => (
                            <React.Fragment key={j}>
                              <div className="flex items-center gap-2 px-3 py-2 card-hover-subtle cursor-default" style={{
                                background: `${c}08`,
                                border: `1px solid ${c}20`,
                              }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = `${c}15`; e.currentTarget.style.borderColor = `${c}40`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = `${c}08`; e.currentTarget.style.borderColor = `${c}20`; }}
                              >
                                <span className="font-mono text-[10px] font-semibold" style={{ color: c }}>{j + 1}</span>
                                <span className="text-xs text-[#a1a1a1]">{step}</span>
                              </div>
                              {j < tool.steps.length - 1 && (
                                <ArrowRight size={12} style={{ color: `${c}50` }} className="shrink-0 transition-transform duration-300" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeSection>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Before vs After Comparison ── */
function ComparisonSection() {
  const without = [
    'Tab-switch to Figma for every reference sheet',
    'Manually align AI outputs on artboards',
    'Screenshot color palettes between tools',
    'Feed entire image to Midjourney \u2014 watch it drift',
    'Re-export and re-align after every generation round',
  ];
  const withLaniameda = [
    'Drag AI outputs in, auto-stitch, export PNG',
    'Smart layout handles alignment instantly',
    'Generate palettes inline, preview in real UI',
    'Crop the exact region \u2014 edit in model isolation',
    'Auto-snap AI edit back into the original',
  ];

  return (
    <FadeSection>
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.3), rgba(16,185,129,0.3), transparent)',
        }} />
        {/* Decorative glow */}
        <div className="absolute top-0 right-[20%] w-[300px] h-[300px] pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
          animation: 'float2 20s ease-in-out infinite',
        }} />

        <div className="relative max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16">
            <p className="font-mono text-xs tracking-[0.2em] uppercase mb-4" style={{
              background: 'linear-gradient(135deg, #F43F5E, #FF552E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Your AI Workflow, Before &amp; After</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Stop duct-taping around your AI tools.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0">
            {/* Without */}
            <div className="border border-[#262626] md:border-r-0 bg-[#0a0a0a] p-8 md:p-10 comparison-hover hover:border-[#F43F5E]/20">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-6 h-6 border border-[#F43F5E]/20 bg-[#F43F5E]/10 flex items-center justify-center">
                  <X size={12} className="text-[#F43F5E]" />
                </div>
                <span className="font-mono text-[10px] text-[#F43F5E]/70 tracking-[0.15em] uppercase">Without Laniameda</span>
              </div>
              <ul className="space-y-4">
                {without.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 transition-all duration-200 hover:translate-x-1 cursor-default">
                    <div className="w-5 h-5 border border-[#F43F5E]/20 bg-[#F43F5E]/5 flex items-center justify-center shrink-0 mt-0.5">
                      <X size={10} strokeWidth={2} className="text-[#F43F5E]/50" />
                    </div>
                    <span className="text-sm text-[#666] leading-relaxed line-through decoration-[#333]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* With */}
            <div className="relative p-8 md:p-10 overflow-hidden comparison-hover" style={{
              border: '1px solid rgba(16,185,129,0.2)',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.04), rgba(6,182,212,0.02))',
            }}>
              {/* Corner glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 pointer-events-none" style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
              }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-6 h-6 flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
                    border: '1px solid rgba(16,185,129,0.3)',
                  }}>
                    <Zap size={12} className="text-emerald-400" />
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 tracking-[0.15em] uppercase">With Laniameda</span>
                </div>
                <ul className="space-y-4">
                  {withLaniameda.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 transition-all duration-200 hover:translate-x-1 cursor-default">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-300 hover:scale-110" style={{
                        border: '1px solid rgba(16,185,129,0.3)',
                        background: 'rgba(16,185,129,0.1)',
                      }}>
                        <Check size={10} strokeWidth={2.5} className="text-emerald-400" />
                      </div>
                      <span className="text-sm text-[#f4f4f5] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}

/* ── Testimonials Section ── */
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "I was tab-switching to Figma every time I needed a Midjourney reference sheet. Now I drag my generations in, auto-stitch, and paste back. 10 minutes down to 10 seconds.",
      name: 'Sarah K.',
      role: 'AI Artist \u2014 Midjourney & Flux',
      initials: 'SK',
      gradient: 'linear-gradient(135deg, #FF552E, #F59E0B)',
      glow: 'rgba(255,85,46,0.15)',
    },
    {
      quote: "The crop-and-stitch workflow is the missing piece. I isolate the exact region, send it to the model in isolation, import the result \u2014 zero drift. This is how AI editing should work.",
      name: 'Marcus T.',
      role: 'Creative Engineer \u2014 Diffusion Models',
      initials: 'MT',
      gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
      glow: 'rgba(6,182,212,0.15)',
    },
    {
      quote: "I generate 50+ images a day across DALL-E and Flux. Laniameda is the only tool that fits how I actually work \u2014 fast, local, no friction between me and the model.",
      name: 'Alex R.',
      role: 'Prompt Engineer & AI Content Creator',
      initials: 'AR',
      gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
      glow: 'rgba(139,92,246,0.15)',
    },
  ];

  return (
    <FadeSection>
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(255,85,46,0.3), transparent)',
        }} />
        {/* Decorative glow */}
        <div className="absolute bottom-0 left-[30%] w-[500px] h-[300px] pointer-events-none" style={{
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.04) 0%, transparent 70%)',
          animation: 'float1 24s ease-in-out infinite',
        }} />

        <div className="relative max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16">
            <p className="font-mono text-xs tracking-[0.2em] uppercase mb-4" style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>From AI Creators</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Built by creators,{' '}
              <span style={{
                background: 'linear-gradient(135deg, #FF552E, #F59E0B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>for creators.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="relative border border-[#262626] bg-[#0a0a0a] p-8 flex flex-col overflow-hidden group card-hover hover:border-[#333]">
                {/* Gradient top border accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-500 group-hover:h-[3px]" style={{ background: t.gradient }} />

                {/* Hover corner glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,
                }} />

                {/* Decorative quote mark */}
                <div className="absolute top-4 right-6 font-serif text-7xl leading-none pointer-events-none select-none transition-opacity duration-500 group-hover:opacity-[0.15]" style={{
                  background: t.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  opacity: 0.08,
                }}>&ldquo;</div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={12} fill="#F59E0B" strokeWidth={0} className="text-[#F59E0B] transition-transform duration-300" style={{ transitionDelay: `${j * 50}ms` }} />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-[#c4c4c4] leading-relaxed flex-1 mb-8 transition-colors duration-300 group-hover:text-[#d4d4d4]">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-6 border-t border-[#1a1a1a] transition-colors duration-300 group-hover:border-[#262626]">
                  <div className="w-10 h-10 flex items-center justify-center transition-all duration-300 group-hover:scale-105" style={{
                    background: t.gradient,
                    boxShadow: `0 0 20px ${t.glow}`,
                  }}>
                    <span className="font-mono text-[11px] text-white font-semibold">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f4f4f5]">{t.name}</p>
                    <p className="text-xs text-[#888] transition-colors duration-300 group-hover:text-[#999]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeSection>
  );
}

/* ── Built For — audience personas ── */
function BuiltForSection() {
  const personas = [
    {
      title: 'Midjourney Power Users',
      desc: 'You need surgical precision over inpainting and outpainting. Crop a region, edit in isolation, stitch back \u2014 zero drift.',
      color: '#FF552E',
      icon: Crop,
    },
    {
      title: 'AI Artists & Illustrators',
      desc: 'You generate dozens of variations and need to combine them into reference sheets, mood boards, and composite layouts \u2014 fast.',
      color: '#06B6D4',
      icon: Layers,
    },
    {
      title: 'Prompt Engineers',
      desc: 'You iterate across DALL-E, Flux, and Stable Diffusion. You need a workspace that keeps up with your generation speed.',
      color: '#8B5CF6',
      icon: Zap,
    },
    {
      title: 'Creative Engineers',
      desc: 'You ship AI-generated content into production. You need reliable image prep tooling that runs locally, no API keys, no servers.',
      color: '#F59E0B',
      icon: BoxSelect,
    },
  ];

  return (
    <FadeSection>
      <section className="relative py-24 md:py-32 overflow-hidden" style={{ borderBottom: '1px solid #262626' }}>
        <div className="relative max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16">
            <p className="font-mono text-xs tracking-[0.2em] uppercase mb-4" style={{
              background: 'linear-gradient(135deg, #FF552E, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Who This Is For</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              If you create with AI,{' '}
              <span style={{
                background: 'linear-gradient(135deg, #FF552E, #F59E0B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>this is your workspace.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {personas.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="relative p-6 md:p-8 border border-[#262626] bg-[#0a0a0a] group card-hover-subtle overflow-hidden cursor-default"
                  style={{ transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease, border-color 0.35s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${p.color}40`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#262626'; }}
                >
                  {/* Accent top line */}
                  <div className="absolute top-0 left-0 h-[2px] transition-all duration-500 ease-out group-hover:w-full" style={{ background: p.color, width: '48px' }} />
                  {/* Hover glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                    background: `radial-gradient(circle, ${p.color}10 0%, transparent 70%)`,
                  }} />
                  <div className="relative flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110" style={{
                      background: `${p.color}12`,
                      border: `1px solid ${p.color}25`,
                    }}>
                      <Icon size={18} strokeWidth={1.5} style={{ color: p.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#f4f4f5] mb-2 transition-colors duration-300 group-hover:text-white">{p.title}</h3>
                      <p className="text-sm text-[#888] leading-relaxed transition-colors duration-300 group-hover:text-[#a1a1a1]">{p.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </FadeSection>
  );
}

/* ── FAQ Section ── */
function FAQSection() {
  const faqs = [
    {
      q: "Is it really free? What's the catch?",
      a: "Completely free, no catch. Laniameda runs entirely in your browser with no servers, accounts, or data collection. We monetize through our companion product, laniameda.prompt.",
    },
    {
      q: 'Do my images get uploaded anywhere?',
      a: "Never. All image processing happens 100% client-side using the Canvas API. Your images never leave your browser. We literally cannot see them.",
    },
    {
      q: 'Does it work with tools other than Midjourney?',
      a: "Yes. The precision crop workflow was designed for Midjourney's diffusion behavior, but stitching and color tools work across your entire AI pipeline \u2014 DALL-E 3, Flux, Stable Diffusion, Leonardo AI, ComfyUI, or even non-AI use cases.",
    },
    {
      q: 'How does this fit into my existing AI workflow?',
      a: "Laniameda is a companion workspace, not a replacement. Keep using your favorite AI image generators. Laniameda slots in between \u2014 prep images before generation, process outputs after. Import, augment, export back to the model.",
    },
    {
      q: 'Can I use it on mobile?',
      a: "Laniameda is optimized for desktop browsers where you have screen real estate for image editing. Mobile support is on the roadmap.",
    },
  ];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <FadeSection>
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)',
        }} />

        <div className="relative max-w-[800px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16">
            <p className="font-mono text-xs tracking-[0.2em] uppercase mb-4" style={{
              background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>FAQ</p>
            <h2 className="font-serif text-3xl md:text-4xl" style={{ letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Common questions.
            </h2>
          </div>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="relative" style={{
                borderBottom: `1px solid ${open === i ? 'rgba(6,182,212,0.2)' : '#262626'}`,
                transition: 'border-color 0.2s',
              }}>
                {/* Active indicator */}
                {open === i && (
                  <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{
                    background: 'linear-gradient(180deg, #06B6D4, #3B82F6)',
                  }} />
                )}
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left cursor-pointer group/faq pl-4"
                >
                  <span className={`text-sm md:text-base font-medium pr-4 transition-colors duration-300 ${open === i ? 'text-[#06B6D4]' : 'text-[#f4f4f5] group-hover/faq:text-[#06B6D4]/70'}`}>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-all duration-400 ease-out ${open === i ? 'rotate-180' : 'text-[#888] group-hover/faq:text-[#06B6D4]/50'}`}
                    style={open === i ? { color: '#06B6D4' } : undefined}
                  />
                </button>
                <div
                  className="overflow-hidden accordion-content pl-4"
                  style={{
                    maxHeight: open === i ? '200px' : '0',
                    opacity: open === i ? 1 : 0,
                    paddingBottom: open === i ? '24px' : '0',
                  }}
                >
                  <p className="text-sm text-[#a1a1a1] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeSection>
  );
}

/* ════════════════════════════════════════════════════════
   LANDING PAGE
   ════════════════════════════════════════════════════════ */

export default function LandingPage({ onEnter }: LandingPageProps) {
  const heroRef = useRef<HTMLElement>(null);
  const gradientOpacity = useScrollFade(heroRef);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.classList.add('dark');
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#FF552E] selection:text-white"
      style={{ backgroundImage: NOISE_SVG, backgroundRepeat: 'repeat' }}
    >
      <style>{`
        @keyframes fillWidth { from { width: 0% } to { width: 100% } }
        @keyframes float1 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(40px, -30px) scale(1.05); } 66% { transform: translate(-25px, 20px) scale(0.95); } }
        @keyframes float2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-40px, 25px); } }
        @keyframes float3 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-50px) scale(1.03); } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes subtleBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

        /* Card hover lift */
        .card-hover {
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.35s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03);
        }

        /* Subtle card hover (for smaller elements) */
        .card-hover-subtle {
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease, background 0.3s ease;
        }
        .card-hover-subtle:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -8px rgba(0,0,0,0.3);
        }

        /* Button glow effect */
        .btn-glow {
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
          position: relative;
        }
        .btn-glow::after {
          content: '';
          position: absolute;
          inset: -1px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .btn-glow:hover::after {
          opacity: 1;
        }

        /* Tool name hover */
        .tool-name-hover {
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), filter 0.3s ease, letter-spacing 0.3s ease;
        }
        .tool-name-hover:hover {
          transform: scale(1.08);
          filter: brightness(1.3);
          letter-spacing: 0.05em;
        }

        /* Icon container hover */
        .icon-hover {
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease;
        }
        .icon-hover:hover {
          transform: scale(1.05);
        }

        /* Gradient border shimmer */
        .shimmer-border {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        /* Smooth accordion */
        .accordion-content {
          transition: max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease, padding 0.4s cubic-bezier(0.16,1,0.3,1);
        }

        /* Comparison card hover */
        .comparison-hover {
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease, border-color 0.35s ease;
        }
        .comparison-hover:hover {
          transform: translateY(-2px) scale(1.005);
        }
      `}</style>

      {/* ═══ ANIMATED BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
        <div className="absolute rounded-full" style={{ width: 700, height: 700, top: '-8%', left: '-5%', background: 'radial-gradient(circle, rgba(255,85,46,0.045) 0%, transparent 60%)', animation: 'float1 22s ease-in-out infinite', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full" style={{ width: 550, height: 550, top: '22%', right: '-6%', background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)', animation: 'float2 30s ease-in-out infinite', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full" style={{ width: 650, height: 650, top: '48%', left: '3%', background: 'radial-gradient(circle, rgba(139,92,246,0.035) 0%, transparent 60%)', animation: 'float3 26s ease-in-out infinite', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full" style={{ width: 500, height: 500, top: '70%', right: '12%', background: 'radial-gradient(circle, rgba(245,158,11,0.03) 0%, transparent 60%)', animation: 'float1 34s ease-in-out infinite', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full" style={{ width: 400, height: 400, bottom: '-5%', left: '35%', background: 'radial-gradient(circle, rgba(236,72,153,0.025) 0%, transparent 60%)', animation: 'float2 28s ease-in-out infinite', filter: 'blur(80px)' }} />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
        {[
          { x: '12%', y: '18%', c: '#FF552E', s: 3, d: 18, f: 1 },
          { x: '85%', y: '24%', c: '#06B6D4', s: 2, d: 23, f: 2 },
          { x: '28%', y: '55%', c: '#8B5CF6', s: 2.5, d: 20, f: 3 },
          { x: '75%', y: '65%', c: '#F59E0B', s: 2, d: 25, f: 1 },
          { x: '48%', y: '35%', c: '#FF552E', s: 1.5, d: 28, f: 2 },
          { x: '15%', y: '80%', c: '#06B6D4', s: 2, d: 19, f: 3 },
          { x: '62%', y: '10%', c: '#EC4899', s: 1.5, d: 32, f: 1 },
          { x: '52%', y: '88%', c: '#8B5CF6', s: 2, d: 21, f: 2 },
        ].map((p, i) => (
          <div key={i} className="absolute rounded-full" style={{
            left: p.x, top: p.y, width: p.s, height: p.s,
            background: p.c, opacity: 0.3,
            boxShadow: `0 0 ${p.s * 5}px ${p.c}40`,
            animation: `float${p.f} ${p.d}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* ═══ ANNOUNCEMENT BAR ═══ */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#FF552E]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-3 px-6 h-9">
          <span className="font-mono text-[10px] text-white/80 tracking-[0.15em] uppercase hidden sm:inline">New</span>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className="text-white text-xs font-medium">laniameda.prompt &mdash; Your AI prompt library, powered by Telegram</span>
          <a
            href="https://laniameda.storage"
            target="_blank"
            rel="noopener noreferrer"
            className="group/ann inline-flex items-center gap-1 text-white text-xs font-semibold underline underline-offset-2 decoration-white/50 hover:decoration-white transition-all duration-200"
          >
            Learn more
            <ExternalLink size={11} className="transition-transform duration-200 group-hover/ann:translate-x-0.5 group-hover/ann:-translate-y-0.5" />
          </a>
        </div>
      </div>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-9 left-0 right-0 z-50 border-b border-[#262626] bg-[#09090b]/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 md:px-12 lg:px-16 h-16">
          <div className="flex items-center gap-2 group cursor-default">
            <span className="text-lg font-semibold tracking-tight transition-colors duration-200 group-hover:text-[#FF552E]">Laniameda</span>
            <span className="font-mono text-[10px] text-[#FF552E] tracking-widest uppercase border border-[#FF552E]/30 px-1.5 py-0.5 leading-none transition-all duration-200 group-hover:bg-[#FF552E]/10 group-hover:border-[#FF552E]/50">AI Tools</span>
          </div>
          <button
            onClick={onEnter}
            className="btn-glow group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] border border-[#f4f4f5] px-6 py-2.5 text-[#f4f4f5] hover:bg-[#f4f4f5] hover:text-[#09090b] hover:shadow-[0_0_20px_rgba(244,244,245,0.15)] cursor-pointer"
          >
            Open App
            <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300 ease-out" />
          </button>
        </div>
      </nav>

      {/* ═══ HERO — split layout ═══ */}
      <section ref={heroRef} className="relative min-h-screen pt-[6.25rem] overflow-hidden">
        {/* Animated noisy gradient background — fades on scroll */}
        <HeroGradient opacity={gradientOpacity} />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundSize: '60px 60px',
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 h-[calc(100vh-6.25rem)] flex flex-col lg:flex-row items-center gap-8 lg:gap-12 py-16 md:py-20 lg:py-0">
          {/* Left — text */}
          <div className="flex-shrink-0 lg:w-[42%] flex flex-col justify-center">
            <FadeSection delay={0}>
              <p className="font-mono text-xs text-[#FF552E] tracking-[0.2em] uppercase mb-6">
                AI Workflow Augmentation
              </p>
            </FadeSection>

            <FadeSection delay={0.1}>
              <h1
                className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl leading-[0.95] mb-6"
                style={{ letterSpacing: '-0.04em' }}
              >
                The missing layer in<br />
                <span className="text-[#FF552E]">your AI image workflow.</span>
              </h1>
            </FadeSection>

            <FadeSection delay={0.2}>
              <p className="text-[#a1a1a1] text-base md:text-lg max-w-md leading-relaxed mb-8">
                The companion workspace that slots between you and the model. Precision crop-and-stitch for Midjourney. One-click reference sheets for DALL-E and Flux. Real-time palette exploration. Purpose-built to augment how AI creators actually work.
              </p>
            </FadeSection>

            <FadeSection className="flex flex-wrap items-center gap-6" delay={0.3}>
              <button
                onClick={onEnter}
                className="group relative inline-flex items-center gap-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-[#FF552E] py-3 cursor-pointer hover:text-[#ff6e4a] transition-colors duration-300"
              >
                Launch App
                <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1.5 transition-transform duration-300 ease-out" />
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF552E] origin-left transition-all duration-300 group-hover:scale-x-110 group-hover:shadow-[0_0_10px_rgba(255,85,46,0.4)]" />
              </button>
              <a
                href="#tools"
                className="group relative inline-flex items-center gap-2 text-sm text-[#a1a1a1] hover:text-[#f4f4f5] transition-colors duration-300 py-3"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See the tools
                <span className="absolute bottom-0 left-0 right-0 h-px bg-[#f4f4f5] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </a>
            </FadeSection>
          </div>

          {/* Right — interactive mockup */}
          <div className="flex-1 min-w-0 w-full lg:w-auto flex items-center">
            <FadeSection className="w-full">
              <div className="relative">
                {/* Glow behind mockup */}
                <div
                  className="absolute -inset-8 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,85,46,0.06) 0%, transparent 60%)',
                  }}
                />
                <div className="relative">
                  <AppMockup />
                </div>
                <p className="text-center font-mono text-[10px] text-[#888] tracking-[0.12em] uppercase mt-4">
                  Click tabs to preview each tool
                </p>
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ═══ TRUST LINE ═══ */}
      <FadeSection>
        <section className="relative overflow-hidden" style={{ borderTop: '1px solid #262626', borderBottom: '1px solid #262626' }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(90deg, rgba(255,85,46,0.02), rgba(6,182,212,0.02), rgba(139,92,246,0.02))',
          }} />
          <div className="relative max-w-[1400px] mx-auto flex items-center justify-center gap-6 md:gap-10 py-5 px-6">
            {[
              { text: 'Works with Midjourney, DALL-E, Flux & more', color: '#FF552E' },
              { text: 'Zero Install', color: '#06B6D4' },
              { text: 'Your Images Never Leave Your Browser', color: '#8B5CF6' },
            ].map((item, i) => (
              <React.Fragment key={item.text}>
                {i > 0 && <span className="text-[#333]">&middot;</span>}
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}50`, animation: 'pulseGlow 3s ease-in-out infinite' }} />
                  <span className="font-mono text-[11px] text-[#a1a1a1] tracking-[0.12em] uppercase">{item.text}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* ═══ WORKS WITH ═══ */}
      <FadeSection>
        <section className="py-12 md:py-16" style={{ borderBottom: '1px solid #262626' }}>
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
            <p className="text-center font-mono text-[10px] text-[#555] tracking-[0.2em] uppercase mb-6">Slots into your existing AI pipeline</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-3">
              {[
                { name: 'Midjourney', color: '#FF552E' },
                { name: 'DALL-E 3', color: '#06B6D4' },
                { name: 'Flux', color: '#8B5CF6' },
                { name: 'Stable Diffusion', color: '#F59E0B' },
                { name: 'Leonardo AI', color: '#EC4899' },
                { name: 'ComfyUI', color: '#10B981' },
              ].map((tool) => (
                <span
                  key={tool.name}
                  className="font-mono text-sm md:text-base font-medium tool-name-hover cursor-default"
                  style={{ color: `${tool.color}CC`, textShadow: 'none', transition: 'color 0.3s ease, text-shadow 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = tool.color; e.currentTarget.style.textShadow = `0 0 20px ${tool.color}40`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = `${tool.color}CC`; e.currentTarget.style.textShadow = 'none'; }}
                >
                  {tool.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* ═══ HOW IT WORKS ═══ */}
      <HowItWorksSection />

      {/* ═══ BUILT FOR ═══ */}
      <BuiltForSection />

      {/* ═══ FEATURES ═══ */}
      <FeaturesSection />

      {/* ═══ COMPARISON ═══ */}
      <ComparisonSection />

      {/* ═══ TESTIMONIALS ═══ */}
      <TestimonialsSection />

      {/* ═══ AFFILIATE — laniameda.prompt ═══ */}
      <FadeSection>
        <section className="border-t border-[#262626] py-20 md:py-28">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="text-center mb-12">
              <p className="font-mono text-xs text-[#888] tracking-[0.2em] uppercase mb-4">From the Makers of Laniameda</p>
              <h2
                className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6"
                style={{ letterSpacing: '-0.04em', lineHeight: 1.1 }}
              >
                Looking for a place to<br />
                <span className="text-[#FF552E]">store your prompts?</span>
              </h2>
              <p className="text-[#a1a1a1] text-base md:text-lg max-w-lg mx-auto leading-relaxed">
                The Pinterest for AI creators. Store prompts, browse generations, transfer styles between projects &mdash; powered by a Telegram bot that works as your personal AI agent.
              </p>
            </div>

            <PromptFeatures />

            <div className="text-center mt-4">
              <a
                href="https://laniameda.storage"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow group inline-flex items-center gap-3 border border-[#FF552E] text-[#FF552E] text-sm font-semibold uppercase tracking-[0.1em] px-8 py-3.5 hover:bg-[#FF552E] hover:text-white hover:shadow-[0_0_30px_rgba(255,85,46,0.25)] transition-all duration-300"
              >
                Try laniameda.prompt
                <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1.5 transition-transform duration-300 ease-out" />
              </a>
            </div>
          </div>
        </section>
      </FadeSection>

      {/* ═══ FAQ ═══ */}
      <FAQSection />

      {/* ═══ FINAL CTA ═══ */}
      <FadeSection>
        <section className="relative bg-[#f4f4f5] text-[#09090b] py-24 md:py-32 lg:py-40 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 50% 60% at 50% 100%, rgba(255,85,46,0.08) 0%, transparent 60%)',
            }}
          />
          <div className="relative max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 text-center">
            <h2
              className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-8"
              style={{ letterSpacing: '-0.04em', lineHeight: 1 }}
            >
              Augment your next project.
            </h2>
            <p className="text-[#52525b] text-lg max-w-md mx-auto mb-12 leading-relaxed">
              No account. No install. Your AI-generated images never leave your browser. Open the workspace and slot it into your existing workflow.
            </p>
            <button
              onClick={onEnter}
              className="btn-glow group inline-flex items-center gap-3 bg-[#FF552E] text-white text-sm font-semibold uppercase tracking-[0.1em] px-10 py-4 hover:bg-[#e64a27] active:translate-y-px hover:shadow-[0_0_40px_rgba(255,85,46,0.3)] transition-all duration-300 cursor-pointer"
            >
              Open Laniameda
              <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1.5 transition-transform duration-300 ease-out" />
            </button>
            <p className="font-mono text-[11px] text-[#52525b] tracking-[0.15em] uppercase mt-8">
              No account required &middot; Works with any AI image tool &middot; 100% client-side
            </p>
          </div>
        </section>
      </FadeSection>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[#262626] py-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">Laniameda</span>
            <span className="text-[#a1a1a1] text-sm">&mdash; The workflow layer AI image tools don&rsquo;t ship</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://laniameda.storage" target="_blank" rel="noopener noreferrer" className="group/footer font-mono text-xs text-[#888] hover:text-[#FF552E] transition-all duration-300 relative">
              laniameda.prompt
              <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#FF552E] origin-left scale-x-0 group-hover/footer:scale-x-100 transition-transform duration-300 ease-out" />
            </a>
            <p className="font-mono text-xs text-[#888]">&copy; {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
