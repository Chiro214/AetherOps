import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Dynamically import OpenAI to avoid build-time issues
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

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

    // ── Call OpenAI to analyse the transcript ───────────────────────────
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an AI CRM analyst. Analyse the following meeting/call transcript and extract structured deal intelligence.
Return a JSON object with these fields:
- "deal_id": the deal ID if mentioned, otherwise null
- "extracted_budget": the budget/deal value as a number (no currency symbols), or null
- "new_stage": one of "discovery", "negotiation", "security_review", "closed" based on context, or null
- "ai_summary": a concise 1-2 sentence summary of the key takeaways

Return ONLY valid JSON, no additional text.`,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
    });

    const aiResponseText = completion.choices[0]?.message?.content || "{}";
    const aiResult = JSON.parse(aiResponseText) as {
      deal_id?: string | null;
      extracted_budget?: number | null;
      new_stage?: string | null;
      ai_summary?: string | null;
    };

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
