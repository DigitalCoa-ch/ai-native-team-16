const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconRoute = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3"/>
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
    <circle cx="18" cy="5" r="3"/>
  </svg>
);

export default function WhatWeDoPage() {
  return (
    <div className="section">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-eyebrow">Overview</span>
          <h2 className="section-title">What We Do</h2>
          <div className="section-divider" />
        </div>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon"><IconShield /></div>
            <div className="feature-title">Risk Classification</div>
            <div className="feature-body">AI classifies each application as low, medium, or high risk based on company profile and financial indicators — giving loan officers a consistent baseline before any human review begins.</div>
            <div className="feature-tag"><div className="feature-tag-dot" />AI-Driven</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><IconSearch /></div>
            <div className="feature-title">Documentation Gap Detection</div>
            <div className="feature-body">Automatically identifies missing documents against standard lending criteria so nothing gets missed. Reduces the back-and-forth that slows down decisions and frustrates applicants.</div>
            <div className="feature-tag"><div className="feature-tag-dot" />Automated</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><IconRoute /></div>
            <div className="feature-title">Escalation Routing</div>
            <div className="feature-body">Flags cases requiring senior review before they pile up. Keeps humans firmly in control at every critical decision point — no automated approvals, no black boxes.</div>
            <div className="feature-tag"><div className="feature-tag-dot" />Human-in-the-Loop</div>
          </div>
        </div>
      </div>
    </div>
  );
}