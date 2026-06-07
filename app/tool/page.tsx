"use client";

import { useState, useEffect } from "react";

type RiskClass = "low" | "medium" | "high";
type Decision = "approve" | "request_more_info" | "escalate" | "reject";
type AppStatus = "pending" | Decision;
type Tab = "input" | "results" | "queue";

interface Application {
  id: string; company: string; sector: string;
  revenue: number; debt: number; loanAmount: number;
  loanPurpose: string; documents: string[];
  aiResult?: AiResult; status: AppStatus; createdAt: string;
}
interface AiResult {
  riskClass: RiskClass; riskScore: number;
  missingDocs: string[]; recommendation: Decision; rationale: string;
}

const IconDocument = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconTrendUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconInbox = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--text-muted)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <span>{children}</span>
      <span style={{ flex: 1, height: 1, background: "var(--divider)" }} />
    </div>
  );
}

function InputForm({ onSubmit }: { onSubmit: (app: Omit<Application, "id" | "status" | "createdAt">) => void }) {
  const [company, setCompany] = useState("");
  const [sector, setSector] = useState("");
  const [revenue, setRevenue] = useState("");
  const [debt, setDebt] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [docChecklist, setDocChecklist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sectors = ["Retail","Manufacturing","Wholesale","Services","Construction","Transportation","Agriculture","Healthcare","Hospitality","Other"];
  const allDocs = ["Audited Financial Statements (2 years)","Management Accounts (recent)","Tax Returns (2 years)","Bank Statements (6 months)","Business Plan","Certificate of Incorporation","Trade References","Asset Register"];

  const toggleDoc = (doc: string) => {
    setDocChecklist((prev) => prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!company || !sector || !revenue || !debt || !loanAmount || !loanPurpose) { setError("Please fill in all required fields."); return; }
    setLoading(true);
    try { onSubmit({ company, sector, revenue: parseFloat(revenue), debt: parseFloat(debt), loanAmount: parseFloat(loanAmount), loanPurpose, documents: docChecklist }); }
    finally { setLoading(false); }
  };

  return (
    <div className="card animate-in" style={{ padding: 0 }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--divider)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", boxShadow: "0 0 12px rgba(0, 194, 255, 0.1)" }}>
          <IconDocument />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>New Application</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.04em", marginTop: 2 }}>Submit loan details for AI pre-screening</div>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>Company Details</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div><label className="label-style">Company Name *</label><input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="input-style" placeholder="Acme Corp Ltd" /></div>
            <div><label className="label-style">Business Sector *</label><select value={sector} onChange={(e) => setSector(e.target.value)} className="input-style"><option value="">Select sector</option>{sectors.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>Financial Data</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div><label className="label-style">Annual Revenue ($) *</label><input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="input-style" placeholder="500000" min="0" /></div>
            <div><label className="label-style">Existing Debt ($) *</label><input type="number" value={debt} onChange={(e) => setDebt(e.target.value)} className="input-style" placeholder="100000" min="0" /></div>
            <div><label className="label-style">Loan Amount Requested ($) *</label><input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className="input-style" placeholder="50000" min="0" /></div>
            <div><label className="label-style">Loan Purpose *</label><input type="text" value={loanPurpose} onChange={(e) => setLoanPurpose(e.target.value)} className="input-style" placeholder="Working capital, equipment, expansion..." /></div>
          </div>
        </div>
        <div style={{ marginBottom: 28 }}>
          <SectionLabel>Available Documents</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 8 }}>
            {allDocs.map((doc) => (
              <label key={doc} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: docChecklist.includes(doc) ? "rgba(0, 194, 255, 0.04)" : "rgba(255,255,255,0.02)", border: "1px solid " + (docChecklist.includes(doc) ? "var(--border-accent)" : "var(--border-subtle)"), borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all var(--transition)", fontSize: 12, color: docChecklist.includes(doc) ? "var(--text-secondary)" : "var(--text-muted)" }}>
                <input type="checkbox" checked={docChecklist.includes(doc)} onChange={() => toggleDoc(doc)} />
                <span>{doc}</span>
              </label>
            ))}
          </div>
        </div>
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "rgba(240, 96, 96, 0.06)", border: "1px solid rgba(240, 96, 96, 0.2)", borderRadius: "var(--radius-md)", marginBottom: 16, fontSize: 13, color: "#f06060" }}>
            <IconAlert /> {error}
          </div>
        )}
        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
          {loading ? (
            <><span style={{ width: 14, height: 14, border: "2px solid rgba(2,11,24,0.3)", borderTopColor: "#020b18", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} /> AI is analyzing...</>
          ) : (
            <><IconTrendUp /> Submit for AI Pre-Screening</>
          )}
        </button>
      </form>
    </div>
  );
}

function Results({ app, onBack }: { app: Application; onBack: () => void }) {
  const result = app.aiResult;
  if (!result) return null;
  const recConfig: Record<Decision, { label: string; cls: string; icon: string }> = {
    approve:           { label: "Approve",            cls: "rec-approve",  icon: "\u2713" },
    request_more_info:  { label: "Request More Info",  cls: "rec-info",    icon: "\u2197" },
    escalate:           { label: "Escalate",            cls: "rec-escalate", icon: "\u26a0" },
    reject:             { label: "Reject",              cls: "rec-reject",  icon: "\u2715" },
  };
  const rec = recConfig[result.recommendation];
  const riskColor = result.riskClass === "low" ? "#2dd4a8" : result.riskClass === "medium" ? "#f0c040" : "#f06060";

  return (
    <div className="card animate-in" style={{ padding: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "20px 24px", borderBottom: "1px solid var(--divider)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{app.company}</span>
            <span className={"badge badge-" + app.sector.toLowerCase().replace(/\s+/g, "-")}>{app.sector}</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.04em" }}>Application {app.id} &mdash; {new Date(app.createdAt).toLocaleString()}</span>
        </div>
        <button onClick={onBack} className="btn-ghost">&#8592; New Application</button>
      </div>
      <div style={{ padding: "0 24px 24px" }}>
        <div className="result-stats">
          <div className="result-stat">
            <span className="result-stat-label">Risk Classification</span>
            <span className="result-stat-value" style={{ color: riskColor }}>{result.riskClass.toUpperCase()}</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-label">Risk Score</span>
            <span className="result-stat-value accent-value">{result.riskScore}/100</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-label">Missing Documents</span>
            <span className="result-stat-value" style={{ color: result.missingDocs.length > 0 ? "#f06060" : "#2dd4a8" }}>{result.missingDocs.length}</span>
          </div>
        </div>
        <div className="rationale-block">
          <div className="rationale-label">Analysis Rationale</div>
          <div className="rationale-text">{result.rationale}</div>
        </div>
        <div className={"recommendation-block " + rec.cls}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>{rec.icon}</span>
          <div className="rec-text">
            <span className="rec-label">Recommended Action</span>
            <span className="rec-value">{rec.label}</span>
          </div>
        </div>
        {result.missingDocs.length > 0 && (
          <div className="missing-docs">
            <div className="missing-docs-label">Missing Documents ({result.missingDocs.length})</div>
            {result.missingDocs.map((doc) => (
              <div key={doc} className="missing-doc-item">
                <div className="missing-doc-dot" />
                <span className="missing-doc-text">{doc}</span>
              </div>
            ))}
          </div>
        )}
        <div className="notice">
          <span className="notice-icon">&#10687;</span>
          <span><strong>Human Review:</strong> This is a recommendation only. A loan officer must review and make the final decision in the Review Queue tab.</span>
        </div>
        <div className="app-footer">
          <span className="app-footer-text">Application ID: {app.id} &nbsp;&nbsp;|&nbsp;&nbsp; {new Date(app.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function ReviewQueue({ apps, onUpdate }: { apps: Application[]; onUpdate: (id: string, status: AppStatus) => void }) {
  const recLabel: Record<Decision, string> = {
    approve: "\u2713 Approve",
    request_more_info: "\u2197 More Info",
    escalate: "\u26a0 Escalate",
    reject: "\u2715 Reject",
  };

  if (apps.length === 0) {
    return (
      <div className="card animate-in" style={{ padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ color: "var(--text-muted)", opacity: 0.35 }}><IconInbox /></div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)", marginTop: 20, marginBottom: 8 }}>No applications in queue</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.6 }}>Submit an application above to see it here after AI pre-screening.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="queue-header">
        <span className="queue-title">Review Queue</span>
        <span className="queue-count">{apps.length} application{apps.length !== 1 ? "s" : ""}</span>
      </div>
      {apps.map((app) => {
        return (
          <div key={app.id} className="queue-item">
            <div className="queue-item-header">
              <div className="queue-item-left">
                <div className="queue-item-company">{app.company}</div>
                <div className="queue-item-badges">
                  <span className={"badge badge-" + app.sector.toLowerCase().replace(/\s+/g, "-")}>{app.sector}</span>
                  {app.aiResult && <span className={"badge badge-" + app.aiResult.riskClass}>{app.aiResult.riskClass.toUpperCase()}</span>}
                  <span className={"badge badge-" + (app.status === "pending" ? "pending" : app.status)}>
                    {app.status === "pending" ? "\u23f3 Pending" : recLabel[app.status as Decision]}
                  </span>
                </div>
              </div>
              {app.status === "pending" && (
                <div className="queue-item-actions">
                  <button onClick={() => onUpdate(app.id, "approve")} className="btn-primary" style={{ padding: "8px 14px", fontSize: 12 }}>\u2713 Approve</button>
                  <button onClick={() => onUpdate(app.id, "request_more_info")} className="btn-secondary" style={{ padding: "8px 14px", fontSize: 12 }}>\u2197 More Info</button>
                  <button onClick={() => onUpdate(app.id, "escalate")} className="btn-secondary" style={{ padding: "8px 14px", fontSize: 12, color: "#f0c040" }}>\u26a0 Escalate</button>
                  <button onClick={() => onUpdate(app.id, "reject")} className="btn-secondary" style={{ padding: "8px 14px", fontSize: 12, color: "#f06060" }}>\u2715 Reject</button>
                </div>
              )}
            </div>
            <div className="queue-item-data">
              <div className="queue-data-item">
                <span className="queue-data-label">Revenue</span>
                <span className="queue-data-value">${app.revenue.toLocaleString()}</span>
              </div>
              <div className="queue-data-item">
                <span className="queue-data-label">Debt</span>
                <span className="queue-data-value">${app.debt.toLocaleString()}</span>
              </div>
              <div className="queue-data-item">
                <span className="queue-data-label">Loan Requested</span>
                <span className="queue-data-value">${app.loanAmount.toLocaleString()}</span>
              </div>
              <div className="queue-data-item">
                <span className="queue-data-label">Purpose</span>
                <span className="queue-data-value" style={{ fontSize: 12 }}>{app.loanPurpose}</span>
              </div>
            </div>
            <div className="queue-item-footer">
              <span className="queue-item-id">ID: {app.id} &nbsp;&nbsp;|&nbsp;&nbsp; {new Date(app.createdAt).toLocaleString()}</span>
              {app.aiResult && app.aiResult.missingDocs.length > 0 && (
                <span className="queue-missing-docs">\u2715 {app.aiResult.missingDocs.length} missing doc{app.aiResult.missingDocs.length !== 1 ? "s" : ""}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

let store: Application[] = [];
let nextId = 1;
function generateId() { return "APP-" + String(nextId++).padStart(4, "0"); }

export default function ToolPage() {
  const [activeTab, setActiveTab] = useState<Tab>("input");
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);
  const [queue, setQueue] = useState<Application[]>([]);

  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);

  const handleSubmit = async (appData: Omit<Application, "id" | "status" | "createdAt">) => {
    try {
      const res = await fetch("/api/prescreen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appData),
      });
      if (!res.ok) throw new Error("AI service unavailable");
      const aiResult: AiResult = await res.json();
      const newApp: Application = {
        ...appData, id: generateId(), status: "pending",
        createdAt: new Date().toISOString(), aiResult,
      };
      store = [newApp, ...store];
      setSubmittedApp(newApp);
      setActiveTab("results");
    } catch (err) {
      alert("AI pre-screening failed. Please try again.");
      console.error(err);
    }
  };

  const handleUpdate = (id: string, status: AppStatus) => {
    store = store.map((a) => (a.id === id ? { ...a, status } : a));
    setQueue([...store]);
  };

  const openQueue = () => {
    setQueue([...store]);
    setActiveTab("queue");
  };

  return (
    <div className="tool-page">
      <div className="tab-nav">
        <button className={"tab-btn" + (activeTab === "input" ? " active" : "")} onClick={() => setActiveTab("input")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Input Form
        </button>
        <button className={"tab-btn" + (activeTab === "results" ? " active" : "")} onClick={() => submittedApp && setActiveTab("results")} disabled={!submittedApp}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          AI Results
        </button>
        <button className={"tab-btn" + (activeTab === "queue" ? " active" : "")} onClick={openQueue}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          Review Queue
        </button>
      </div>
      {activeTab === "input" && <InputForm onSubmit={handleSubmit} />}
      {activeTab === "results" && submittedApp && (
        <Results app={submittedApp} onBack={() => { setSubmittedApp(null); setActiveTab("input"); }} />
      )}
      {activeTab === "queue" && <ReviewQueue apps={queue} onUpdate={handleUpdate} />}
    </div>
  );
}
