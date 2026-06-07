"use client";

import { useEffect, useRef } from "react";

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

const WHY = [
  { title: "Speed Without Shortcuts", body: "Traditional pre-screening takes hours of manual case review. CreditPulse compresses that to minutes — not by skipping steps, but by automating the data comparison work that humans find repetitive and error-prone." },
  { title: "Consistency at Scale", body: "A junior officer and a senior analyst can review the same application differently based on experience or workload. CreditPulse applies the same benchmark to every submission — grounded in real historical cases, not gut feel." },
  { title: "Human Oversight, Always", body: "CreditPulse is designed to augment loan officers, not replace them. Every recommendation includes a rationale the officer can understand, challenge, and override. No automated decisions. No black boxes." },
  { title: "Built on Real Data", body: "The risk model is grounded in 50 real SME loan cases across industries and geographies. It doesn't guess — it compares new applications to a documented historical baseline and explains why a case looks the way it does." },
];

const PROFILES = [
  { initials: "VK", name: "Viktor Kloefsrud", origin: "Norway", role: "Co-Founder & Developer", focus: "Product architecture, AI integration, and technical delivery." },
  { initials: "MB", name: "Mathies Bjerre", origin: "Denmark", role: "Co-Founder & Analyst", focus: "Credit risk modeling, UX research, and SME lending domain expertise." },
  { initials: "QR", name: "Quinn Rooney", origin: "Colorado, USA", role: "Co-Founder & Designer", focus: "Visual design, frontend implementation, and interaction patterns." },
];

const ICONS = [
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
];

export default function AboutPage() {
  const whyRef = useReveal();
  const profilesRef = useReveal();
  const missionRef = useReveal();

  return (
    <div className="section">
      {/* Why CreditPulse */}
      <div className="section-inner" style={{ marginBottom: 80 }}>
        <div className="section-header">
          <div className="section-eyebrow">The Rationale</div>
          <h2 className="section-title">Why CreditPulse</h2>
          <div className="section-divider" />
          <p className="section-desc">SME lending is under pressure from two sides: too many applications and too little time to review them properly. CreditPulse resolves that tension — not by automating judgment, but by doing the analytical groundwork that makes good judgment faster.</p>
        </div>
        <div className="why-grid" ref={whyRef}>
          {WHY.map((w, i) => (
            <div key={w.title} className="why-card">
              <div className="why-icon">{ICONS[i]}</div>
              <div className="why-title">{w.title}</div>
              <div className="why-body">{w.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="section-inner" style={{ marginBottom: 80 }}>
        <div className="section-header">
          <div className="section-eyebrow">The Team</div>
          <h2 className="section-title">Meet the People Behind It</h2>
          <div className="section-divider" />
        </div>
        <div className="profile-cards" ref={profilesRef}>
          {PROFILES.map((p) => (
            <div key={p.name} className="profile-card">
              <div className="profile-avatar-lg">{p.initials}</div>
              <div className="profile-role">{p.role}</div>
              <div className="profile-name-lg">{p.name}</div>
              <div className="profile-origin-badge">{p.origin}</div>
              <div className="profile-focus">{p.focus}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="section-inner" ref={missionRef}>
        <div className="mission-card card">
          <div className="mission-eyebrow">Our Mission</div>
          <blockquote className="mission-text">
            &ldquo;To give every SME loan officer a second pair of eyes that never gets tired, never misses a document, and always explains its thinking — so humans can make better decisions, faster.&rdquo;
          </blockquote>
          <div className="mission-sub">Second-semester students at Geneva Business School, building CreditPulse as part of the AI Native Enterprise course — applying real AI tooling to a genuine problem in SME finance.</div>
        </div>
      </div>
    </div>
  );
}
