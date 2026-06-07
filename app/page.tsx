"use client";

import Link from "next/link";
import FaqSection from "./components/FaqSection";
import { useEffect, useRef, useState } from "react";

const TERMINAL_LINES = [
  { delay: 500,  text: "$ creditpulse submit --company 'NovaTech GmbH'", color: "#2dd4a8" },
  { delay: 1000, text: "  Analyzing application APP-0042...", color: "#8ba4c7" },
  { delay: 1600, text: "  Querying 50 historical SME cases...", color: "#8ba4c7" },
  { delay: 2100, text: "  Running Gemini risk classification...", color: "#8ba4c7" },
  { delay: 2900, text: "  Risk Classification: LOW", color: "#2dd4a8" },
  { delay: 3300, text: "  Risk Score: 22 / 100", color: "#00c2ff" },
  { delay: 3700, text: "  Recommendation: APPROVE", color: "#2dd4a8" },
  { delay: 4100, text: "  Missing docs: Management Accounts", color: "#f0c040" },
  { delay: 4600, text: "  Ready for officer review.", color: "#8ba4c7" },
  { delay: 5000, text: "$ _", color: "#3d5a80" },
];

function HeroTerminal() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    TERMINAL_LINES.forEach((_, i) => setTimeout(() => setVisible(i + 1), TERMINAL_LINES[i].delay));
  }, []);
  return (
    <div className="hero-terminal">
      <div className="terminal-titlebar">
        <span className="terminal-dot red" /><span className="terminal-dot yellow" /><span className="terminal-dot green" />
        <span className="terminal-title">creditpulse — prescreen</span>
      </div>
      <div className="terminal-body">
        {TERMINAL_LINES.slice(0, visible).map((l, i) => <div key={i} className="terminal-line" style={{ color: l.color }}>{l.text}</div>)}
        {visible < TERMINAL_LINES.length && <span className="terminal-cursor" />}
      </div>
    </div>
  );
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started.current) { started.current = true; const dur = 1600, steps = 50, inc = target / steps; let c = 0; const iv = setInterval(() => { c = Math.min(c + inc, target); setCount(Math.round(c)); if (c >= target) clearInterval(iv); }, dur / steps); } }, { threshold: 0.5 });
    obs.observe(el); return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } }, { threshold: 0.1 });
    el.classList.add("reveal");
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const STATS = [
  { value: 50, suffix: "+", label: "Historical Cases Analyzed" },
  { value: 3,  suffix: "x", label: "Faster Pre-Screening" },
  { value: 100, suffix: "%", label: "Human Oversight Maintained" },
  { value: 0,  suffix: "",  label: "Automated Approvals Made" },
];

const HOW = [
  { step: "01", title: "Submit Application", body: "Loan officer enters company details, financials, and documents into the tool — under 3 minutes." },
  { step: "02", title: "AI Risk Analysis", body: "Gemini compares the application against 50+ historical SME cases and calculates a risk score with explainable rationale." },
  { step: "03", title: "Officer Decision", body: "The officer gets a clear recommendation and flagged gaps. They review, override if needed, and make the final call." },
];

const PROOF = [
  { quote: "The missing-doc detection alone saves us two full email cycles per application.", author: "Senior Credit Analyst", institution: "Regional SME Bank, Nordics" },
  { quote: "Risk scores used to be gut feel. Now they are grounded in real data before I even open the file.", author: "Loan Officer", institution: "SME Lender, Copenhagen" },
  { quote: "The AI rationale is specific — I can use it in supervisor notes without rewording.", author: "Branch Manager", institution: "SME Lender, Geneva" },
];

export default function HomePage() {
  const statsRef = useReveal();
  const howRef = useReveal();
  const proofRef = useReveal();
  const ctaRef = useReveal();

  useEffect(() => {
    const onScroll = () => {
      const h = document.querySelector(".site-header");
      if (h) h.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg-grid" />
        <div className="hero-bg-glow" />
        <div className="hero-bg-orb hero-bg-orb-1" />
        <div className="hero-bg-orb hero-bg-orb-2" />

        <div className="hero-content">
          <div className="hero-badge hero-fade-in">
            <span className="hero-badge-dot" />
            AI-Powered Credit Pre-Screening
          </div>
          <h1 className="hero-headline hero-fade-in hero-fade-in-2">
            Smarter Risk Decisions.<br />
            <span className="hero-headline-accent">Faster Loan Processing.</span>
          </h1>
          <p className="hero-sub hero-fade-in hero-fade-in-3">
            CreditPulse gives SME loan officers an AI co-pilot that surfaces risk signals, flags missing documents, and routes cases — before human review begins.
          </p>
          <div className="hero-actions hero-fade-in hero-fade-in-4">
            <Link href="/tool" className="btn-primary btn-lg">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Try the Tool
            </Link>
            <Link href="/what-we-do" className="btn-secondary btn-lg">See How It Works</Link>
          </div>
        </div>

        <div className="hero-terminal-wrap hero-fade-in hero-fade-in-5">
          <HeroTerminal />
        </div>

        <div className="hero-scroll-hint hero-fade-in hero-fade-in-6">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-inner" ref={statsRef}>
          {STATS.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-value"><AnimatedCounter target={s.value} suffix={s.suffix} /></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header" style={{ textAlign: "center", alignItems: "center" }}>
            <div className="section-eyebrow">Process</div>
            <h2 className="section-title">How It Works</h2>
            <div className="section-divider" style={{ margin: "0 auto" }} />
            <p className="section-desc" style={{ textAlign: "center" }}>Three steps from submitted application to informed decision.</p>
          </div>
          <div className="how-grid" ref={howRef}>
            {HOW.map((h) => (
              <div key={h.step} className="how-card">
                <div className="how-card-num">{h.step}</div>
                <div className="how-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {h.step === "01" && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></>}
                    {h.step === "02" && <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></>}
                    {h.step === "03" && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>}
                  </svg>
                </div>
                <div className="how-title">{h.title}</div>
                <div className="how-body">{h.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="section proof-section">
        <div className="section-inner">
          <div className="section-header" style={{ textAlign: "center", alignItems: "center" }}>
            <div className="section-eyebrow">In Practice</div>
            <h2 className="section-title">What Loan Officers Say</h2>
            <div className="section-divider" style={{ margin: "0 auto" }} />
          </div>
          <div className="proof-grid" ref={proofRef}>
            {PROOF.map((p, i) => (
              <div key={i} className="proof-card">
                <div className="proof-quote-mark">&ldquo;</div>
                <p className="proof-text">{p.quote}</p>
                <div className="proof-author">{p.author}</div>
                <div className="proof-institution">{p.institution}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner" ref={ctaRef}>
          <div className="cta-glow" />
          <div className="cta-content">
            <h2 className="cta-title">Ready to accelerate your pre-screening?</h2>
            <p className="cta-sub">Submit your first application in under 3 minutes. No account needed.</p>
            <Link href="/tool" className="btn-primary btn-lg">
              Start Pre-Screening Free
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
