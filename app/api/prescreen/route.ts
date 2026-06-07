import { NextRequest, NextResponse } from "next/server";

const TIMEOUT_MS = 30_000;

async function genAIWithTimeout(apiKey: string, prompt: string): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`AI request timed out after ${TIMEOUT_MS / 1000} seconds.`)), TIMEOUT_MS)
  );

  const fetchPromise = fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const res = await Promise.race([fetchPromise, timeoutPromise]) as Response;

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.content[0].text.trim();
}

const HISTORICAL_CASES = [
  { annual_revenue: 2768228, credit_score: 833, late_payments: 8, industry: "Healthcare" },
  { annual_revenue: 3038995, credit_score: 533, late_payments: 1, industry: "Technology" },
  { annual_revenue: 4442427, credit_score: 833, late_payments: 3, industry: "Retail" },
  { annual_revenue: 4279591, credit_score: 556, late_payments: 5, industry: "Other" },
  { annual_revenue: 173358, credit_score: 484, late_payments: 4, industry: "Technology" },
  { annual_revenue: 3866296, credit_score: 749, late_payments: 8, industry: "Other" },
  { annual_revenue: 3793923, credit_score: 334, late_payments: 9, industry: "Technology" },
  { annual_revenue: 1267077, credit_score: 306, late_payments: 5, industry: "Technology" },
  { annual_revenue: 2536222, credit_score: 684, late_payments: 5, industry: "Other" },
  { annual_revenue: 4614937, credit_score: 440, late_payments: 3, industry: "Healthcare" },
  { annual_revenue: 1436871, credit_score: 602, late_payments: 2, industry: "Retail" },
  { annual_revenue: 3462225, credit_score: 750, late_payments: 4, industry: "Technology" },
  { annual_revenue: 4152805, credit_score: 825, late_payments: 7, industry: "Healthcare" },
  { annual_revenue: 705762, credit_score: 777, late_payments: 6, industry: "Retail" },
  { annual_revenue: 2971057, credit_score: 709, late_payments: 4, industry: "Technology" },
  { annual_revenue: 3467496, credit_score: 408, late_payments: 1, industry: "Technology" },
  { annual_revenue: 2630184, credit_score: 441, late_payments: 7, industry: "Retail" },
  { annual_revenue: 2498557, credit_score: 645, late_payments: 1, industry: "Other" },
  { annual_revenue: 3803581, credit_score: 507, late_payments: 1, industry: "Technology" },
  { annual_revenue: 3712315, credit_score: 486, late_payments: 0, industry: "Technology" },
  { annual_revenue: 3569440, credit_score: 708, late_payments: 3, industry: "Other" },
  { annual_revenue: 157402, credit_score: 386, late_payments: 0, industry: "Other" },
  { annual_revenue: 4316671, credit_score: 482, late_payments: 5, industry: "Other" },
  { annual_revenue: 1409643, credit_score: 714, late_payments: 0, industry: "Retail" },
  { annual_revenue: 3930122, credit_score: 627, late_payments: 1, industry: "Technology" },
  { annual_revenue: 4634906, credit_score: 703, late_payments: 6, industry: "Technology" },
  { annual_revenue: 1653429, credit_score: 489, late_payments: 9, industry: "Retail" },
  { annual_revenue: 2413363, credit_score: 485, late_payments: 6, industry: "Other" },
  { annual_revenue: 4553013, credit_score: 767, late_payments: 9, industry: "Retail" },
  { annual_revenue: 2295035, credit_score: 520, late_payments: 4, industry: "Healthcare" },
  { annual_revenue: 4676236, credit_score: 630, late_payments: 9, industry: "Other" },
  { annual_revenue: 350509, credit_score: 338, late_payments: 1, industry: "Retail" },
  { annual_revenue: 1402314, credit_score: 448, late_payments: 3, industry: "Other" },
  { annual_revenue: 2943352, credit_score: 705, late_payments: 3, industry: "Healthcare" },
  { annual_revenue: 503905, credit_score: 844, late_payments: 2, industry: "Technology" },
  { annual_revenue: 1142144, credit_score: 505, late_payments: 2, industry: "Other" },
  { annual_revenue: 1331885, credit_score: 805, late_payments: 5, industry: "Retail" },
  { annual_revenue: 3642431, credit_score: 555, late_payments: 9, industry: "Technology" },
  { annual_revenue: 4439089, credit_score: 709, late_payments: 6, industry: "Technology" },
  { annual_revenue: 3506092, credit_score: 623, late_payments: 7, industry: "Other" },
  { annual_revenue: 1564917, credit_score: 798, late_payments: 4, industry: "Retail" },
  { annual_revenue: 2105409, credit_score: 632, late_payments: 7, industry: "Healthcare" },
  { annual_revenue: 3454168, credit_score: 437, late_payments: 9, industry: "Healthcare" },
  { annual_revenue: 4553663, credit_score: 416, late_payments: 6, industry: "Other" },
  { annual_revenue: 1593642, credit_score: 750, late_payments: 3, industry: "Other" },
  { annual_revenue: 4790653, credit_score: 310, late_payments: 5, industry: "Technology" },
  { annual_revenue: 3943520, credit_score: 692, late_payments: 6, industry: "Retail" },
  { annual_revenue: 4147993, credit_score: 451, late_payments: 1, industry: "Healthcare" },
  { annual_revenue: 347611, credit_score: 658, late_payments: 10, industry: "Other" },
  { annual_revenue: 1880033, credit_score: 689, late_payments: 5, industry: "Technology" },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, sector, revenue, debt, loanAmount, loanPurpose, documents } = body;

    console.log("[prescreen] ANTHROPIC_API_KEY =", process.env.ANTHROPIC_API_KEY);
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const isFallbackKey = !process.env.ANTHROPIC_API_KEY;
    console.log("[prescreen] API key present:", !isFallbackKey, "| key prefix:", apiKey ? apiKey.slice(0, 12) + "..." : "none", "| fallback used:", isFallbackKey);
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key is not configured on the server." },
        { status: 500 }
      );
    }

    const prompt = `You are a senior credit risk analyst at an SME-focused bank. Based on these 50 historical SME loan cases, classify the risk of this new application and explain how it compares to similar historical cases.

Historical SME loan cases:
${JSON.stringify(HISTORICAL_CASES, null, 2)}

Loan Application:
- Company: ${company}
- Sector: ${sector}
- Annual Revenue: $${Number(revenue).toLocaleString()}
- Existing Debt: $${Number(debt).toLocaleString()}
- Loan Amount Requested: $${Number(loanAmount).toLocaleString()}
- Loan Purpose: ${loanPurpose}
- Documents Available: ${Array.isArray(documents) && documents.length > 0 ? documents.join(", ") : "None"}

Respond ONLY with valid JSON in this exact format — no markdown, no commentary:
{
  "riskClass": "low" | "medium" | "high",
  "riskScore": 0-100,
  "missingDocs": ["doc1", "doc2"],
  "recommendation": "approve" | "request_more_info" | "escalate" | "reject",
  "rationale": "2-3 sentence explanation"
}`;

    const text = await genAIWithTimeout(apiKey, prompt);

    // Strip markdown code fences if present
    const jsonStr = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const detail = err instanceof Error ? err.stack : String(err);

    // Log full error for debugging
    console.error("[prescreen] FULL ERROR:", message);
    console.error("[prescreen] STACK:", detail);

    // Detect specific error types and return descriptive messages
    if (
      message.includes("API_KEY") ||
      message.includes("api-key") ||
      message.includes("invalid") ||
      message.includes("bad request") ||
      message.includes("401") ||
      message.includes("403")
    ) {
      return NextResponse.json(
        { error: "AI API key is invalid or malformed.", detail: message },
        { status: 500 }
      );
    }
    if (
      message.includes("quota") ||
      message.includes("429") ||
      message.includes("rate limit") ||
      message.includes("limit exceeded") ||
      message.includes("timed out") ||
      message.includes("timeout")
    ) {
      return NextResponse.json(
        { error: "AI quota exceeded. Please try again later.", detail: message },
        { status: 429 }
      );
    }
    if (
      message.includes("500") ||
      message.includes("503") ||
      message.includes("service unavailable")
    ) {
      return NextResponse.json(
        { error: "AI service is temporarily unavailable. Please try again.", detail: message },
        { status: 503 }
      );
    }
    if (message.includes("fetch") || message.includes("network") || message.includes("ENOTFOUND")) {
      return NextResponse.json(
        { error: "Network error reaching AI service. Check your internet or API endpoint.", detail: message },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "AI analysis failed. See details for more information.", detail: message },
      { status: 500 }
    );
  }
}// Deployment trigger
