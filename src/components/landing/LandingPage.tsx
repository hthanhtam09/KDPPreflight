'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Shield, Box, ArrowRight, CheckCircle2, 
  AlertTriangle, X, Upload, Search, Sparkles,
  ChevronRight, Ruler, Eye, FileCheck, Zap
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { AppView } from '@/types/kdp';

// ═══════════════════════════════════════════════
// ANIMATION PRIMITIVES
// ═══════════════════════════════════════════════

const revealUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const revealFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] } },
};

// Section wrapper with scroll-triggered animation
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  
  return (
    <motion.div
      ref={ref}
      variants={revealUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// MOUSE-REACTIVE GRADIENT BACKGROUND
// ═══════════════════════════════════════════════

function MouseGradient() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPosition({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary glow - follows mouse */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full opacity-[0.03] blur-[120px] animate-gradient-slow"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(99,102,241,0.2) 40%, transparent 70%)',
          left: `${position.x - 40}%`,
          top: `${position.y - 40}%`,
          transition: 'left 0.8s ease-out, top 0.8s ease-out',
        }}
      />
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.02] blur-[100px] animate-gradient-medium"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[80px] animate-gradient-slow"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════
// SECTION 1 — HERO
// ═══════════════════════════════════════════════

function HeroSection() {
  const { setView } = useAppStore();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  return (
    <section ref={containerRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <MouseGradient />
      
      {/* Noise texture */}
      <div className="noise-overlay absolute inset-0" />
      
      <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/50 font-medium tracking-wide">Free · Client-side · No uploads to servers</span>
        </motion.div>
        
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]"
        >
          <span className="gradient-text">Your book looks</span>
          <br />
          <span className="text-white/30">perfect.</span>
          <br />
          <span className="gradient-text-warm">Until KDP says</span>
          <br />
          <span className="text-white">otherwise.</span>
        </motion.h1>
        
        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="mt-8 text-base sm:text-lg text-white/35 max-w-xl mx-auto leading-relaxed"
        >
          Bleed, trim, spine, margins — KDP specs are confusing.
          KDPPreflight catches the mistakes before you upload.
        </motion.p>
        
        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => setView('checker')}
            className="btn-premium group px-8 py-4 bg-white text-black rounded-2xl font-semibold text-sm tracking-wide flex items-center gap-3"
          >
            Start Checking Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => setView('preview')}
            className="btn-premium px-8 py-4 glass-strong text-white/70 rounded-2xl font-medium text-sm tracking-wide hover:text-white/90 flex items-center gap-3"
          >
            <Box className="w-4 h-4" />
            Preview Demo Book
          </button>
        </motion.div>
        
        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 flex items-center justify-center gap-8 text-white/20"
        >
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>100% Browser-based</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-3.5 h-3.5" />
            <span>Real KDP Specs</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2 text-xs">
            <Eye className="w-3.5 h-3.5" />
            <span>3D Preview</span>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050508] to-transparent" />
    </section>
  );
}

// ═══════════════════════════════════════════════
// SECTION 2 — THE PAIN
// ═══════════════════════════════════════════════

function PainSection() {
  const painPoints = [
    { emoji: '😬', text: 'KDP says your dimensions are wrong' },
    { emoji: '😤', text: 'Bleed is slightly off — but you can\'t tell where' },
    { emoji: '😩', text: 'Spine width doesn\'t match your page count' },
    { emoji: '🤯', text: 'Margins get cropped and you only find out after printing' },
    { emoji: '😖', text: 'Upload accepted... but the printed book looks terrible' },
    { emoji: '🫠', text: 'You re-export the PDF 6 times and still aren\'t sure' },
  ];
  
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <RevealSection>
          <p className="text-sm text-white/30 uppercase tracking-[0.2em] font-medium text-center mb-4">Sound familiar?</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center leading-tight">
            <span className="text-white/90">Every KDP creator</span>
            <br />
            <span className="text-white/30">knows this pain.</span>
          </h2>
        </RevealSection>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-16 grid sm:grid-cols-2 gap-4"
        >
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="group flex items-start gap-4 p-5 rounded-2xl glass card-hover"
            >
              <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">{point.emoji}</span>
              <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors leading-relaxed pt-1">{point.text}</p>
            </motion.div>
          ))}
        </motion.div>
        
        <RevealSection delay={0.3}>
          <p className="mt-12 text-center text-white/25 text-sm max-w-md mx-auto leading-relaxed">
            You spend hours on your book, only to second-guess every pixel. 
            There has to be a better way.
          </p>
        </RevealSection>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════
// SECTION 3 — THE SOLUTION (3 FEATURES)
// ═══════════════════════════════════════════════

function FeatureShowcase() {
  const { setView } = useAppStore();
  
  const features = [
    {
      icon: Ruler,
      title: 'Book Setup',
      subtitle: 'Configure before you export',
      description: 'Choose trim size, toggle bleed, set paper type. Spine width auto-calculates. Visual template shows exactly what KDP expects.',
      view: 'setup' as AppView,
      visual: (
        <div className="relative w-full h-48 flex items-center justify-center">
          {/* Mini cover template visualization */}
          <svg viewBox="0 0 240 140" className="w-56 h-32">
            <rect x="5" y="5" width="230" height="130" rx="4" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 2" />
            <rect x="15" y="10" width="95" height="120" rx="2" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <rect x="110" y="10" width="8" height="120" rx="1" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.5" />
            <rect x="118" y="10" width="95" height="120" rx="2" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <rect x="125" y="18" width="80" height="104" rx="1" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" strokeDasharray="2 2" />
            {/* Animated dimension lines */}
            <motion.line 
              x1="15" y1="138" x2="213" y2="138" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"
              initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
            <motion.text x="120" y="148" textAnchor="middle" className="text-[6px]" fill="rgba(255,255,255,0.2)"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.5 }}
            >
              12.367"
            </motion.text>
          </svg>
        </div>
      ),
    },
    {
      icon: FileCheck,
      title: 'Format Checker',
      subtitle: 'Validate before you upload',
      description: 'Upload your cover or manuscript. Get instant KDP-aware validation with tolerance-based results — not just binary pass/fail.',
      view: 'checker' as AppView,
      visual: (
        <div className="relative w-full h-48 flex items-center justify-center">
          {/* Mini validation report visualization */}
          <div className="space-y-2.5 w-56">
            <motion.div 
              initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400/80 font-medium">Cover Width</span>
              <span className="text-[10px] text-emerald-400/50 ml-auto">PASS</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-500/[0.08] border border-amber-500/20"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-400/80 font-medium">Bleed Area</span>
              <span className="text-[10px] text-amber-400/50 ml-auto">WARNING</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.7 }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400/80 font-medium">Spine Width</span>
              <span className="text-[10px] text-emerald-400/50 ml-auto">SAFE</span>
            </motion.div>
          </div>
        </div>
      ),
    },
    {
      icon: Box,
      title: '3D Book Preview',
      subtitle: 'See it before you ship it',
      description: 'Render your book in realistic 3D. Rotate, zoom, inspect the spine. Export transparent PNGs for marketing. Not a gimmick — a real tool.',
      view: 'preview' as AppView,
      visual: (
        <div className="relative w-full h-48 flex items-center justify-center">
          {/* Mini 3D book visualization */}
          <div className="relative">
            <motion.div
              animate={{ rotateY: [0, 5, 0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ perspective: '800px' }}
            >
              <div className="w-32 h-44 rounded-sm relative" style={{ transform: 'rotateY(-15deg) rotateX(5deg)', transformStyle: 'preserve-3d' }}>
                {/* Front */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-indigo-500/10 rounded-sm border border-white/10 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white/20" />
                </div>
                {/* Spine */}
                <div className="absolute top-0 left-0 w-3 h-full bg-white/5 border-l border-white/10 -translate-x-3"
                  style={{ transform: 'rotateY(-90deg) translateZ(0px)', transformOrigin: 'right' }}
                />
                {/* Shadow */}
                <div className="absolute -bottom-4 left-2 right-2 h-8 bg-black/30 blur-xl rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      ),
    },
  ];
  
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <RevealSection>
          <p className="text-sm text-violet-400/60 uppercase tracking-[0.2em] font-medium text-center mb-4">The solution</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center leading-tight">
            <span className="text-white/90">Before KDP checks your files,</span>
            <br />
            <span className="gradient-text-warm">KDPPreflight already did.</span>
          </h2>
        </RevealSection>
        
        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.4, 0.25, 1] }}
              onClick={() => setView(feature.view)}
              className="group text-left glass rounded-3xl p-6 card-hover hover:border-white/10 transition-all duration-500"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-5 group-hover:bg-violet-500/10 transition-colors duration-500">
                <feature.icon className="w-5 h-5 text-white/50 group-hover:text-violet-400/80 transition-colors duration-500" />
              </div>
              
              {/* Text */}
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1">{feature.subtitle}</p>
              <h3 className="text-lg font-semibold text-white/90 mb-3">{feature.title}</h3>
              <p className="text-sm text-white/35 leading-relaxed mb-6">{feature.description}</p>
              
              {/* Visual */}
              <div className="border-t border-white/[0.04] pt-5 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                {feature.visual}
              </div>
              
              {/* CTA */}
              <div className="mt-4 flex items-center gap-1.5 text-xs text-white/25 group-hover:text-violet-400/60 transition-colors duration-500">
                Try it <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════
// SECTION 4 — BEFORE / AFTER
// ═══════════════════════════════════════════════

function BeforeAfterSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <RevealSection>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center leading-tight">
            <span className="text-white/90">Same book.</span>
            <br />
            <span className="text-white/30">Completely different experience.</span>
          </h2>
        </RevealSection>
        
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {/* Before */}
          <RevealSection delay={0.1}>
            <div className="h-full rounded-3xl p-8 bg-gradient-to-b from-red-500/[0.03] to-transparent border border-red-500/[0.06]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-400/60" />
                </div>
                <h3 className="text-sm font-semibold text-red-400/70 uppercase tracking-wider">Without Preflight</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Upload → get rejected → re-export → re-upload',
                  'Guess spine width from KDP\'s calculator',
                  'Discover bleed issues after publishing',
                  'No idea how the book will look printed',
                  'Hours wasted on formatting guesswork',
                  'Still not sure what\'s wrong',
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-start gap-3 text-sm text-white/30"
                  >
                    <span className="text-red-400/40 mt-0.5">—</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </RevealSection>
          
          {/* After */}
          <RevealSection delay={0.2}>
            <div className="h-full rounded-3xl p-8 bg-gradient-to-b from-emerald-500/[0.04] to-transparent border border-emerald-500/[0.08] glow-subtle">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400/70" />
                </div>
                <h3 className="text-sm font-semibold text-emerald-400/80 uppercase tracking-wider">With KDPPreflight</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Validate before uploading — get it right first time',
                  'Instant spine calculations for your exact specs',
                  'Visual cover layout with bleed & safe zones',
                  'Realistic 3D preview of the final book',
                  'Minutes instead of hours',
                  'Upload with confidence',
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-start gap-3 text-sm text-white/40"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/50 mt-0.5 shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════
// SECTION 5 — HOW IT WORKS
// ═══════════════════════════════════════════════

function HowItWorksSection() {
  const { setView } = useAppStore();
  
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Upload your files',
      description: 'Drop your cover PDF, PNG, or manuscript. Everything stays in your browser — nothing is sent to any server.',
    },
    {
      number: '02',
      icon: Search,
      title: 'Check and preview',
      description: 'Instant validation against real KDP specs. See your book in realistic 3D. Know exactly what needs fixing.',
    },
    {
      number: '03',
      icon: Sparkles,
      title: 'Upload confidently',
      description: 'Fix what\'s needed, export templates, preview your spine. Then upload to KDP knowing it\'ll work.',
    },
  ];
  
  return (
    <section className="relative py-32 px-6">
      <div className="section-divider mb-32" />
      <div className="max-w-4xl mx-auto">
        <RevealSection>
          <p className="text-sm text-white/30 uppercase tracking-[0.2em] font-medium text-center mb-4">How it works</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
            <span className="gradient-text">Three steps.</span>
            <span className="text-white/30"> Zero guesswork.</span>
          </h2>
        </RevealSection>
        
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.4, 0.25, 1] }}
              className="relative text-center"
            >
              {/* Step number */}
              <div className="text-6xl font-bold text-white/[0.03] mb-4">{step.number}</div>
              
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl glass-strong flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-5 h-5 text-violet-400/60" />
              </div>
              
              <h3 className="text-base font-semibold text-white/80 mb-3">{step.title}</h3>
              <p className="text-sm text-white/30 leading-relaxed">{step.description}</p>
              
              {/* Connector line (not on last item or mobile) */}
              {i < 2 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
        
        <RevealSection delay={0.3}>
          <div className="mt-16 text-center">
            <button
              onClick={() => setView('checker')}
              className="btn-premium group px-8 py-4 bg-white text-black rounded-2xl font-semibold text-sm tracking-wide inline-flex items-center gap-3"
            >
              Try It Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════
// SECTION 6 — TRUST / SOCIAL PROOF
// ═══════════════════════════════════════════════

function TrustSection() {
  const stats = [
    { value: '100%', label: 'Client-side processing' },
    { value: '0', label: 'Files uploaded to servers' },
    { value: '3s', label: 'Average check time' },
    { value: '12+', label: 'KDP trim sizes supported' },
  ];
  
  const testimonials = [
    { quote: 'I used to re-export my cover PDF 5 times before getting it right. KDPPreflight caught every issue on the first try.', creator: 'Coloring book creator' },
    { quote: 'The 3D preview alone saved me from uploading a book with a completely wrong spine width. Game changer.', creator: 'Notebook publisher' },
    { quote: 'Finally someone made a tool that actually understands what KDP creators go through.', creator: 'Low-content creator' },
  ];
  
  return (
    <section className="relative py-32 px-6">
      <div className="section-divider mb-32" />
      <div className="max-w-4xl mx-auto">
        <RevealSection>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
            <span className="text-white/90">Built by creators,</span>
            <br />
            <span className="text-white/30">for creators.</span>
          </h2>
        </RevealSection>
        
        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={staggerItem} className="text-center p-6 glass rounded-2xl">
              <div className="text-3xl font-bold gradient-text-warm">{stat.value}</div>
              <div className="text-xs text-white/30 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Testimonials */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={staggerItem} className="p-6 glass rounded-2xl card-hover">
              <p className="text-sm text-white/40 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-xs text-white/20">— {t.creator}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════
// SECTION 7 — FAQ
// ═══════════════════════════════════════════════

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left glass rounded-2xl overflow-hidden card-hover"
    >
      <div className="p-5 flex items-center justify-between gap-4">
        <h4 className="text-sm text-white/70 font-medium">{question}</h4>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronRight className="w-4 h-4 text-white/20 rotate-90" />
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="px-5 pb-5 border-t border-white/[0.04] pt-3">
              <p className="text-sm text-white/35 leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

function FAQSection() {
  const faqs = [
    { q: 'What file formats does KDPPreflight support?', a: 'We support PDF, PNG, and JPG files for covers, and PDF for manuscripts. All processing happens in your browser — no files are uploaded to any server.' },
    { q: 'Is my data safe?', a: 'Absolutely. All file processing happens client-side in your browser. Your files never leave your device. There are no servers, no storage, no tracking.' },
    { q: 'How accurate are the KDP validations?', a: 'Our validation engine uses real KDP specifications with practical tolerance ranges. We emulate real-world KDP acceptance behavior, not strict mathematical validation.' },
    { q: 'Is KDPPreflight free?', a: 'Yes, KDPPreflight is completely free to use. No accounts, no subscriptions, no hidden fees.' },
    { q: 'What does the 3D preview show?', a: 'The 3D preview renders a realistic book model using your actual cover image. You can rotate, zoom, and export transparent PNG snapshots for marketing use.' },
  ];
  
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <RevealSection>
          <p className="text-sm text-white/30 uppercase tracking-[0.2em] font-medium text-center mb-4">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white/90 mb-12">Common questions</h2>
        </RevealSection>
        
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <RevealSection key={i} delay={i * 0.05}>
              <FAQItem question={faq.q} answer={faq.a} />
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════
// SECTION 8 — FINAL CTA
// ═══════════════════════════════════════════════

function FinalCTA() {
  const { setView } = useAppStore();
  
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="section-divider mb-32" />
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/[0.03] blur-[120px]" />
      
      <div className="relative max-w-2xl mx-auto text-center">
        <RevealSection>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            <span className="text-white/90">Stop wasting hours</span>
            <br />
            <span className="gradient-text-warm">fixing KDP errors.</span>
          </h2>
          <p className="mt-6 text-lg text-white/30">Your next upload should feel effortless.</p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setView('checker')}
              className="btn-premium group px-10 py-4 bg-white text-black rounded-2xl font-semibold text-sm tracking-wide flex items-center gap-3"
            >
              Start Checking Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
          <p className="mt-6 text-xs text-white/15">No sign up required. No files leave your browser.</p>
        </RevealSection>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════

function Footer() {
  const { setView } = useAppStore();
  
  return (
    <footer className="border-t border-white/[0.04] py-8 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <button onClick={() => setView('landing')} className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
          <BookOpen className="w-4 h-4 text-white/20" />
          <span className="text-sm text-white/20 font-medium tracking-tight">KDPPreflight</span>
        </button>
        <p className="text-xs text-white/15">
          Free KDP preflight tool · All processing in your browser · Built for creators
        </p>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════
// LANDING PAGE (COMPOSED)
// ═══════════════════════════════════════════════

export default function LandingPage() {
  return (
    <div className="relative bg-[#050508]">
      <HeroSection />
      <PainSection />
      <FeatureShowcase />
      <BeforeAfterSection />
      <HowItWorksSection />
      <TrustSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
