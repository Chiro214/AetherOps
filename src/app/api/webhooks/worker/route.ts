import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.AETHEROPS_WEBHOOK_SECRET || 'fallback_secret';

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized worker invocation' }, { status: 401 });
    }

    const { log_id } = await request.json();
    if (!log_id) return NextResponse.json({ error: 'Missing log_id' }, { status: 400 });

    // 2. Fetch the pending payload from dynamic sf_records
    const { data: logEntry, error: logFetchError } = await supabaseAdmin
      .from('sf_records')
      .select('*')
      .eq('id', log_id)
      .single();

    if (logFetchError || !logEntry) return NextResponse.json({ error: 'Failed to fetch log entry' }, { status: 404 });
    if (logEntry.record_data?.status === 'processed') return NextResponse.json({ message: 'Already processed' }, { status: 200 });

    try {
      // 3. Process with Gemini
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY not found");

      const systemPrompt = `You are a CRM Data Extraction Worker. Analyze payload and output JSON strictly with: first_name (string), last_name (string), email (string/null), intent (High/Medium/Low), estimated_value (number/null).
When extracting the estimated_value, you must return a pure numeric integer. Absolutely NO currency symbols ($, ₹), NO commas, and NO abbreviations (like 10k or 5M). Convert "$10k" directly to 10000. If no value is mentioned, return null.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: JSON.stringify(logEntry.record_data.payload) }] }],
          generationConfig: { 
            responseMimeType: 'application/json', 
            temperature: 0.1,
            responseSchema: {
              type: "object",
              properties: {
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string", nullable: true },
                intent: { type: "string", enum: ["High", "Medium", "Low"] },
                estimated_value: { type: "number", nullable: true }
              },
              required: ["first_name", "last_name", "intent", "estimated_value"]
            }
          }
        })
      });

      if (response.status === 429 || response.status === 503) {
        throw new Error('RATE_LIMIT');
      }
      if (!response.ok) throw new Error(`Gemini Error`);
      const data = await response.json();
      const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedLead = JSON.parse(contentText || "{}");

      // 4. Insert Lead
      let { data: leadObj } = await supabaseAdmin.from('sf_objects').select('id').eq('api_name', 'Lead').single();
      if (!leadObj) leadObj = await supabaseAdmin.from('sf_objects').insert({ api_name: 'Lead', label: 'Lead', plural_label: 'Leads', is_custom: false }).select('id').single().then(r=>r.data);
      
      const { data: insertedLead } = await supabaseAdmin.from('sf_records').insert({
          object_id: leadObj?.id,
          record_data: { ...parsedLead, status: "New", source: "webhook_engine" }
      }).select('id').single();

      // 5. Generate Draft
      const draftPrompt = `You are Chirag, the lead manager for DripSync, a premium event management company in Mumbai organizing exclusive club parties and concerts. You are reaching out to a new lead.

Task: Write an outreach email for ${parsedLead.first_name}.
Lead Intent: ${parsedLead.intent}.
Estimated Budget: ${parsedLead.estimated_value ? '$' + parsedLead.estimated_value : 'Not specified'}.

Guidelines:
- Highly personalize the opening sentence using their name and intent level.
- Keep the email concise, professional, and slightly casual (no overly corporate fluff).
- Directly reference their specific intent and estimated budget if provided.
- End with a soft call to action to chat on WhatsApp or jump on a quick call.
- Output ONLY the exact plain text of the email.`;

      const draftRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: draftPrompt }] }] })
      });

      if (draftRes.status === 429 || draftRes.status === 503) {
        throw new Error('RATE_LIMIT');
      }
      if (!draftRes.ok) throw new Error(`Gemini Error: Draft Generation Failed`);

      const dData = await draftRes.json();
      const draftText = dData.candidates?.[0]?.content?.parts?.[0]?.text || "Draft failed";

      let { data: dObj } = await supabaseAdmin.from('sf_objects').select('id').eq('api_name', 'OutreachDraft').single();
      if (!dObj) dObj = await supabaseAdmin.from('sf_objects').insert({ api_name: 'OutreachDraft', label: 'Outreach Draft', plural_label: 'Outreach Drafts', is_custom: true }).select('id').single().then(r=>r.data);
      
      await supabaseAdmin.from('sf_records').insert({
         object_id: dObj?.id, record_data: { lead_id: insertedLead?.id, draft_text: draftText, status: "Drafted" }
      });

      // 7. Mark Processed
      await supabaseAdmin.from('sf_records').update({ record_data: { ...logEntry.record_data, status: 'processed' } }).eq('id', log_id);

      return NextResponse.json({ success: true, message: 'Processed' }, { status: 200 });

    } catch (err: any) {
      if (err.message === 'RATE_LIMIT') {
        const retries = logEntry.record_data.retry_count || 0;
        const maxRetries = 3;
        
        if (retries < maxRetries) {
          // Keep state as 'pending' but increment retry count
          await supabaseAdmin.from('sf_records')
            .update({ record_data: { ...logEntry.record_data, status: 'pending', retry_count: retries + 1 } })
            .eq('id', log_id);
          
          // Throw the error so the queue provider knows to auto-retry with exponential backoff
          throw err;
        }
      }

      // If max retries exhausted or it's a structural error, mark as 'error'
      await supabaseAdmin.from('sf_records').update({ record_data: { ...logEntry.record_data, status: 'error', error: err.message } }).eq('id', log_id);
      return NextResponse.json({ error: 'Worker failed', details: err.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
