"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/what-we-do", label: "What We Do" },
    { href: "/tool", label: "The Tool" },
    { href: "/settlement", label: "Settlement" },
    { href: "/about", label: "About Us" },
  ];

  return (
    <header className="site-header" id="site-header">
      <div className="header-inner">
        <div className="header-brand">
          <Link href="/" className="brand-link">
            <div className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L4 7v10c0 6.627 5.12 12.886 12 15 6.88-2.114 12-8.373 12-15V7L16 2z"
                  stroke="#00c2ff" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(0,194,255,0.08)"/>
                <polyline points="6,18 10,18 12,12 14,22 16,14 18,18 20,18 26,18"
                  stroke="#00c2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M13 18l2 2 4-4" stroke="#00c2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
              </svg>
            </div>
            <span className="brand-name">CreditPulse</span>
          </Link>
        </div>
        <nav className="header-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className={"nav-link" + (isActive ? " active" : "")}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}