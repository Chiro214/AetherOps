import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Finding {
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  clause: string;
  description: string;
}

export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    // Validate inputs
    const body = await req.json();
    const { contract_text, contract_name, deal_id } = body as {
      contract_text?: string;
      contract_name?: string;
      deal_id?: string;
    };

    if (!contract_text || typeof contract_text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'contract_text' field" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const resolvedContractName = contract_name || "Unknown Contract";

    // ── Call Gemini to scan for vulnerabilities ─────────────────────────
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contract_text,
        config: {
            systemInstruction: `You are a contract compliance and VAPT (Vulnerability Assessment) specialist. Analyse the following contract text for business and legal vulnerabilities.

Look specifically for:
- Missing GDPR / data protection clauses
- Unlimited or uncapped liability exposure
- Missing termination-for-convenience clause
- Excessive lock-in periods
- Ambiguous IP ownership or assignment
- Missing SLA definitions
- Missing auto-deletion or data retention compliance
- Missing insurance or indemnification caps

Return a JSON object with a single key "findings" containing an array of objects. Each object should have:
- "severity": "CRITICAL", "HIGH", or "MEDIUM"
- "clause": a short clause reference (e.g., "§14.2 — Liability Cap") or "General" if no specific clause
- "description": a concise 1-sentence description of the vulnerability

If no vulnerabilities are found, return { "findings": [] }.
Return ONLY valid JSON, no additional text.`,
            responseMimeType: "application/json",
            temperature: 0.1,
        }
    });

    const aiResponseText = response.text || "{}";
    let aiResult: { findings?: Finding[] } = {};
    
    try {
        aiResult = JSON.parse(aiResponseText);
    } catch(e) {
        console.error("Failed to parse Gemini JSON output:", aiResponseText);
    }
    const findings: Finding[] = aiResult.findings || [];

    // ── Insert vulnerabilities into contract_vulnerabilities ─────────────
    const criticalOrHigh = findings.filter(
      (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
    );

    if (findings.length > 0) {
      const rows = findings.map((f) => ({
        severity: f.severity,
        clause: f.clause,
        description: f.description,
        contract_name: resolvedContractName,
      }));

      await supabaseAdmin.from("contract_vulnerabilities").insert(rows);
    }

    // ── If critical/high findings exist and deal_id provided, flag the deal
    if (deal_id && criticalOrHigh.length > 0) {
      await supabaseAdmin
        .from("deals")
        .update({
          compliance_status: "Flagged",
          has_compliance_flag: true,
        })
        .eq("id", deal_id);
    }

    // ── Insert a log entry ──────────────────────────────────────────────
    await supabaseAdmin.from("intelligence_logs").insert({
      type: "compliance",
      title: `VAPT Scan — ${resolvedContractName}`,
      summary:
        findings.length > 0
          ? `${findings.length} vulnerabilities found (${criticalOrHigh.length} critical/high). Contract flagged for review.`
          : "No vulnerabilities detected. Contract passed compliance scan.",
    });

    return NextResponse.json({
      success: true,
      contract_name: resolvedContractName,
      total_findings: findings.length,
      critical_high_count: criticalOrHigh.length,
      findings,
    });
  } catch (error) {
    console.error("[/api/scan] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
