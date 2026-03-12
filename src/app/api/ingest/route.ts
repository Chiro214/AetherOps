import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    // Validate inputs
    const body = await req.json();
    const { transcript, deal_id } = body as {
      transcript?: string;
      deal_id?: string;
    };

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'transcript' field" },
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

    // ── Call Gemini to analyse the transcript ───────────────────────────
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: transcript,
        config: {
            systemInstruction: `You are an AI CRM analyst. Analyse the following meeting/call transcript and extract structured deal intelligence.
Return a JSON object with these fields:
- "deal_id": the deal ID if mentioned, otherwise null
- "extracted_budget": the budget/deal value as a number (no currency symbols), or null
- "new_stage": one of "Discovery", "Negotiation", "Security Review", or "Closed" based on context, or null
- "ai_summary": a concise 1-2 sentence summary of the key takeaways

Return ONLY valid JSON, no additional text.`,
            responseMimeType: "application/json",
            temperature: 0.2,
        }
    });

    const aiResponseText = response.text || "{}";
    let aiResult: {
      deal_id?: string | null;
      extracted_budget?: number | null;
      new_stage?: string | null;
      ai_summary?: string | null;
    } = {};

    try {
        aiResult = JSON.parse(aiResponseText);
    } catch (e) {
        console.error("Failed to parse Gemini JSON output:", aiResponseText);
    }

    // Use provided deal_id or the one extracted by AI
    const resolvedDealId = deal_id || aiResult.deal_id;

    // ── Update the deal if we have a deal_id ────────────────────────────
    if (resolvedDealId) {
      const updatePayload: Record<string, unknown> = {};
      if (aiResult.new_stage) updatePayload.column_name = aiResult.new_stage;
      if (aiResult.extracted_budget)
        updatePayload.value = aiResult.extracted_budget;
      if (aiResult.ai_summary) updatePayload.ai_summary = aiResult.ai_summary;

      if (Object.keys(updatePayload).length > 0) {
        await supabaseAdmin
          .from("deals")
          .update(updatePayload)
          .eq("id", resolvedDealId);
      }
    }

    // ── Insert into intelligence_logs ───────────────────────────────────
    await supabaseAdmin.from("intelligence_logs").insert({
      type: "call",
      title: resolvedDealId
        ? `Transcript Analysed — Deal ${resolvedDealId}`
        : "Transcript Analysed",
      summary:
        aiResult.ai_summary || "Transcript processed. No key insights extracted.",
    });

    return NextResponse.json({
      success: true,
      deal_id: resolvedDealId,
      extracted_budget: aiResult.extracted_budget,
      new_stage: aiResult.new_stage,
      ai_summary: aiResult.ai_summary,
    });
  } catch (error) {
    console.error("[/api/ingest] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
