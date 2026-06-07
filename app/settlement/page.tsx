"use client";

import { useState } from "react";
import SystemFlowDiagram from "./SystemFlowDiagram";
import type {
  PoolState,
  SettlementEvent,
  SettlementOutcome,
  SigningStep,
} from "./types";

// ============================================================
// CreditPulse Settlement Layer — /settlement
//
// Sits on top of the existing credit scoring (/api/prescreen).
// Once a credit decision is approved, a smart-contract rule
// automatically disburses the loan from a shared pool — without
// any central party taking custody of the decision.
//
// The blockchain layer is SIMULATED: all state lives in the
// module-level store below (same pattern as app/tool/page.tsx).
//
// Score direction: /api/prescreen returns riskScore (higher = riskier).
// We convert to creditScore = 100 - riskScore (higher = safer) and
// disburse only when creditScore >= threshold AND both signatures
// are present AND amount <= per-loan limit.
// ============================================================

// ---- module-level simulated chain state (persists across re-renders) ----
const pool: PoolState = {
  totalCapital: 500_000,
  deployed: 0,
  stake: 50_000, // slashable stake posted by the approver
  limitPerLoan: 50_000,
  threshold: 40, // creditScore (0-100, higher = safer)
};
let events: SettlementEvent[] = [];

// ---- sample loan requests (shape matches /api/prescreen input) ----
const SAMPLE_APPLICATIONS = [
  {
    label: "Nordic MedTech ApS — strong",
    company: "Nordic MedTech ApS",
    sector: "Healthcare",
    revenue: 4_152_805,
    debt: 320_000,
    loanAmount: 35_000,
    loanPurpose: "Bridge financing ahead of a confirmed hospital contract",
    documents: ["Financial statements", "Tax returns", "Bank statements", "Business plan"],
  },
  {
    label: "GigHaul Logistics — thin / risky",
    company: "GigHaul Logistics",
    sector: "Other",
    revenue: 347_611,
    debt: 210_000,
    loanAmount: 45_000,
    loanPurpose: "Equipment purchase, irregular gig-based income",
    documents: ["Bank statements"],
  },
  {
    label: "Copenhagen Retail Co — mid",
    company: "Copenhagen Retail Co",
    sector: "Retail",
    revenue: 1_436_871,
    debt: 95_000,
    loanAmount: 25_000,
    loanPurpose: "Seasonal inventory ahead of Q4 peak",
    documents: ["Financial statements", "Bank statements", "Tax returns"],
  },
];

// ---- helpers ----
function txHash(): string {
  const id = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2)).replace(/-/g, "");
  return "0x" + id.slice(0, 40);
}
function now(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function money(n: number): string {
  return "$" + Math.round(n).toLocaleString();
}

type Scored = {
  app: (typeof SAMPLE_APPLICATIONS)[number];
  riskClass: string;
  rawRiskScore: number;
  creditScore: number; // after conversion + any collusion inflation
  realCreditScore: number; // honest value, for audit/labelling
  recommendation: string;
  rationale: string;
  inflated: boolean;
};

export default function SettlementPage() {
  const [tab, setTab] = useState<"pool" | "new" | "log">("new");

  const [selected, setSelected] = useState(SAMPLE_APPLICATIONS[0]);
  const [collusion, setCollusion] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scored, setScored] = useState<Scored | null>(null);
  const [sign, setSign] = useState<SigningStep>("idle");
  const [result, setResult] = useState<{ outcome: SettlementOutcome; reason?: string; amount: number } | null>(null);

  // re-render tick for the module-level store
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const available = pool.totalCapital - pool.deployed;

  function resetFlow() {
    setScored(null);
    setSign("idle");
    setResult(null);
    setError(null);
  }

  // ---- Step 1: call the real scoring endpoint (with demo fallback) ----
  async function runScoring() {
    setLoading(true);
    resetFlow();

    // Deterministic demo score derived from the application, used only if the
    // live scoring endpoint is unavailable (e.g. ANTHROPIC_API_KEY not set on
    // the server). Keeps the prototype demonstrable without a live key.
    function demoScore(app: (typeof SAMPLE_APPLICATIONS)[number]) {
      const debtRatio = app.debt / Math.max(app.revenue, 1);
      const docFactor = Math.max(0, 4 - app.documents.length) * 8;
      let risk = Math.round(debtRatio * 90 + docFactor + (app.revenue < 500_000 ? 25 : 0));
      risk = Math.min(95, Math.max(8, risk));
      const cls = risk <= 35 ? "low" : risk <= 65 ? "medium" : "high";
      const rec = risk <= 35 ? "approve" : risk <= 65 ? "request_more_info" : "escalate";
      return {
        riskScore: risk,
        riskClass: cls,
        recommendation: rec,
        rationale:
          "Demo score (live scoring endpoint unavailable). Derived from debt-to-revenue ratio, documentation completeness, and revenue scale.",
      };
    }

    let data: { riskScore: number; riskClass: string; recommendation: string; rationale: string };
    try {
      const res = await fetch("/api/prescreen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected),
      });
      const body = await res.json();
      if (!res.ok || typeof body.riskScore !== "number") {
        data = demoScore(selected); // fall back to demo score
      } else {
        data = body;
      }
    } catch {
      data = demoScore(selected); // network/endpoint failure → demo score
    }

    try {
      const rawRiskScore: number = Number(data.riskScore);
      const realCreditScore = 100 - rawRiskScore; // higher = safer

      // collusion mode: operator inflates the score above threshold before signing
      let creditScore = realCreditScore;
      let inflated = false;
      if (collusion && realCreditScore < pool.threshold) {
        creditScore = pool.threshold + 10;
        inflated = true;
      }

      setScored({
        app: selected,
        riskClass: data.riskClass,
        rawRiskScore,
        creditScore,
        realCreditScore,
        recommendation: data.recommendation,
        rationale: data.rationale,
        inflated,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // ---- Step 2: the two mandatory signatures ----
  function signOperator() {
    if (!scored) return;
    setSign("operator_signed");
  }
  function signHuman() {
    if (sign !== "operator_signed") return;
    setSign("both_signed");
  }

  // ---- Step 3: the settlement rule (mirrors the Solidity contract) ----
  function executeSettlement() {
    if (!scored || sign !== "both_signed") return;

    const amount = scored.app.loanAmount;
    let outcome: SettlementOutcome;
    let reason: string | undefined;

    if (scored.creditScore < pool.threshold) {
      outcome = "governance_routed";
      reason = `creditScore ${scored.creditScore} below threshold ${pool.threshold}`;
    } else if (amount > pool.limitPerLoan) {
      outcome = "governance_routed";
      reason = `amount ${money(amount)} exceeds per-loan limit ${money(pool.limitPerLoan)}`;
    } else if (amount > available) {
      outcome = "governance_routed";
      reason = "insufficient pool liquidity";
    } else {
      outcome = "disbursed";
      pool.deployed += amount;
    }

    const ev: SettlementEvent = {
      id: (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2)),
      txHash: txHash(),
      timestamp: now(),
      borrower: scored.app.company,
      sector: scored.app.sector,
      amount,
      creditScore: scored.creditScore,
      rawRiskScore: scored.rawRiskScore,
      humanSigValid: true,
      operatorSig: true,
      humanSigned: true,
      outcome,
      reason,
      collusion: scored.inflated,
    };
    events = [...events, ev];
    setResult({ outcome, reason, amount });
    refresh();
  }

  // ---- governance backstop: slash a colluding approver ----
  function slashColluder() {
    const amt = Math.min(pool.stake, pool.limitPerLoan);
    pool.stake -= amt;
    pool.deployed = Math.max(0, pool.deployed - amt); // recovered back into available liquidity
    const ev: SettlementEvent = {
      id: (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2)),
      txHash: txHash(),
      timestamp: now(),
      borrower: "—",
      sector: "—",
      amount: amt,
      creditScore: 0,
      rawRiskScore: 0,
      humanSigValid: false,
      operatorSig: false,
      humanSigned: false,
      outcome: "governance_routed",
      reason: `governance slashed colluding approver: ${money(amt)} recovered into pool`,
      collusion: true,
    };
    events = [...events, ev];
    refresh();
  }

  const canSign1 = !!scored && sign === "idle";
  const canSign2 = sign === "operator_signed";
  const canExecute = sign === "both_signed" && !result;
  const lastWasCollusionDisbursed = result?.outcome === "disbursed" && scored?.inflated;

  return (
    <main className="site-main">
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <p className="section-eyebrow">Blockchain Settlement Layer</p>
            <h1 className="section-title">On-Chain Loan Settlement</h1>
            <p style={{ color: "var(--text-muted)", maxWidth: 720 }}>
              Once a credit decision is approved, a smart contract disburses the loan from a shared pool —
              with no central party taking custody. The AI score is a signed oracle input; a human approval
              signature is a mandatory second input. The score alone never moves money.
            </p>
            <div className="section-divider" />
          </div>

          <SystemFlowDiagram
            scored={scored}
            signState={sign}
            collusion={collusion}
            outcome={result?.outcome ?? null}
            inflated={scored?.inflated ?? false}
          />

          {/* tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {([
              ["new", "New Settlement"],
              ["pool", "Pool Status"],
              ["log", `Audit Log (${events.length})`],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                className={tab === key ? "btn-primary" : "btn-ghost"}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ---------------- NEW SETTLEMENT ---------------- */}
          {tab === "new" && (
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)" }}>
              {/* left: setup */}
              <div className="card" style={{ padding: 20 }}>
                <p className="label-style">Loan request</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {SAMPLE_APPLICATIONS.map((a) => (
                    <button
                      key={a.company}
                      className={selected.company === a.company ? "btn-primary" : "btn-secondary"}
                      style={{ justifyContent: "flex-start", textAlign: "left" }}
                      disabled={loading || (sign !== "idle" && !result)}
                      onClick={() => { setSelected(a); resetFlow(); }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  <div>{selected.sector} · revenue {money(selected.revenue)}</div>
                  <div>Requested: {money(selected.loanAmount)}</div>
                  <div style={{ marginTop: 4 }}>{selected.loanPurpose}</div>
                </div>

                <label
                  style={{
                    display: "flex", alignItems: "center", gap: 10, marginTop: 18,
                    padding: "10px 12px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: collusion ? "rgba(240,96,96,0.08)" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={collusion}
                    disabled={loading || (sign !== "idle" && !result)}
                    onChange={(e) => { setCollusion(e.target.checked); resetFlow(); }}
                  />
                  <span style={{ fontSize: 13, color: collusion ? "#f06060" : "var(--text-muted)" }}>
                    Collusion mode — operator inflates the score before signing
                  </span>
                </label>

                <button
                  className="btn-primary"
                  style={{ width: "100%", marginTop: 18 }}
                  onClick={runScoring}
                  disabled={loading}
                >
                  {loading ? "Scoring…" : "Run scoring (oracle)"}
                </button>

                {error && (
                  <p style={{ color: "#f06060", fontSize: 13, marginTop: 12 }}>{error}</p>
                )}
              </div>

              {/* right: flow */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* step 1 — oracle */}
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>1 · AI score (oracle input)</strong>
                    {scored ? (
                      <span className={`badge ${scored.creditScore >= pool.threshold ? "badge-low" : "badge-high"}`}>
                        creditScore {scored.creditScore}/100
                      </span>
                    ) : (
                      <span className="badge">awaiting</span>
                    )}
                  </div>
                  {scored && (
                    <div style={{ marginTop: 10, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                      <div>
                        riskClass <strong style={{ color: "var(--text-primary)" }}>{scored.riskClass}</strong>
                        {" · "}raw riskScore {scored.rawRiskScore}/100
                        {" → "}creditScore {scored.realCreditScore}
                        {scored.inflated && (
                          <span style={{ color: "#f06060" }}> → inflated to {scored.creditScore} by operator</span>
                        )}
                      </div>
                      <div style={{ marginTop: 6 }}>{scored.rationale}</div>
                      <button
                        className={sign === "idle" ? "btn-secondary" : "btn-ghost"}
                        style={{ marginTop: 12 }}
                        onClick={signOperator}
                        disabled={!canSign1}
                      >
                        {sign === "idle" ? "Operator signs score" : "✓ score signed by operator"}
                      </button>
                    </div>
                  )}
                </div>

                {/* step 2 — human */}
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>2 · Human approver (mandatory)</strong>
                    <span className={`badge ${sign === "both_signed" ? "badge-low" : ""}`}>
                      {sign === "both_signed" ? "signed" : "required"}
                    </span>
                  </div>
                  <p style={{ marginTop: 10, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    A registered human must co-sign the same decision. The score alone cannot release funds.
                  </p>
                  <button
                    className={canSign2 ? "btn-secondary" : "btn-ghost"}
                    style={{ marginTop: 12 }}
                    onClick={signHuman}
                    disabled={!canSign2}
                  >
                    {sign === "both_signed"
                      ? "✓ approval signed"
                      : collusion
                      ? "Co-sign (colluding approver)"
                      : "Review & sign (human)"}
                  </button>
                </div>

                {/* step 3 — contract */}
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>3 · Smart contract rule</strong>
                    {result ? (
                      <span className={`badge ${result.outcome === "disbursed" ? "badge-low" : "badge-high"}`}>
                        {result.outcome === "disbursed" ? "released" : "routed to governance"}
                      </span>
                    ) : (
                      <span className="badge">rule</span>
                    )}
                  </div>
                  <pre
                    style={{
                      margin: "10px 0 0", fontSize: 12.5, color: "var(--text-muted)",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", lineHeight: 1.5,
                    }}
                  >
{`IF creditScore >= ${pool.threshold}
AND operator signed AND human signed
AND amount <= ${money(pool.limitPerLoan)}`}
                  </pre>
                  <button
                    className="btn-primary"
                    style={{ marginTop: 12 }}
                    onClick={executeSettlement}
                    disabled={!canExecute}
                  >
                    Execute settlement
                  </button>
                  {!canExecute && !result && (
                    <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                      Both signatures required before settlement can run.
                    </p>
                  )}
                </div>

                {/* outcome */}
                {result && (
                  <div
                    className="card"
                    style={{
                      padding: 18,
                      borderColor: result.outcome === "disbursed" && !scored?.inflated ? "rgba(45,212,168,0.4)" : "rgba(240,96,96,0.4)",
                    }}
                  >
                    <strong style={{ color: result.outcome === "disbursed" && !scored?.inflated ? "#2dd4a8" : "#f06060" }}>
                      {result.outcome === "disbursed"
                        ? scored?.inflated
                          ? "Bad loan disbursed — collusion risk realised"
                          : `Disbursed ${money(result.amount)} to ${scored?.app.company}`
                        : `Rejected: ${result.reason}`}
                    </strong>
                    <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                      {result.outcome === "disbursed" && !scored?.inflated &&
                        "Honest path: valid score + genuine approval → funds released, recorded on-chain."}
                      {lastWasCollusionDisbursed &&
                        "The chain verified both signatures but cannot verify the score was honest. Backstop: governance can slash the colluder."}
                      {result.outcome === "governance_routed" &&
                        "Routed to the governance mechanism for human review."}
                    </p>
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      {lastWasCollusionDisbursed && pool.stake > 0 && (
                        <button className="btn-secondary" onClick={slashColluder}>
                          Governance: slash colluding approver
                        </button>
                      )}
                      <button className="btn-ghost" onClick={resetFlow}>New loan</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------- POOL STATUS ---------------- */}
          {tab === "pool" && (
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              {[
                ["Total capital", money(pool.totalCapital)],
                ["Deployed", money(pool.deployed)],
                ["Available", money(available)],
                ["Per-loan limit", money(pool.limitPerLoan)],
                ["Score threshold", `${pool.threshold}/100`],
                ["Approver stake (slashable)", money(pool.stake)],
              ].map(([label, value]) => (
                <div key={label} className="card" style={{ padding: 20 }}>
                  <p className="label-style">{label}</p>
                  <p style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", marginTop: 6 }}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ---------------- AUDIT LOG ---------------- */}
          {tab === "log" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {events.length === 0 ? (
                <div className="card" style={{ padding: 20, color: "var(--text-muted)" }}>
                  No settlement events yet.
                </div>
              ) : (
                events.map((e) => (
                  <div key={e.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <span
                          className={`badge ${
                            e.outcome === "disbursed" ? "badge-low" : "badge-high"
                          }`}
                        >
                          {e.outcome === "disbursed" ? "disbursed" : "governance"}
                        </span>
                        {e.collusion && (
                          <span className="badge badge-high" style={{ marginLeft: 6 }}>collusion</span>
                        )}
                        <strong style={{ marginLeft: 10 }}>{e.borrower}</strong>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{e.timestamp}</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                      {e.amount > 0 && <span>{money(e.amount)} · </span>}
                      {e.creditScore > 0 && <span>creditScore {e.creditScore} (risk {e.rawRiskScore}) · </span>}
                      <span style={{ fontFamily: "ui-monospace, monospace" }}>{e.txHash.slice(0, 18)}…</span>
                      {e.reason && <div style={{ marginTop: 4 }}>{e.reason}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
