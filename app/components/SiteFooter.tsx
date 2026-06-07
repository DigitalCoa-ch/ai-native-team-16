"use client";

import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "The Tool", href: "/tool" },
    { label: "Settlement", href: "/settlement" },
    { label: "What We Do", href: "/what-we-do" },
    { label: "About Us", href: "/about" },
  ],
  Resources: [
    { label: "AI Use Disclosure", href: "/ai-use-disclosure" },
  ],
};

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L4 7v10c0 6.627 5.12 12.886 12 15 6.88-2.114 12-8.373 12-15V7L16 2z"
                stroke="#00c2ff" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(0,194,255,0.08)"/>
              <polyline points="6,18 10,18 12,12 14,22 16,14 18,18 20,18 26,18"
                stroke="#00c2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M13 18l2 2 4-4" stroke="#00c2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
            </svg>
          </div>
          <div>
            <div className="footer-brand-name">CreditPulse</div>
            <div className="footer-brand-sub">AI credit pre-screening for SME lenders</div>
          </div>
        </div>

        <div className="footer-links">
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="footer-link-group">
              <div className="footer-link-heading">{group}</div>
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} CreditPulse — Team 16, Geneva Business School</span>
        <span className="footer-meta">Built with Gemini AI & Next.js</span>
      </div>
    </footer>
  );
}