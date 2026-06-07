"use client";

// ============================================================
// SystemFlowDiagram — live, animated system diagram for /settlement
//
// Lights up each node as the user moves through the flow:
//   - scored != null        → oracle node active
//   - sign === operator_..  → oracle signed
//   - sign === both_signed  → human signed
//   - result?.outcome       → contract fires (green) or routes (amber)
//   - collusion + disbursed → risk node pulses red
//
// Pure SVG + CSS. Matches the CreditPulse palette via inline colors
// aligned to globals.css custom properties.
// ============================================================

type Props = {
  // pass these straight from page.tsx state
  scored: unknown | null;
  signState: "idle" | "operator_signed" | "both_signed";
  collusion: boolean;
  outcome: "disbursed" | "governance_routed" | null;
  inflated: boolean;
};

const ACCENT = "#00c2ff";   // --accent
const SAFE = "#2dd4a8";
const RISK = "#f06060";
const MUTED = "#3d5a80";    // --text-muted
const LINE = "rgba(255,255,255,0.12)";
const NODE_BG = "rgba(10,22,40,0.7)"; // --glass-bg
const NODE_BORDER = "rgba(255,255,255,0.10)";

export default function SystemFlowDiagram({
  scored,
  signState,
  collusion,
  outcome,
  inflated,
}: Props) {
  const oracleActive = scored != null;
  const oracleSigned = signState === "operator_signed" || signState === "both_signed";
  const humanSigned = signState === "both_signed";
  const fired = outcome != null;
  const disbursed = outcome === "disbursed";
  const riskHot = collusion && disbursed && inflated;

  // helpers for state-driven styling
  const nodeStroke = (active: boolean, color = ACCENT) => (active ? color : NODE_BORDER);
  const nodeText = (active: boolean) => (active ? "#e8f0fe" : MUTED);
  const flowStroke = (active: boolean, color = ACCENT) => (active ? color : LINE);

  return (
    <div
      style={{
        width: "100%",
        background: "linear-gradient(180deg, rgba(0,194,255,0.04), transparent)",
        border: "1px solid var(--border, rgba(255,255,255,0.07))",
        borderRadius: "var(--radius-md, 8px)",
        padding: "18px 12px 8px",
        marginBottom: 24,
      }}
    >
      <style>{`
        @keyframes cpPulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
        @keyframes cpDash  { to { stroke-dashoffset: -16 } }
        .cp-flow-active { stroke-dasharray: 5 4; animation: cpDash .7s linear infinite; }
        .cp-risk-hot    { animation: cpPulse 1s ease-in-out infinite; }
        .cp-node        { transition: all .45s cubic-bezier(0.4,0,0.2,1); }
        .cp-label       { font-family: ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      <svg viewBox="0 0 920 300" width="100%" style={{ display: "block", maxHeight: 300 }}>
        {/* ---------- governance (top) ---------- */}
        <g className="cp-node">
          <rect x="330" y="14" width="260" height="46" rx="8"
            fill={NODE_BG} stroke={nodeStroke(fired, "#7aa2c2")} strokeWidth="1.5" />
          <text x="460" y="34" textAnchor="middle" className="cp-label"
            fontSize="13" fontWeight="700" fill={nodeText(true)}>GOVERNANCE</text>
          <text x="460" y="50" textAnchor="middle" className="cp-label"
            fontSize="10" fill={MUTED}>multi-sig · disputes · slash · freeze</text>
        </g>
        {/* governance → contract (dashed control line) */}
        <line x1="460" y1="60" x2="460" y2="120" stroke={flowStroke(fired, "#7aa2c2")}
          strokeWidth="1.4" strokeDasharray="4 4" />

        {/* ---------- left column: actors / inputs ---------- */}
        {/* oracle (AI score) */}
        <g className="cp-node">
          <rect x="20" y="96" width="220" height="48" rx="8"
            fill={NODE_BG} stroke={nodeStroke(oracleActive, oracleSigned ? SAFE : ACCENT)} strokeWidth="1.5" />
          <circle cx="44" cy="120" r="6" fill={oracleSigned ? SAFE : oracleActive ? ACCENT : MUTED} />
          <text x="60" y="116" className="cp-label" fontSize="12.5" fontWeight="700" fill={nodeText(oracleActive)}>AI score · oracle</text>
          <text x="60" y="132" className="cp-label" fontSize="10" fill={MUTED}>
            {oracleSigned ? "signed by operator" : oracleActive ? "scored — awaiting signature" : "off-chain input"}
          </text>
        </g>

        {/* human approver */}
        <g className="cp-node">
          <rect x="20" y="170" width="220" height="48" rx="8"
            fill={NODE_BG} stroke={nodeStroke(humanSigned, SAFE)} strokeWidth="1.5" />
          <circle cx="44" cy="194" r="6" fill={humanSigned ? SAFE : MUTED} />
          <text x="60" y="190" className="cp-label" fontSize="12.5" fontWeight="700" fill={nodeText(humanSigned)}>Human approver</text>
          <text x="60" y="206" className="cp-label" fontSize="10" fill={MUTED}>
            {humanSigned ? "co-signed (mandatory)" : "must co-sign"}
          </text>
        </g>

        {/* inputs → contract */}
        <line x1="240" y1="120" x2="360" y2="150"
          className={oracleSigned ? "cp-flow-active" : ""}
          stroke={flowStroke(oracleSigned, oracleSigned ? SAFE : ACCENT)} strokeWidth="2" />
        <line x1="240" y1="194" x2="360" y2="158"
          className={humanSigned ? "cp-flow-active" : ""}
          stroke={flowStroke(humanSigned, SAFE)} strokeWidth="2" />

        {/* ---------- center: smart contract ---------- */}
        <g className="cp-node">
          <rect x="360" y="120" width="200" height="72" rx="10"
            fill={NODE_BG}
            stroke={fired ? (disbursed ? (riskHot ? RISK : SAFE) : RISK) : (humanSigned ? ACCENT : NODE_BORDER)}
            strokeWidth="2.2" />
          <text x="460" y="148" textAnchor="middle" className="cp-label" fontSize="13" fontWeight="700"
            fill={nodeText(humanSigned || fired)}>SMART CONTRACT</text>
          <text x="460" y="166" textAnchor="middle" className="cp-label" fontSize="9.5" fill={MUTED}>score ≥ 40 · both signed</text>
          <text x="460" y="180" textAnchor="middle" className="cp-label" fontSize="9.5" fill={MUTED}>amount ≤ limit</text>
        </g>

        {/* contract → output */}
        <line x1="560" y1="150" x2="680" y2="135"
          className={fired ? "cp-flow-active" : ""}
          stroke={flowStroke(disbursed, riskHot ? RISK : SAFE)} strokeWidth="2.4" />
        {/* contract → reject */}
        <line x1="560" y1="166" x2="680" y2="210"
          className={fired && !disbursed ? "cp-flow-active" : ""}
          stroke={flowStroke(fired && !disbursed, RISK)} strokeWidth="2" />

        {/* ---------- right: outcomes ---------- */}
        {/* disburse → borrower */}
        <g className="cp-node">
          <rect x="680" y="110" width="220" height="50" rx="8"
            fill={NODE_BG} stroke={nodeStroke(disbursed, riskHot ? RISK : SAFE)} strokeWidth="1.5" />
          <circle cx="704" cy="135" r="6" fill={disbursed ? (riskHot ? RISK : SAFE) : MUTED} />
          <text x="720" y="131" className="cp-label" fontSize="12.5" fontWeight="700" fill={nodeText(disbursed)}>Funds → borrower</text>
          <text x="720" y="147" className="cp-label" fontSize="10" fill={MUTED}>
            {riskHot ? "bad loan released" : disbursed ? "disbursed on-chain" : "output"}
          </text>
        </g>

        {/* governance route */}
        <g className="cp-node">
          <rect x="680" y="186" width="220" height="48" rx="8"
            fill={NODE_BG} stroke={nodeStroke(fired && !disbursed, RISK)} strokeWidth="1.5" />
          <text x="790" y="206" textAnchor="middle" className="cp-label" fontSize="12" fontWeight="700"
            fill={nodeText(fired && !disbursed)}>Routed to governance</text>
          <text x="790" y="222" textAnchor="middle" className="cp-label" fontSize="10" fill={MUTED}>rejected / disputed</text>
        </g>

        {/* ---------- risk point (bottom) ---------- */}
        <g className={riskHot ? "cp-risk-hot" : "cp-node"}>
          <rect x="300" y="250" width="320" height="40" rx="8"
            fill={riskHot ? "rgba(240,96,96,0.12)" : NODE_BG}
            stroke={riskHot ? RISK : NODE_BORDER} strokeWidth={riskHot ? 2 : 1.4}
            strokeDasharray="6 4" />
          <text x="460" y="266" textAnchor="middle" className="cp-label" fontSize="11.5" fontWeight="700"
            fill={riskHot ? RISK : MUTED}>RISK POINT — oracle failure / collusion</text>
          <text x="460" y="281" textAnchor="middle" className="cp-label" fontSize="9.5"
            fill={riskHot ? "#f8a5a5" : MUTED}>a validly-signed wrong score still passes the rule</text>
        </g>
        {/* link risk to oracle */}
        <line x1="130" y1="144" x2="320" y2="258" stroke={riskHot ? RISK : LINE} strokeWidth="1"
          strokeDasharray="3 3" className={riskHot ? "cp-risk-hot" : ""} />
      </svg>
    </div>
  );
}