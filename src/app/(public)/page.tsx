"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import ParticleBackground from "@/components/ui/ParticleBackground";

/* ── Scroll-reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("reveal-hidden");
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.remove("reveal-hidden"); el.classList.add("reveal-visible"); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return <div ref={ref} className={className}>{children}</div>;
}

const features = [
  { icon: "fingerprint", title: "Keystroke Biometrics", desc: "Continuous identity verification through unique typing rhythm analysis — impossible to fake." },
  { icon: "visibility", title: "Gaze Tracking", desc: "AI-powered eye movement analysis detects screen-switching, off-screen reading, and suspicious focus patterns." },
  { icon: "terminal", title: "Process Sentinel", desc: "Silent monitoring of running applications flags screen-sharing tools, virtual machines, and cheat software." },
  { icon: "speed", title: "Real-Time Scoring", desc: "Live trust scores update every second with explainable AI — no black-box decisions." },
  { icon: "lock", title: "Privacy-First", desc: "All processing happens on-device. Zero data leaves the candidate's machine. Ever." },
  { icon: "hub", title: "Seamless Integration", desc: "Drop-in SDK for any LMS or assessment platform. One script tag, full protection." },
];

const steps = [
  { num: "01", title: "Candidate Joins", desc: "One-click session entry with system permission grants. No downloads required." },
  { num: "02", title: "Baseline Capture", desc: "30-second calibration captures the candidate's unique behavioral fingerprint." },
  { num: "03", title: "Live Monitoring", desc: "Three AI signals run in parallel, scoring trust in real-time with sub-200ms latency." },
  { num: "04", title: "Proctor Dashboard", desc: "Live feed of all candidates with instant alerts, risk heatmaps, and session replay." },
];

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Security", href: "#" },
    { label: "SOC 2 Report", href: "#" },
  ],
};

export default function LandingPage() {
  return (
    <div className="bg-bg-base text-text-primary font-ui antialiased min-h-screen relative overflow-x-hidden">
      <ParticleBackground />
      {/* ── NAVBAR ── */}
      <nav
        className="nav-slide-down fixed top-0 w-full h-[60px] px-6 md:px-12 flex justify-between items-center z-50 border-b border-border-subtle"
        style={{ backgroundColor: "rgba(4,4,15,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      >
        <div className="flex items-center gap-2">
          <span className="font-brand text-[18px] tracking-[0.25em] text-text-primary uppercase">SENTINEL</span>
          <span className="font-brand text-[18px] tracking-[0.25em] text-accent-blue uppercase">ZERO</span>
        </div>
        <div className="hidden md:flex gap-8">
          {[
            { label: "Product", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Use Cases", href: "#use-cases" },
            { label: "Pricing", href: "#pricing" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector(item.href);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="font-ui text-[13px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              {item.label}
            </a>
          ))}
        </div>
        <Link href="/signup">
          <button className="px-4 py-2 border border-border-active bg-transparent text-text-primary font-ui text-[13px] rounded-[8px] hover:bg-bg-panel transition-colors">
            Request Demo
          </button>
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center pt-24 px-6 overflow-hidden"
        style={{ backgroundImage: "radial-gradient(circle at center, rgba(59,130,246,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      >
        {/* Orbital ring decoration */}
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.07]"
          style={{ border: "1px solid #3B82F6", borderRadius: "50%", animation: "orbitSpin 30s linear infinite" }} />
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.04]"
          style={{ border: "1px solid #06B6D4", borderRadius: "50%", animation: "orbitSpin 45s linear infinite reverse" }} />

        {/* Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none z-0"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(4,4,15,0) 70%)", animation: "pulseGlow 6s infinite alternate" }} />

        {/* Floating Signal Badges */}
        <div className="absolute left-[8%] top-[30%] float-signal pointer-events-none z-10">
          <div className="px-3 py-1.5 rounded-lg border border-accent-blue/20 bg-bg-panel/60 backdrop-blur-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-secure" style={{ boxShadow: "0 0 6px #22C55E" }} />
            <span className="font-mono text-[10px] text-status-secure">KEYSTROKE OK</span>
          </div>
        </div>
        <div className="absolute right-[8%] top-[35%] float-signal-alt pointer-events-none z-10">
          <div className="px-3 py-1.5 rounded-lg border border-accent-cyan/20 bg-bg-panel/60 backdrop-blur-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-accent-cyan">visibility</span>
            <span className="font-mono text-[10px] text-accent-cyan">GAZE LOCKED</span>
          </div>
        </div>
        <div className="absolute left-[12%] bottom-[35%] float-signal-slow pointer-events-none z-10">
          <div className="px-3 py-1.5 rounded-lg border border-status-secure/20 bg-bg-panel/60 backdrop-blur-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-status-secure">verified_user</span>
            <span className="font-mono text-[10px] text-status-secure">SECURE</span>
          </div>
        </div>
        <div className="absolute right-[10%] bottom-[30%] float-signal pointer-events-none z-10" style={{ animationDelay: "-2s" }}>
          <div className="px-3 py-1.5 rounded-lg border border-accent-blue/20 bg-bg-panel/60 backdrop-blur-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-accent-blue">memory</span>
            <span className="font-mono text-[10px] text-accent-blue">0 THREATS</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-[760px] w-full">
          {/* Pill Badge */}
          <div className="hero-stagger-1 mb-8 px-4 py-1.5 border border-border-active rounded-full flex items-center gap-2"
            style={{ backgroundColor: "rgba(59,130,246,0.08)", animation: "heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both, borderGlow 3s ease-in-out infinite" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" style={{ animation: "dotPulse 2s ease-in-out infinite" }} />
            <span className="font-mono text-[11px] text-text-mono uppercase tracking-wider">AI-POWERED PROCTORING</span>
          </div>

          <h1 className="hero-stagger-2 font-brand font-bold text-[clamp(36px,6vw,72px)] leading-[1.05] mb-6 tracking-tight">
            <span className="block text-text-primary">Know Exactly Who&apos;s</span>
            <span className="block" style={{
              backgroundImage: "linear-gradient(135deg, #3B82F6, #06B6D4, #3B82F6)",
              backgroundSize: "200% auto",
              backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "gradientShift 4s ease infinite",
            }}>On The Other Side.</span>
          </h1>

          <p className="hero-stagger-3 font-ui text-[18px] text-text-secondary max-w-[560px] leading-[1.7] mb-10">
            Sentinel Zero monitors keystroke rhythm, eye gaze, and running processes in real time — flagging anomalies before they become cheating.
          </p>

          <div className="hero-stagger-4 flex flex-col sm:flex-row gap-4 mb-8">
            <Link href="/signup">
              <button className="cta-shimmer group h-[52px] px-8 text-white font-ui font-semibold text-[14px] rounded-[10px] flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03]"
                style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)", boxShadow: "0 0 30px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                <span className="material-symbols-outlined text-[18px]">shield</span>
                Start Free Trial
                <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </Link>
            <Link href="/login">
              <button className="h-[52px] px-8 border border-border-active bg-bg-panel/50 text-text-primary font-ui text-[14px] rounded-[10px] flex items-center justify-center gap-2 hover:border-accent-blue/50 hover:bg-bg-panel transition-all duration-300">
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                Watch Demo
              </button>
            </Link>
          </div>

          <p className="hero-stagger-5 font-ui text-[12px] text-text-secondary flex items-center justify-center gap-3">
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-status-secure">verified_user</span>No data leaves your device</span>
            <span className="w-1 h-1 rounded-full bg-text-secondary/40" />
            <span>SOC 2 compliant</span>
            <span className="w-1 h-1 rounded-full bg-text-secondary/40" />
            <span>Works offline</span>
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="hero-stagger-6 relative z-10 mt-16 w-full max-w-[960px]" style={{ animation: "heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.85s both" }}>
          <div className="absolute -inset-4 rounded-2xl z-0" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.08))", filter: "blur(60px)" }} />
          <div className="relative w-full bg-bg-panel border border-border-subtle rounded-[16px] overflow-hidden z-10"
            style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.08)", maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}>
            <div className="h-10 border-b border-border-subtle flex items-center px-4 gap-3 bg-bg-surface/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/60" />
              </div>
              <div className="flex-1 flex justify-center"><div className="w-52 h-5 bg-bg-base/50 rounded-md border border-border-subtle" /></div>
            </div>
            <div className="p-6 flex gap-6">
              <div className="trust-ring-pulse w-44 h-44 rounded-full border-[6px] border-border-subtle flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-[6px] border-transparent" style={{ borderTopColor: "#22C55E", borderRightColor: "#22C55E", transform: "rotate(45deg)" }} />
                <span className="font-mono font-bold text-[42px] text-text-primary leading-none">91</span>
                <div className="mt-1.5 px-2.5 py-0.5 border rounded-md" style={{ backgroundColor: "rgba(34,197,94,0.1)", borderColor: "#22C55E" }}>
                  <span className="font-mono text-[9px] text-status-secure font-bold uppercase">● SECURE</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex-1 bg-bg-surface border border-border-subtle rounded-lg p-3 relative overflow-hidden">
                  <div className="text-[10px] text-text-secondary font-mono mb-1">TRUST SCORE TIMELINE</div>
                  <svg className="w-full h-20" preserveAspectRatio="none" viewBox="0 0 200 80">
                    <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3B82F6" stopOpacity="0.3"/><stop offset="1" stopColor="#3B82F6" stopOpacity="0"/></linearGradient></defs>
                    <path d="M0,60 C15,55 25,50 40,55 C55,60 65,38 80,35 C95,32 105,42 120,45 C135,48 145,28 160,25 C170,23 180,38 195,42 L200,44 V80 H0 Z" fill="url(#lg)"/>
                    <path d="M0,60 C15,55 25,50 40,55 C55,60 65,38 80,35 C95,32 105,42 120,45 C135,48 145,28 160,25 C170,23 180,38 195,42 L200,44" fill="none" stroke="#3B82F6" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="flex gap-3">
                  {[{ l: "Keystroke", v: "98%", c: "#22C55E" }, { l: "Gaze", v: "94%", c: "#3B82F6" }, { l: "Process", v: "100%", c: "#06B6D4" }].map(s => (
                    <div key={s.l} className="flex-1 bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-center">
                      <div className="font-mono text-[18px] font-bold" style={{ color: s.c }}>{s.v}</div>
                      <div className="text-[9px] text-text-secondary font-mono uppercase">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS / TRUST BAR ── */}
      <Section>
        <section className="w-full border-y border-border-subtle py-6 px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, #0A0A1E, #04040F)" }}>
          <p className="text-center text-[11px] text-text-secondary/60 uppercase tracking-[0.2em] font-mono mb-4">Trusted by leading institutions</p>
          <div className="flex justify-center items-center gap-12 opacity-30">
            {["MIT", "Stanford", "IIT Delhi", "Oxford", "NUS"].map(n => (
              <span key={n} className="font-brand text-[16px] tracking-[0.15em] text-text-secondary uppercase whitespace-nowrap">{n}</span>
            ))}
          </div>
        </section>
      </Section>

      {/* ── STATS BAR ── */}
      <Section>
        <section className="w-full bg-bg-surface/50 py-16 px-6">
          <div className="max-w-[1100px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { v: "98.7%", l: "Detection Accuracy", icon: "target" },
              { v: "<200ms", l: "Response Latency", icon: "bolt" },
              { v: "3", l: "AI Signal Streams", icon: "sensors" },
              { v: "Zero", l: "Cloud Data Storage", icon: "cloud_off" },
            ].map((s, i) => (
              <div key={i} className="stat-glow flex flex-col items-center text-center p-6 rounded-xl border border-border-subtle/50 bg-bg-panel/30 hover:border-accent-blue/30 transition-all duration-500 hover:bg-bg-panel/60 group">
                <span className="material-symbols-outlined text-[24px] text-accent-cyan/60 mb-3 group-hover:text-accent-cyan transition-colors">{s.icon}</span>
                <span className="font-mono font-bold text-[32px] text-accent-cyan leading-none">{s.v}</span>
                <span className="font-ui text-[12px] text-text-secondary mt-2">{s.l}</span>
              </div>
            ))}
          </div>
        </section>
      </Section>

      {/* ── FEATURES ── */}
      <Section>
        <section id="features" className="w-full py-24 px-6" style={{ scrollMarginTop: "80px" }}>
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] text-accent-cyan uppercase tracking-[0.2em]">CAPABILITIES</span>
              <h2 className="font-brand font-bold text-[40px] mt-3 mb-4">Three Signals. One Truth.</h2>
              <p className="text-text-secondary max-w-[500px] mx-auto text-[15px] leading-relaxed">Every exam session is analyzed through three independent AI pipelines that cross-validate in real time.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <div key={i} className="card-shine group p-6 rounded-xl border border-border-subtle bg-bg-panel/40 hover:border-accent-blue/40 transition-all duration-500 hover:bg-bg-panel/80">
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: "radial-gradient(circle at top right, rgba(59,130,246,0.08), transparent 70%)" }} />
                  <div className="w-10 h-10 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mb-4 group-hover:bg-accent-blue/20 transition-colors">
                    <span className="material-symbols-outlined text-[20px] text-accent-blue">{f.icon}</span>
                  </div>
                  <h3 className="font-ui font-semibold text-[15px] mb-2 text-text-primary">{f.title}</h3>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Section>

      {/* ── HOW IT WORKS ── */}
      <Section>
        <section id="how-it-works" className="w-full py-24 px-6 relative" style={{ scrollMarginTop: "80px" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.03) 0%, transparent 60%)" }} />
          <div className="max-w-[900px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] text-accent-cyan uppercase tracking-[0.2em]">WORKFLOW</span>
              <h2 className="font-brand font-bold text-[40px] mt-3 mb-4">How It Works</h2>
              <p className="text-text-secondary max-w-[460px] mx-auto text-[15px] leading-relaxed">From session start to proctor alert — under 30 seconds to full protection.</p>
            </div>
            <div className="relative">
              <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-accent-blue/40 via-accent-cyan/20 to-transparent hidden md:block" />
              <div className="space-y-10">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="relative z-10 w-12 h-12 rounded-full border-2 border-accent-blue/30 bg-bg-base flex items-center justify-center shrink-0 group-hover:border-accent-blue/70 group-hover:bg-accent-blue/10 transition-all duration-500">
                      <span className="font-mono text-[13px] text-accent-blue font-bold">{s.num}</span>
                    </div>
                    <div className="flex-1 p-5 rounded-xl border border-border-subtle bg-bg-panel/40 group-hover:border-accent-blue/30 group-hover:bg-bg-panel/70 transition-all duration-500">
                      <h3 className="font-ui font-semibold text-[15px] mb-1.5">{s.title}</h3>
                      <p className="text-[13px] text-text-secondary leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Section>

      {/* ── USE CASES ── */}
      <Section>
        <section id="use-cases" className="w-full py-24 px-6 relative" style={{ scrollMarginTop: "80px" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(6,182,212,0.04) 0%, transparent 60%)" }} />
          <div className="max-w-[1100px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] text-accent-cyan uppercase tracking-[0.2em]">USE CASES</span>
              <h2 className="font-brand font-bold text-[40px] mt-3 mb-4">Built for Every High-Stakes Exam</h2>
              <p className="text-text-secondary max-w-[500px] mx-auto text-[15px] leading-relaxed">From university finals to professional certifications — Sentinel Zero adapts to your assessment environment.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: "school", title: "University Examinations", desc: "Proctoring thousands of students simultaneously during semester finals with zero performance degradation. Real-time anomaly detection across large cohorts.", tag: "EDUCATION" },
                { icon: "workspace_premium", title: "Professional Certifications", desc: "High-assurance identity verification for professional licensing exams — medical boards, bar exams, and financial certifications.", tag: "CERTIFICATION" },
                { icon: "corporate_fare", title: "Corporate Assessments", desc: "Secure internal skill assessments, compliance training verification, and employee evaluation testing for enterprise organizations.", tag: "ENTERPRISE" },
                { icon: "public", title: "Remote Hiring", desc: "Ensure candidate authenticity during technical interviews and coding assessments with continuous behavioral verification.", tag: "RECRUITMENT" },
              ].map((uc, i) => (
                <div key={i} className="group relative p-6 rounded-xl border border-border-subtle bg-bg-panel/40 hover:border-accent-cyan/30 hover:bg-bg-panel/70 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: "radial-gradient(circle at top right, rgba(6,182,212,0.08), transparent 70%)" }} />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center shrink-0 group-hover:bg-accent-cyan/20 transition-colors">
                      <span className="material-symbols-outlined text-[22px] text-accent-cyan">{uc.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-ui font-semibold text-[15px] text-text-primary">{uc.title}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-accent-cyan/10 border border-accent-cyan/20 font-mono text-[9px] text-accent-cyan">{uc.tag}</span>
                      </div>
                      <p className="text-[13px] text-text-secondary leading-relaxed">{uc.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Section>

      {/* ── PRICING ── */}
      <Section>
        <section id="pricing" className="w-full py-24 px-6 relative" style={{ scrollMarginTop: "80px" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 50%)" }} />
          <div className="max-w-[1000px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] text-accent-cyan uppercase tracking-[0.2em]">PRICING</span>
              <h2 className="font-brand font-bold text-[40px] mt-3 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-text-secondary max-w-[460px] mx-auto text-[15px] leading-relaxed">Start free. Scale when you&apos;re ready. No hidden fees.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Starter", price: "Free", period: "forever", desc: "For small teams getting started", features: ["Up to 50 sessions/month", "3 AI signal streams", "Basic dashboard", "Email support", "7-day session history"], highlight: false },
                { name: "Pro", price: "$49", period: "/month", desc: "For growing institutions", features: ["Unlimited sessions", "Advanced analytics", "Proctor dashboard", "Priority support", "90-day session history", "Custom branding"], highlight: true },
                { name: "Enterprise", price: "Custom", period: "", desc: "For large-scale deployments", features: ["Everything in Pro", "On-premise deployment", "SSO & LDAP", "Dedicated account manager", "SLA guarantee", "API access"], highlight: false },
              ].map((plan, i) => (
                <div key={i} className={`relative p-6 rounded-xl border transition-all duration-500 flex flex-col ${plan.highlight ? "border-accent-blue/50 bg-bg-panel/80 scale-[1.02]" : "border-border-subtle bg-bg-panel/40 hover:border-accent-blue/30 hover:bg-bg-panel/60"}`}
                  style={plan.highlight ? { boxShadow: "0 0 40px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.05)" } : undefined}>
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full font-mono text-[10px] text-white"
                      style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)" }}>MOST POPULAR</div>
                  )}
                  <h3 className="font-ui font-semibold text-[16px] text-text-primary mb-1">{plan.name}</h3>
                  <p className="text-[12px] text-text-secondary mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-brand font-bold text-[36px] text-text-primary">{plan.price}</span>
                    {plan.period && <span className="text-[13px] text-text-secondary">{plan.period}</span>}
                  </div>
                  <ul className="flex-1 flex flex-col gap-2.5 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[13px] text-text-secondary">
                        <span className="material-symbols-outlined text-[14px] text-status-secure">check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <button className={`w-full h-[44px] rounded-[10px] font-ui font-semibold text-[13px] transition-all duration-300 ${plan.highlight
                      ? "text-white hover:scale-[1.02]"
                      : "border border-border-active bg-transparent text-text-primary hover:border-accent-blue/50 hover:bg-bg-panel"}`}
                      style={plan.highlight ? { background: "linear-gradient(135deg, #3B82F6, #06B6D4)", boxShadow: "0 0 20px rgba(59,130,246,0.2)" } : undefined}>
                      {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Section>

      {/* ── CTA SECTION ── */}
      <Section>
        <section className="w-full py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 50%)" }} />
          <div className="max-w-[640px] mx-auto text-center relative z-10">
            <h2 className="font-brand font-bold text-[36px] mb-4">Ready to Secure Your Exams?</h2>
            <p className="text-text-secondary text-[15px] leading-relaxed mb-8">Join institutions worldwide using Sentinel Zero to ensure exam integrity with privacy-first AI.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="cta-shimmer group h-[52px] px-8 text-white font-ui font-semibold text-[14px] rounded-[10px] flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03] mx-auto"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)", boxShadow: "0 0 40px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                  Get Started Free
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </Link>
              <Link href="/login">
                <button className="h-[52px] px-8 border border-border-active bg-transparent text-text-primary font-ui text-[14px] rounded-[10px] flex items-center justify-center gap-2 hover:border-accent-blue/50 transition-all duration-300 mx-auto">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </section>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t border-border-subtle py-16 px-6 md:px-12" style={{ background: "linear-gradient(180deg, #0A0A1E 0%, #04040F 100%)" }}>
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="font-brand text-[16px] tracking-[0.2em] text-text-primary uppercase">SENTINEL</span>
              <span className="font-brand text-[16px] tracking-[0.2em] text-accent-blue uppercase">ZERO</span>
            </div>
            <p className="font-ui text-[13px] text-text-secondary leading-relaxed">Human Behavioral Auditing.<br/>Privacy-first. AI-explainable.</p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-3">
              <h4 className="font-ui text-[13px] font-semibold text-text-primary mb-1 capitalize">{title}</h4>
              {links.map((link) => (
                <a key={link.label} href={link.href} className="font-ui text-[13px] text-text-secondary hover:text-text-primary transition-colors">{link.label}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="max-w-[1100px] mx-auto mt-14 pt-6 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-ui text-[12px] text-text-secondary">© 2025 Sentinel Zero. All rights reserved.</p>
          <div className="flex gap-6">
            {["GitHub", "Twitter", "LinkedIn"].map(s => (
              <a key={s} href="#" className="font-ui text-[12px] text-text-secondary hover:text-text-primary transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
