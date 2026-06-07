// Score direction note:
// /api/prescreen returns riskScore 0-100 where HIGHER = riskier (100 = highest risk).
// The settlement rule needs HIGHER = safer for threshold comparison.
// Conversion: creditScore = 100 - riskScore  →  0 = worst, 100 = best (most creditworthy).
// Disbursement threshold: creditScore >= 40  (i.e. riskScore <= 60, matching "low" riskClass).
// This is explicitly checked in runSettlementRule() below.

export type SettlementOutcome = "disbursed" | "governance_routed";

export type PoolState = {
  totalCapital: number;  // total pool in dollars
  deployed: number;      // currently loaned out
  stake: number;         // slashable stake per approver (dollars)
  limitPerLoan: number;  // max disbursement per loan
  threshold: number;     // min creditScore to pass (already creditScore direction, not riskScore)
};

export type SettlementEvent = {
  id: string;
  txHash: string;
  timestamp: string;
  borrower: string;
  sector: string;
  amount: number;
  creditScore: number;     // 0-100, higher = safer (converted from riskScore)
  rawRiskScore: number;   // original riskScore from /api/prescreen for audit
  humanSigValid: boolean;
  operatorSig: boolean;   // true = operator signed (oracle input)
  humanSigned: boolean;   // true = human approver signed
  outcome: SettlementOutcome;
  reason?: string;
  collusion: boolean;     // true if this was a collusion-mode disbursement
};

export type SigningStep = "idle" | "operator_signed" | "both_signed";