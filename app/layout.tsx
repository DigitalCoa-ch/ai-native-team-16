import NavBar from "./components/NavBar";
import SiteFooter from "./components/SiteFooter";
import "./globals.css";

export const metadata = {
  title: "CreditPulse — AI Credit Pre-Screening for SME Lenders",
  description: "AI-powered credit pre-screening for loan officers at SME-focused lenders. Faster decisions, consistent risk classification, human oversight maintained.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='M16 2L4 7v10c0 6.627 5.12 12.886 12 15 6.88-2.114 12-8.373 12-15V7L16 2z' fill='none' stroke='%2300c2ff' stroke-width='1.5'/></svg>" />
      </head>
      <body>
        <NavBar />
        <main className="site-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}