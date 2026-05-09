'use client';

import { motion } from 'framer-motion';
import { BookOpen, Shield, Box, ArrowRight, CheckCircle2, AlertTriangle, ChevronDown, X } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { AppView } from '@/types/kdp';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

// --- Feature Cards ---
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  view 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  view: AppView;
}) {
  const { setView } = useAppStore();
  
  return (
    <motion.button
      variants={fadeIn}
      onClick={() => setView(view)}
      className="group text-left bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
    >
      <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4 group-hover:bg-white/[0.1] transition-colors">
        <Icon className="w-5 h-5 text-white/70" />
      </div>
      <h3 className="text-white/90 font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-white/30 group-hover:text-white/50 transition-colors">
        Get started <ArrowRight className="w-3 h-3" />
      </div>
    </motion.button>
  );
}

// --- Why KDP Fails Section ---
function WhyKDPFails() {
  const issues = [
    { title: 'Wrong trim size', desc: 'Your book dimensions don\'t match any KDP-supported trim size.' },
    { title: 'Missing bleed', desc: 'Color interiors require 0.125" bleed on all edges.' },
    { title: 'Incorrect spine width', desc: 'Spine width must match your page count and paper type exactly.' },
    { title: 'Low resolution images', desc: 'Images below 300 DPI will print blurry and may be rejected.' },
    { title: 'Transparency in PDF', desc: 'KDP doesn\'t support transparent elements in cover PDFs.' },
    { title: 'Wrong page count', desc: 'Paperback interiors need 24-828 pages, always even numbers.' },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {issues.map((issue, i) => (
        <motion.div
          key={i}
          variants={fadeIn}
          className="flex gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400/60 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white/70 font-medium">{issue.title}</p>
            <p className="text-xs text-white/30 mt-1">{issue.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// --- FAQ Section ---
function FAQSection() {
  const faqs = [
    {
      q: 'What file formats does KDPPreflight support?',
      a: 'We support PDF, PNG, and JPG files for covers, and PDF for manuscripts. All processing happens in your browser — no files are uploaded to any server.'
    },
    {
      q: 'Is my data safe?',
      a: 'Absolutely. All file processing happens client-side in your browser. Your files never leave your device. There are no servers, no storage, no tracking.'
    },
    {
      q: 'How accurate are the KDP validations?',
      a: 'Our validation engine uses real KDP specifications with practical tolerance ranges. We emulate real-world KDP acceptance behavior, not strict mathematical validation.'
    },
    {
      q: 'Can I use this for hardcover books?',
      a: 'Currently we focus on paperback formatting. Hardcover support with dust jacket and wrap templates is coming soon.'
    },
    {
      q: 'Is KDPPreflight free?',
      a: 'Yes, KDPPreflight is completely free to use. No accounts, no subscriptions, no hidden fees.'
    },
    {
      q: 'What does the 3D preview show?',
      a: 'The 3D preview renders a realistic book model using your actual cover image. You can rotate, zoom, and export transparent PNG snapshots for marketing use.'
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {faqs.map((faq, i) => (
        <motion.div
          key={i}
          variants={fadeIn}
          className="p-5 bg-white/[0.02] rounded-xl border border-white/[0.04]"
        >
          <h4 className="text-sm text-white/70 font-medium mb-2">{faq.q}</h4>
          <p className="text-xs text-white/40 leading-relaxed">{faq.a}</p>
        </motion.div>
      ))}
    </div>
  );
}

// --- Landing Page ---
export default function LandingPage() {
  const { setView } = useAppStore();
  
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-white/50 mb-8">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Free & client-side — your files never leave your browser
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              Check your KDP book<br />
              <span className="text-white/40">before upload</span>
            </h1>
            
            <p className="mt-6 text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
              Validate dimensions, check bleed &amp; margins, preview your book in 3D.
              The complete preflight tool for Amazon KDP creators.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setView('checker')}
                className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                Check My Book
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('setup')}
                className="px-6 py-3 bg-white/[0.06] text-white/70 rounded-xl font-medium hover:bg-white/[0.1] hover:text-white/90 transition-all border border-white/[0.08]"
              >
                Setup New Book
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 pb-20">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4"
        >
          <FeatureCard
            icon={BookOpen}
            title="Book Setup"
            description="Configure trim size, bleed, paper type, and page count. Get instant spine width calculations and visual cover layout."
            view="setup"
          />
          <FeatureCard
            icon={Shield}
            title="Format Checker"
            description="Upload your cover or manuscript and get a detailed KDP validation report with practical tolerance-based results."
            view="checker"
          />
          <FeatureCard
            icon={Box}
            title="3D Preview"
            description="See your book rendered in realistic 3D. Rotate, zoom, inspect the spine, and export transparent PNG snapshots."
            view="preview"
          />
        </motion.div>
      </section>

      {/* Why KDP Uploads Fail */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-white/90 text-center mb-2">Why KDP uploads fail</h2>
            <p className="text-sm text-white/40 text-center mb-8">Common mistakes that cost creators time and money</p>
            <WhyKDPFails />
          </motion.div>
        </div>
      </section>

      {/* Before/After */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-white/90 text-center mb-2">Before &amp; after KDPPreflight</h2>
            <p className="text-sm text-white/40 text-center mb-8">How preflight validation saves your KDP workflow</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-red-400/80 mb-3 flex items-center gap-2">
                  <X className="w-4 h-4" /> Without Preflight
                </h3>
                <ul className="space-y-2 text-xs text-white/40">
                  <li>• Upload, get rejected, re-export, re-upload</li>
                  <li>• Guess spine width from KDP calculator</li>
                  <li>• Discover bleed issues after publishing</li>
                  <li>• No idea how the book will look printed</li>
                  <li>• Wasted hours on formatting guesswork</li>
                </ul>
              </div>
              <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-emerald-400/80 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> With KDPPreflight
                </h3>
                <ul className="space-y-2 text-xs text-white/40">
                  <li>• Validate before uploading — get it right first time</li>
                  <li>• Instant spine calculations for your exact specs</li>
                  <li>• Visual cover layout with bleed &amp; safe zones</li>
                  <li>• Realistic 3D preview of the final book</li>
                  <li>• Confident uploads, zero rejections</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-white/90 text-center mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-white/40 text-center mb-8">Everything you need to know about KDPPreflight</p>
            <FAQSection />
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white/90 mb-4">Ready to preflight?</h2>
            <p className="text-white/40 mb-6">Stop guessing. Start validating.</p>
            <button
              onClick={() => setView('checker')}
              className="px-8 py-3.5 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2"
            >
              Check My Book Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-white/30" />
            <span className="text-sm text-white/30 font-medium">KDPPreflight</span>
          </div>
          <p className="text-xs text-white/20">
            Free KDP preflight tool. All processing happens in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
