"use client";

import { useState } from "react";

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function FaqItem({ question, answer, isOpen, onClick }: FaqItemProps) {
  return (
    <div className={`faq-item ${isOpen ? "faq-open" : ""}`}>
      <button className="faq-question" onClick={onClick}>
        <span>{question}</span>
        <span className="faq-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={isOpen ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
          </svg>
        </span>
      </button>
      <div className="faq-answer-wrapper" style={{ maxHeight: isOpen ? "300px" : "0" }}>
        <div className="faq-answer">{answer}</div>
      </div>
    </div>
  );
}

const faqs = [
  {
    q: "How accurate is the AI risk classification?",
    a: "CreditPulse classifies risk using a Gemini-powered model fine-tuned on 50+ real SME loan cases. It provides a consistent, auditable baseline — every decision still routes through a human loan officer for final approval. Think of it as a senior analyst who never misses a detail.",
  },
  {
    q: "Does it integrate with existing lending software?",
    a: "CreditPulse currently runs as a standalone web tool. API integration with core banking systems (Finastra, Temenos, nCino) is on our roadmap for Phase 2. Reach out if you'd like early access to those connectors.",
  },
  {
    q: "What happens to the loan officer's judgment?",
    a: "CreditPulse is a pre-screening assistant, not an auto-approval engine. It surfaces risk signals and missing documents before human review. Final decisions always stay with the loan officer — no black boxes, no automated rejections.",
  },
  {
    q: "How is customer data handled?",
    a: "All application data is processed in-memory during the session and is never persisted beyond the review queue. We publish a full AI Use Disclosure outlining our data handling principles and compliance approach.",
  },
  {
    q: "Is CreditPulse suitable for regulated environments?",
    a: "CreditPulse is designed to support human-in-the-loop workflows aligned with EU AI Act principles for high-risk AI systems. It does not make automated decisions and provides explainable rationale for every classification. Specific regulatory certifications are under review.",
  },
  {
    q: "How much does it cost?",
    a: "CreditPulse is currently a proof-of-concept developed as part of the AI Native Enterprise course at Geneva Business School. Commercial pricing for lender deployment will be shared when Phase 2 is complete.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faq-section">
      <div className="faq-inner">
        <div className="section-header" style={{ textAlign: "center", alignItems: "center" }}>
          <span className="section-eyebrow">Questions</span>
          <h2 className="section-title">Frequently Asked</h2>
          <div className="section-divider" style={{ margin: "0 auto" }} />
        </div>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <FaqItem
              key={i}
              question={faq.q}
              answer={faq.a}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}